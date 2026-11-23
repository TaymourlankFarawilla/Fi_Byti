const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const { authenticateToken, requireRole, requireApprovedSeller } = require('../middleware/authMiddleware');
const { uploadVerificationDoc, uploadProductImages } = require('../middleware/uploadMiddleware');
const { sendOrderStatusWhatsAppNotification } = require('../services/whatsappService');

// Require seller role for all routes in this file
router.use(authenticateToken, requireRole('SELLER'));

// Get Seller Profile & Verification status
router.get('/profile', (req, res) => {
  const profile = db.prepare('SELECT * FROM seller_profiles WHERE user_id = ?').get(req.user.id);
  if (!profile) {
    return res.status(404).json({ error: 'Seller profile not found.' });
  }

  const doc = db.prepare('SELECT id, original_filename, file_type, file_size, uploaded_at FROM seller_verification_docs WHERE seller_profile_id = ? ORDER BY uploaded_at DESC LIMIT 1').get(profile.id);

  return res.json({
    profile,
    verificationDoc: doc || null
  });
});

// Update Seller Profile Store Details
router.put('/profile', (req, res) => {
  const { storeName, storeBio, city, governorate, addressDetails, pickupAvailable } = req.body;
  const profile = req.sellerProfile;

  if (!profile) {
    return res.status(404).json({ error: 'Seller profile not found.' });
  }

  db.prepare(`
    UPDATE seller_profiles
    SET store_name = ?, store_bio = ?, city = ?, governorate = ?, address_details = ?, pickup_available = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    storeName || profile.store_name,
    storeBio !== undefined ? storeBio : profile.store_bio,
    city || profile.city,
    governorate || profile.governorate,
    addressDetails || profile.address_details,
    pickupAvailable !== undefined ? (pickupAvailable ? 1 : 0) : profile.pickup_available,
    profile.id
  );

  const updated = db.prepare('SELECT * FROM seller_profiles WHERE id = ?').get(profile.id);
  return res.json({ message: 'Store profile updated successfully.', profile: updated });
});

// Upload Identity Verification Document (PDF/JPG/PNG <= 5MB)
router.post('/verify', (req, res) => {
  uploadVerificationDoc.single('identityDocument')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please select an identity document in PDF, JPG, or PNG format (max 5 MB).' });
    }

    const profile = req.sellerProfile;
    if (!profile) {
      return res.status(404).json({ error: 'Seller profile not found.' });
    }

    const docId = uuidv4();

    db.transaction(() => {
      // Record verification document metadata
      db.prepare(`
        INSERT INTO seller_verification_docs (id, seller_profile_id, original_filename, stored_filename, file_type, file_size)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(docId, profile.id, req.file.originalname, req.file.filename, req.file.mimetype, req.file.size);

      // Update seller status to PENDING_VERIFICATION
      db.prepare(`
        UPDATE seller_profiles
        SET status = 'PENDING_VERIFICATION', verification_submitted_at = CURRENT_TIMESTAMP, rejection_reason = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(profile.id);
    })();

    const updatedProfile = db.prepare('SELECT * FROM seller_profiles WHERE id = ?').get(profile.id);

    return res.json({
      message: 'Identity verification document uploaded successfully. An administrator will review your application shortly.',
      profile: updatedProfile,
      document: {
        id: docId,
        originalFilename: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }
    });
  });
});

// List Seller's Products
router.get('/products', (req, res) => {
  const profile = req.sellerProfile;
  if (!profile) return res.status(404).json({ error: 'Seller profile not found.' });

  const products = db.prepare(`
    SELECT p.*, c.name as category_name,
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.seller_profile_id = ?
    ORDER BY p.created_at DESC
  `).all(profile.id);

  return res.json({ products });
});

// Create Product Listing (Requires APPROVED seller status)
router.post('/products', requireApprovedSeller, (req, res) => {
  uploadProductImages.array('photos', 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { name, categoryId, description, priceEgp, materials, sizeDimensions, weightKg, packagingDetails, productionTimeDays, stockQuantity, status } = req.body;

    // Fall back to first category if categoryId is empty string
    let finalCatId = categoryId;
    if (!finalCatId) {
      const firstCat = db.prepare('SELECT id FROM categories ORDER BY name ASC LIMIT 1').get();
      finalCatId = firstCat ? firstCat.id : 'cat-pottery';
    }

    if (!name || !description || priceEgp === undefined || !materials) {
      return res.status(400).json({ error: 'Please provide all required product details: Title, Category, Description, Price, and Materials.' });
    }

    const profile = req.sellerProfile;
    const productId = uuidv4();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);

    const price = parseFloat(priceEgp) || 100;
    const weight = parseFloat(weightKg) || 0.5;
    const leadTime = parseInt(productionTimeDays) || 1;
    const stock = parseInt(stockQuantity) >= 0 ? parseInt(stockQuantity) : 10;
    const finalSize = sizeDimensions ? sizeDimensions.trim() : 'Standard';
    const finalPackaging = packagingDetails ? packagingDetails.trim() : 'Standard protective craft box';

    db.transaction(() => {
      db.prepare(`
        INSERT INTO products (id, seller_profile_id, category_id, name, slug, description, price_egp, materials, size_dimensions, weight_kg, packaging_details, production_time_days, stock_quantity, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(productId, profile.id, finalCatId, name.trim(), slug, description.trim(), price, materials.trim(), finalSize, weight, finalPackaging, leadTime, stock, status || 'PUBLISHED');

      // Process uploaded files if any
      let imageAttached = false;
      if (req.files && req.files.length > 0) {
        imageAttached = true;
        req.files.forEach((file, index) => {
          const imgId = uuidv4();
          const imageUrl = `/uploads/product_images/${file.filename}`;
          db.prepare(`
            INSERT INTO product_images (id, product_id, image_url, is_primary, sort_order)
            VALUES (?, ?, ?, ?, ?)
          `).run(imgId, productId, imageUrl, index === 0 ? 1 : 0, index);
        });
      }

      if (!imageAttached && req.body.existingPhotoUrls) {
        const urls = Array.isArray(req.body.existingPhotoUrls) ? req.body.existingPhotoUrls : [req.body.existingPhotoUrls];
        if (urls.length > 0 && urls[0]) {
          imageAttached = true;
          urls.forEach((url, index) => {
            const imgId = uuidv4();
            db.prepare(`
              INSERT INTO product_images (id, product_id, image_url, is_primary, sort_order)
              VALUES (?, ?, ?, ?, ?)
            `).run(imgId, productId, url, index === 0 ? 1 : 0, index);
          });
        }
      }

      // Default fallback image if no photo uploaded or provided
      if (!imageAttached) {
        const defaultPlaceholder = 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80';
        db.prepare(`
          INSERT INTO product_images (id, product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, ?, 1, 0)
        `).run(uuidv4(), productId, defaultPlaceholder);
      }
    })();

    const createdProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    const images = db.prepare('SELECT * FROM product_images WHERE product_id = ?').all(productId);

    return res.status(201).json({
      message: 'Handmade product published successfully.',
      product: createdProduct,
      images
    });
  });
});

// Update Product Listing
router.put('/products/:id', requireApprovedSeller, (req, res) => {
  const profile = req.sellerProfile;
  const productId = req.params.id;

  const existing = db.prepare('SELECT * FROM products WHERE id = ? AND seller_profile_id = ?').get(productId, profile.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product listing not found or unauthorized.' });
  }

  const { name, categoryId, description, priceEgp, materials, sizeDimensions, weightKg, packagingDetails, productionTimeDays, stockQuantity, status } = req.body;

  db.prepare(`
    UPDATE products
    SET name = ?, category_id = ?, description = ?, price_egp = ?, materials = ?, size_dimensions = ?, weight_kg = ?, packaging_details = ?, production_time_days = ?, stock_quantity = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND seller_profile_id = ?
  `).run(
    name !== undefined ? name.trim() : existing.name,
    categoryId || existing.category_id,
    description !== undefined ? description.trim() : existing.description,
    priceEgp !== undefined ? parseFloat(priceEgp) : existing.price_egp,
    materials !== undefined ? materials.trim() : existing.materials,
    sizeDimensions !== undefined ? sizeDimensions.trim() : existing.size_dimensions,
    weightKg !== undefined ? parseFloat(weightKg) : existing.weight_kg,
    packagingDetails !== undefined ? packagingDetails.trim() : existing.packaging_details,
    productionTimeDays !== undefined ? parseInt(productionTimeDays) : existing.production_time_days,
    stockQuantity !== undefined ? parseInt(stockQuantity) : existing.stock_quantity,
    status || existing.status,
    productId,
    profile.id
  );

  const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  return res.json({ message: 'Product updated successfully.', product: updatedProduct });
});

// Delete Product Listing
router.delete('/products/:id', requireApprovedSeller, (req, res) => {
  const profile = req.sellerProfile;
  const productId = req.params.id;

  const existing = db.prepare('SELECT * FROM products WHERE id = ? AND seller_profile_id = ?').get(productId, profile.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product listing not found or unauthorized.' });
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(productId);
  return res.json({ message: 'Product deleted successfully.' });
});

// View Seller's Orders & Shipments
router.get('/orders', (req, res) => {
  const profile = req.sellerProfile;
  if (!profile) return res.status(404).json({ error: 'Seller profile not found.' });

  const shipments = db.prepare(`
    SELECT s.*, o.shipping_full_name, o.shipping_phone, o.shipping_address, o.shipping_city, o.shipping_governorate, o.payment_method, o.payment_status, o.created_at as order_date
    FROM order_shipments s
    JOIN orders o ON s.order_id = o.id
    WHERE s.seller_profile_id = ?
    ORDER BY s.created_at DESC
  `).all(profile.id);

  const shipmentsWithItems = shipments.map(shipment => {
    const items = db.prepare('SELECT * FROM order_items WHERE shipment_id = ?').all(shipment.id);
    return { ...shipment, items };
  });

  return res.json({ shipments: shipmentsWithItems });
});

// Update Order Shipment Fulfillment Status & Trigger WhatsApp Notification
router.patch('/shipments/:shipmentId/status', requireApprovedSeller, async (req, res) => {
  const profile = req.sellerProfile;
  const shipmentId = req.params.shipmentId;
  const { fulfillmentStatus, trackingNumber, carrierNotes } = req.body;

  const validStatuses = ['CONFIRMED', 'IN_SHIPMENT', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(fulfillmentStatus)) {
    return res.status(400).json({ error: `Invalid status. Allowed values: ${validStatuses.join(', ')}` });
  }

  const shipment = db.prepare('SELECT * FROM order_shipments WHERE id = ? AND seller_profile_id = ?').get(shipmentId, profile.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment record not found.' });
  }

  db.prepare(`
    UPDATE order_shipments
    SET fulfillment_status = ?, tracking_number = ?, carrier_notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    fulfillmentStatus,
    trackingNumber !== undefined ? trackingNumber : shipment.tracking_number,
    carrierNotes !== undefined ? carrierNotes : shipment.carrier_notes,
    shipmentId
  );

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(shipment.order_id);
  const updatedShipment = db.prepare('SELECT * FROM order_shipments WHERE id = ?').get(shipmentId);

  // Trigger WhatsApp notification service with fallback Demo Mode
  const whatsappResult = await sendOrderStatusWhatsAppNotification({
    order,
    shipment: updatedShipment,
    newStatus: fulfillmentStatus
  });

  return res.json({
    message: `Shipment status updated to ${fulfillmentStatus}.`,
    shipment: updatedShipment,
    whatsappNotification: whatsappResult
  });
});

// Seller Financial & Commission Summary (98% Net, 2% Commission)
router.get('/analytics', (req, res) => {
  const profile = req.sellerProfile;
  if (!profile) return res.status(404).json({ error: 'Seller profile not found.' });

  const totals = db.prepare(`
    SELECT
      COALESCE(SUM(seller_subtotal_egp), 0) as gross_sales_egp,
      COALESCE(SUM(seller_commission_egp), 0) as platform_commission_egp,
      COALESCE(SUM(seller_net_amount_egp), 0) as net_payout_egp,
      COUNT(id) as total_shipments
    FROM order_shipments
    WHERE seller_profile_id = ? AND fulfillment_status != 'CANCELLED'
  `).get(profile.id);

  return res.json({
    summary: {
      grossSalesEgp: totals.gross_sales_egp,
      platformCommissionEgp: totals.platform_commission_egp, // 2%
      netPayoutEgp: totals.net_payout_egp,                   // 98%
      commissionRatePercent: 2,
      totalShipments: totals.total_shipments
    }
  });
});

module.exports = router;
