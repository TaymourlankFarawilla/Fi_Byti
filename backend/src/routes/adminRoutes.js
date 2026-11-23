const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db/db');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');
const { verificationDocsDir } = require('../middleware/uploadMiddleware');
const { createDatabaseBackup } = require('../services/backupService');

// Protect all admin routes
router.use(authenticateToken, requireRole('ADMIN'));

// Get Pending Seller Verification Requests
router.get('/verifications', (req, res) => {
  const pendingRequests = db.prepare(`
    SELECT sp.*, u.full_name as user_full_name, u.email as user_email, u.phone_number as user_phone,
      d.id as doc_id, d.original_filename, d.file_type, d.file_size, d.uploaded_at
    FROM seller_profiles sp
    JOIN users u ON sp.user_id = u.id
    LEFT JOIN seller_verification_docs d ON sp.id = d.seller_profile_id
    WHERE sp.status = 'PENDING_VERIFICATION'
    ORDER BY sp.verification_submitted_at DESC
  `).all();

  const allSellers = db.prepare(`
    SELECT sp.*, u.full_name as user_full_name, u.email as user_email, u.phone_number as user_phone,
      (SELECT COUNT(*) FROM products WHERE seller_profile_id = sp.id) as product_count
    FROM seller_profiles sp
    JOIN users u ON sp.user_id = u.id
    ORDER BY sp.created_at DESC
  `).all();

  return res.json({
    pendingCount: pendingRequests.length,
    pendingRequests,
    allSellers
  });
});

// Secure endpoint to access identity verification document (Strictly protected for Admins)
router.get('/verifications/docs/:docId', (req, res) => {
  const doc = db.prepare('SELECT * FROM seller_verification_docs WHERE id = ?').get(req.params.docId);
  if (!doc) {
    return res.status(404).json({ error: 'Verification document record not found.' });
  }

  const filePath = path.join(verificationDocsDir, doc.stored_filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Physical file missing on server.' });
  }

  res.setHeader('Content-Type', doc.file_type);
  res.setHeader('Content-Disposition', `inline; filename="${doc.original_filename}"`);
  return res.sendFile(filePath);
});

// Approve or Reject Seller Verification Request
router.post('/verifications/:sellerProfileId/review', (req, res) => {
  const { sellerProfileId } = req.params;
  const { decision, rejectionReason } = req.body; // decision: 'APPROVE' or 'REJECT'

  if (!['APPROVE', 'REJECT'].includes(decision)) {
    return res.status(400).json({ error: "Decision must be 'APPROVE' or 'REJECT'." });
  }

  const seller = db.prepare('SELECT * FROM seller_profiles WHERE id = ?').get(sellerProfileId);
  if (!seller) {
    return res.status(404).json({ error: 'Seller profile not found.' });
  }

  const newStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';

  db.prepare(`
    UPDATE seller_profiles
    SET status = ?, rejection_reason = ?, verification_reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newStatus, decision === 'REJECT' ? (rejectionReason || 'Identity verification document rejected by administrator.') : null, sellerProfileId);

  const updatedSeller = db.prepare('SELECT * FROM seller_profiles WHERE id = ?').get(sellerProfileId);

  return res.json({
    message: `Seller status updated to ${newStatus}.`,
    seller: updatedSeller
  });
});

// Manage Users
router.get('/users', (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.email, u.full_name, u.phone_number, u.role, u.created_at,
      sp.store_name, sp.status as seller_status
    FROM users u
    LEFT JOIN seller_profiles sp ON u.id = sp.user_id
    ORDER BY u.created_at DESC
  `).all();
  return res.json({ users });
});

// Manage Products Oversight
router.get('/products', (req, res) => {
  const products = db.prepare(`
    SELECT p.*, c.name as category_name, sp.store_name, u.full_name as seller_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN seller_profiles sp ON p.seller_profile_id = sp.id
    JOIN users u ON sp.user_id = u.id
    ORDER BY p.created_at DESC
  `).all();
  return res.json({ products });
});

// Admin Toggle Product Status
router.patch('/products/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['PUBLISHED', 'UNLISTED', 'OUT_OF_STOCK'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  db.prepare('UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
  return res.json({ message: `Product status updated to ${status}.` });
});

// Financial Dashboard & 2% Platform Commission Summary
router.get('/financials', (req, res) => {
  const financialTotals = db.prepare(`
    SELECT
      COALESCE(SUM(total_amount_egp), 0) as grand_total_gmv,
      COALESCE(SUM(subtotal_egp), 0) as total_products_subtotal,
      COALESCE(SUM(total_platform_commission_egp), 0) as total_platform_commission_2_percent,
      COALESCE(SUM(total_shipping_egp), 0) as total_shipping_collected,
      COALESCE(SUM(total_gateway_fee_egp), 0) as total_gateway_fees,
      COUNT(id) as total_orders
    FROM orders
    WHERE status != 'CANCELLED'
  `).get();

  const sellerBreakdown = db.prepare(`
    SELECT sp.store_name, u.email,
      COALESCE(SUM(os.seller_subtotal_egp), 0) as seller_gross_sales,
      COALESCE(SUM(os.seller_commission_egp), 0) as platform_commission_collected,
      COALESCE(SUM(os.seller_net_amount_egp), 0) as seller_net_payout
    FROM seller_profiles sp
    JOIN users u ON sp.user_id = u.id
    LEFT JOIN order_shipments os ON sp.id = os.seller_profile_id
    GROUP BY sp.id
    ORDER BY seller_gross_sales DESC
  `).all();

  return res.json({
    summary: {
      grandTotalGmv: financialTotals.grand_total_gmv,
      totalProductsSubtotal: financialTotals.total_products_subtotal,
      totalPlatformCommission: financialTotals.total_platform_commission_2_percent,
      commissionRate: '2%',
      totalShippingCollected: financialTotals.total_shipping_collected,
      totalGatewayFees: financialTotals.total_gateway_fees,
      totalOrders: financialTotals.total_orders
    },
    sellerBreakdown
  });
});

// WhatsApp Audit Logs Inspector
router.get('/whatsapp-logs', (req, res) => {
  const logs = db.prepare(`
    SELECT wl.*, o.shipping_full_name, o.shipping_city
    FROM whatsapp_logs wl
    JOIN orders o ON wl.order_id = o.id
    ORDER BY wl.created_at DESC
    LIMIT 50
  `).all();

  return res.json({ logs });
});

// Trigger Database Backup
router.post('/backups', (req, res) => {
  try {
    const backup = createDatabaseBackup('MANUAL');
    return res.json({
      message: 'Database backup completed successfully.',
      backup
    });
  } catch (err) {
    console.error('Backup error:', err);
    return res.status(500).json({ error: 'Failed to create database backup.' });
  }
});

// List Database Backups
router.get('/backups', (req, res) => {
  const backups = db.prepare('SELECT * FROM database_backups ORDER BY created_at DESC').all();
  return res.json({ backups });
});

module.exports = router;
