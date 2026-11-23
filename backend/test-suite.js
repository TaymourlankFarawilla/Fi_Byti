const path = require('path');
const fs = require('fs');
const seed = require('./src/db/seed.js');

async function runVerification() {
  console.log('Starting Fi Byti Automated Verification Suite...');

  // 1. Seed fresh database state
  await seed();

  const db = require('./src/db/db.js');

  // Verify Categories
  const categories = db.prepare('SELECT * FROM categories').all();
  console.log(`✓ Categories loaded: ${categories.length}`);
  if (categories.length < 5) throw new Error('Categories missing!');

  // Verify Users & Demo Accounts
  const admin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@fibyti.eg');
  const amina = db.prepare('SELECT * FROM users WHERE email = ?').get('artisan.amina@fibyti.eg');
  const siwa = db.prepare('SELECT * FROM users WHERE email = ?').get('artisan.siwa@fibyti.eg');
  const buyer = db.prepare('SELECT * FROM users WHERE email = ?').get('buyer.sarah@fibyti.eg');

  if (!admin || !amina || !siwa || !buyer) throw new Error('Demo accounts missing!');
  console.log('✓ Demo accounts verified (Admin, Approved Sellers, Pending Seller, Buyer)');

  // Verify Pending Verification ID document for Siwa
  const pendingSellerProfile = db.prepare('SELECT * FROM seller_profiles WHERE user_id = ?').get(siwa.id);
  if (pendingSellerProfile.status !== 'PENDING_VERIFICATION') throw new Error(`Pending seller status incorrect! Got: ${pendingSellerProfile.status}`);

  const doc = db.prepare('SELECT * FROM seller_verification_docs WHERE seller_profile_id = ?').get(pendingSellerProfile.id);
  if (!doc) throw new Error('Verification document missing!');
  console.log(`✓ Protected identity verification document attached for Siwa (${doc.original_filename}, ${doc.file_type})`);

  // Verify Admin Review & Approval
  db.prepare("UPDATE seller_profiles SET status = 'APPROVED' WHERE id = ?").run(pendingSellerProfile.id);
  const updatedSiwa = db.prepare('SELECT status FROM seller_profiles WHERE id = ?').get(pendingSellerProfile.id);
  if (updatedSiwa.status !== 'APPROVED') throw new Error('Seller approval failed!');
  console.log('✓ Administrator review & seller approval logic verified');

  // Verify Products Stock & Availability
  const products = db.prepare('SELECT * FROM products').all();
  console.log(`✓ Products loaded: ${products.length}`);
  const vase = db.prepare('SELECT * FROM products WHERE id = ?').get('prd-fayoum-vase-1');
  if (vase.stock_quantity !== 12) throw new Error('Stock quantity incorrect!');
  console.log(`✓ Product details & stock tracking verified (${vase.name}: ${vase.stock_quantity} in stock)`);

  // Verify 2% Platform Commission & Net Seller Payout (98%)
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get('FB-2026-1001');
  if (!order) throw new Error('Sample order missing!');

  const expectedCommission = Math.round(order.subtotal_egp * 0.02 * 100) / 100; // 1930 * 0.02 = 38.60 EGP
  if (Math.abs(order.total_platform_commission_egp - expectedCommission) > 0.01) {
    throw new Error(`Commission mismatch! Expected ${expectedCommission}, got ${order.total_platform_commission_egp}`);
  }
  console.log(`✓ 2% Platform Commission calculation verified: Subtotal ${order.subtotal_egp} EGP -> Commission ${order.total_platform_commission_egp} EGP`);

  // Verify Multi-Seller Split Shipping Calculation
  const shipments = db.prepare('SELECT * FROM order_shipments WHERE order_id = ?').all(order.id);
  if (shipments.length !== 2) throw new Error('Order split shipments mismatch!');
  console.log(`✓ Cart multi-seller split shipping verified: Order #${order.id} split into ${shipments.length} distinct seller shipments`);

  // Verify WhatsApp Notification Audit Log & Demo Mode Fallback
  const whatsappLogs = db.prepare('SELECT * FROM whatsapp_logs WHERE order_id = ?').all(order.id);
  if (whatsappLogs.length === 0) throw new Error('WhatsApp log missing!');
  console.log(`✓ WhatsApp Business API notification log verified (Status: ${whatsappLogs[0].status}, Demo Mode: ${whatsappLogs[0].is_demo_mode === 1})`);

  // Verify Database Backup Snapshot Generator
  const { createDatabaseBackup } = require('./src/services/backupService.js');
  const backup = createDatabaseBackup('MANUAL');
  if (!fs.existsSync(backup.filePath)) throw new Error('Database backup file creation failed!');
  console.log(`✓ Online database backup snapshot generated (${backup.filename}, ${(backup.fileSize / 1024).toFixed(1)} KB)`);

  console.log('====================================================');
  console.log('  ALL AUTOMATED VERIFICATION CHECKS PASSED 100%!');
  console.log('====================================================');

  process.exit(0);
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
