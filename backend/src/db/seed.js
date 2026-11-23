const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const db = require('./db');

async function seed() {
  console.log('Seeding Fi Byti database with realistic Egyptian artisan data...');

  // Ensure upload dirs exist
  const verificationDocsDir = path.join(__dirname, '../../uploads/verification_docs');
  const productImagesDir = path.join(__dirname, '../../uploads/product_images');
  fs.mkdirSync(verificationDocsDir, { recursive: true });
  fs.mkdirSync(productImagesDir, { recursive: true });

  // Create a dummy ID file for pending seller
  const sampleIdPath = path.join(verificationDocsDir, 'id-doc-sample-siwa.pdf');
  if (!fs.existsSync(sampleIdPath)) {
    fs.writeFileSync(sampleIdPath, '%PDF-1.4 ... Sample Egyptian National Identity Card (PDF 1.5MB) for Verification ...');
  }

  // Clear existing tables
  db.exec('DELETE FROM whatsapp_logs');
  db.exec('DELETE FROM order_items');
  db.exec('DELETE FROM order_shipments');
  db.exec('DELETE FROM orders');
  db.exec('DELETE FROM product_images');
  db.exec('DELETE FROM products');
  db.exec('DELETE FROM categories');
  db.exec('DELETE FROM seller_verification_docs');
  db.exec('DELETE FROM seller_profiles');
  db.exec('DELETE FROM users');
  db.exec('DELETE FROM database_backups');

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const sellerPasswordHash = await bcrypt.hash('Seller123!', 10);
  const buyerPasswordHash = await bcrypt.hash('Buyer123!', 10);

  // 1. Categories
  const categoriesData = [
    { id: 'cat-pottery', name: 'Pottery & Ceramics', slug: 'pottery-ceramics', description: 'Handcrafted Egyptian earthenware, glazed clay vases, and Fayoum pottery.', image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-textiles', name: 'Handwoven Textiles', slug: 'handwoven-textiles', description: 'Authentic Akhmim cotton throws, bedspreads, and hand-loomed rugs.', image_url: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-leather', name: 'Artisan Leathercraft', slug: 'artisan-leathercraft', description: 'Genuine Egyptian leather bags, hand-carved poufs, and footwear.', image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-jewelry', name: 'Fine Egyptian Jewelry', slug: 'fine-egyptian-jewelry', description: 'Sterling silver filigree, brass cartouches, and turquoise beadwork.', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-wood', name: 'Woodwork & Carvings', slug: 'woodwork-carvings', description: 'Mother-of-pearl inlaid boxes, olive wood bowls, and Islamic geometric screens.', image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80' }
  ];

  for (const cat of categoriesData) {
    db.prepare('INSERT INTO categories (id, name, slug, description, image_url) VALUES (?, ?, ?, ?, ?)').run(cat.id, cat.name, cat.slug, cat.description, cat.image_url);
  }

  // 2. Users & Seller Profiles
  // Admin
  const adminId = 'usr-admin-1';
  db.prepare('INSERT INTO users (id, email, password_hash, full_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)').run(
    adminId, 'admin@fibyti.eg', passwordHash, 'Platform Administrator', '+201001112233', 'ADMIN'
  );

  // Seller 1: Amina (Approved)
  const seller1UserId = 'usr-seller-amina';
  const seller1ProfileId = 'sel-amina-ceramics';
  db.prepare('INSERT INTO users (id, email, password_hash, full_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)').run(
    seller1UserId, 'artisan.amina@fibyti.eg', sellerPasswordHash, 'Amina El-Fayoumi', '+201012345678', 'SELLER'
  );
  db.prepare(`
    INSERT INTO seller_profiles (id, user_id, store_name, store_bio, city, governorate, address_details, pickup_available, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    seller1ProfileId, seller1UserId, 'Amina Fayoum Clay Studio', 'Third-generation Fayoum pottery artisan preserving traditional Tunis Village clay glazing techniques.', 'Fayoum', 'Fayoum', 'Tunis Village, Main Workshop Road', 1, 'APPROVED'
  );

  // Seller 2: Nile Looms (Approved)
  const seller2UserId = 'usr-seller-nile';
  const seller2ProfileId = 'sel-nile-looms';
  db.prepare('INSERT INTO users (id, email, password_hash, full_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)').run(
    seller2UserId, 'artisan.nile@fibyti.eg', sellerPasswordHash, 'Youssef Akhmim', '+201023456789', 'SELLER'
  );
  db.prepare(`
    INSERT INTO seller_profiles (id, user_id, store_name, store_bio, city, governorate, address_details, pickup_available, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    seller2ProfileId, seller2UserId, 'Nile Looms Handwoven Textiles', 'Master loom weavers from Akhmim, Sohag, crafting 100% Egyptian cotton home textiles.', 'Sohag', 'Sohag', 'Akhmim Weavers District, Studio 12', 1, 'APPROVED'
  );

  // Seller 3: Khan El-Khalili Leather (Approved)
  const seller3UserId = 'usr-seller-tarek';
  const seller3ProfileId = 'sel-khedive-leather';
  db.prepare('INSERT INTO users (id, email, password_hash, full_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)').run(
    seller3UserId, 'artisan.tarek@fibyti.eg', sellerPasswordHash, 'Tarek Leatherworks', '+201034567890', 'SELLER'
  );
  db.prepare(`
    INSERT INTO seller_profiles (id, user_id, store_name, store_bio, city, governorate, address_details, pickup_available, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    seller3ProfileId, seller3UserId, 'Khedive Handmade Leather', 'Hand-embossed full grain leather bags and traditional ottomans made in Historic Cairo.', 'Cairo', 'Cairo', 'Khan El-Khalili, Al-Muizz Street #44', 0, 'APPROVED'
  );

  // Seller 4: Siwa Crafts (Pending Verification)
  const seller4UserId = 'usr-seller-siwa';
  const seller4ProfileId = 'sel-siwa-crafts';
  db.prepare('INSERT INTO users (id, email, password_hash, full_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)').run(
    seller4UserId, 'artisan.siwa@fibyti.eg', sellerPasswordHash, 'Fatima Siwi', '+201045678901', 'SELLER'
  );
  db.prepare(`
    INSERT INTO seller_profiles (id, user_id, store_name, store_bio, city, governorate, address_details, pickup_available, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    seller4ProfileId, seller4UserId, 'Siwa Oasis Salt & Silver', 'Hand-carved crystalline salt lamps and authentic Amazigh embroidered wool shawls from Siwa Oasis.', 'Siwa', 'Matrouh', 'Shali Fortress District', 1, 'PENDING_VERIFICATION'
  );
  db.prepare(`
    INSERT INTO seller_verification_docs (id, seller_profile_id, original_filename, stored_filename, file_type, file_size)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('doc-siwa-id', seller4ProfileId, 'Fatima_Siwa_National_ID.pdf', 'id-doc-sample-siwa.pdf', 'application/pdf', 1572864);

  // Buyer
  const buyerId = 'usr-buyer-sarah';
  db.prepare('INSERT INTO users (id, email, password_hash, full_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?)').run(
    buyerId, 'buyer.sarah@fibyti.eg', buyerPasswordHash, 'Sarah Mansour', '+201099887766', 'BUYER'
  );

  // 3. Products
  const productsData = [
    {
      id: 'prd-fayoum-vase-1',
      seller_profile_id: seller1ProfileId,
      category_id: 'cat-pottery',
      name: 'Fayoum Turquoise Glazed Clay Vase',
      slug: 'fayoum-turquoise-glazed-clay-vase',
      description: 'Hand-thrown earthenware clay vase crafted by master potters in Tunis Village, Fayoum. Features traditional oxide turquoise glazing and palm motif engravings.',
      price_egp: 680,
      materials: 'Natural Fayoum Clay, Cobalt & Oxide Glaze',
      size_dimensions: 'Height: 28 cm, Max Diameter: 18 cm',
      weight_kg: 1.4,
      packaging_details: 'Double-walled corrugated box with recycled kraft paper and bubble cushioning.',
      production_time_days: 3,
      stock_quantity: 12,
      status: 'PUBLISHED',
      is_featured: 1,
      images: [
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 'prd-fayoum-bowl-set',
      seller_profile_id: seller1ProfileId,
      category_id: 'cat-pottery',
      name: 'Handcrafted Terracotta Salad Bowls (Set of 3)',
      slug: 'handcrafted-terracotta-salad-bowls-set-of-3',
      description: 'Rustic handmade clay bowl set for entertaining and fruit display. Food-safe lead-free interior glaze with natural raw clay exterior.',
      price_egp: 950,
      materials: 'Red Nile Terracotta Clay',
      size_dimensions: 'Large: 25cm, Medium: 20cm, Small: 15cm',
      weight_kg: 2.2,
      packaging_details: 'Padded wooden crate with eco-friendly wood wool packing.',
      production_time_days: 4,
      stock_quantity: 8,
      status: 'PUBLISHED',
      is_featured: 0,
      images: [
        'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 'prd-akhmim-throw-1',
      seller_profile_id: seller2ProfileId,
      category_id: 'cat-textiles',
      name: 'Akhmim Handloomed 100% Egyptian Cotton Throw',
      slug: 'akhmim-handloomed-100-percent-egyptian-cotton-throw',
      description: 'Woven on historic wooden handlooms in Upper Egypt using long-staple Egyptian cotton. Features geometric lotus fringe borders and breathable soft texture.',
      price_egp: 1250,
      materials: '100% Pure Egyptian Long-Staple Cotton',
      size_dimensions: '220 cm x 160 cm',
      weight_kg: 0.95,
      packaging_details: 'Wrapped in organic linen dust bag with artisan authenticity card.',
      production_time_days: 2,
      stock_quantity: 15,
      status: 'PUBLISHED',
      is_featured: 1,
      images: [
        'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 'prd-akhmim-cushions',
      seller_profile_id: seller2ProfileId,
      category_id: 'cat-textiles',
      name: 'Geometric Handwoven Cushion Covers (Pair)',
      slug: 'geometric-handwoven-cushion-covers-pair',
      description: 'Pair of decorative accent pillow covers featuring traditional Upper Egyptian jacquard weave patterns in indigo and cream.',
      price_egp: 540,
      materials: 'Handwoven Cotton & Linen Blend',
      size_dimensions: '50 cm x 50 cm',
      weight_kg: 0.4,
      packaging_details: 'Reusable cotton drawstring bag.',
      production_time_days: 1,
      stock_quantity: 20,
      status: 'PUBLISHED',
      is_featured: 0,
      images: [
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 'prd-leather-pouf-1',
      seller_profile_id: seller3ProfileId,
      category_id: 'cat-leather',
      name: 'Hand-Embossed Full-Grain Leather Pouf (Unstuffed)',
      slug: 'hand-embossed-full-grain-leather-pouf-unstuffed',
      description: 'Stitched by hand in Khan El-Khalili using vegetable-tanned Egyptian cowhide leather. Hand-stamped with Islamic arabesque motifs and solid brass zipper.',
      price_egp: 1850,
      materials: 'Vegetable-Tanned Full-Grain Leather, Brass Zipper',
      size_dimensions: 'Diameter: 55 cm, Height: 35 cm',
      weight_kg: 1.2,
      packaging_details: 'Folded flat in protective poly-sleeve inside reinforced carton.',
      production_time_days: 5,
      stock_quantity: 6,
      status: 'PUBLISHED',
      is_featured: 1,
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      id: 'prd-leather-tote',
      seller_profile_id: seller3ProfileId,
      category_id: 'cat-leather',
      name: 'Hand-Carved Artisan Leather Tote Bag',
      slug: 'hand-carved-artisan-leather-tote-bag',
      description: 'Timeless everyday leather shoulder tote bag with magnetic snap closure, internal smartphone pocket, and reinforced brass rivets.',
      price_egp: 2100,
      materials: 'Egyptian Calfskin Leather, Solid Antique Brass Hardware',
      size_dimensions: '38 cm x 32 cm x 12 cm',
      weight_kg: 0.85,
      packaging_details: 'Cotton canvas dust cover inside protective box.',
      production_time_days: 4,
      stock_quantity: 5,
      status: 'PUBLISHED',
      is_featured: 0,
      images: [
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
      ]
    }
  ];

  for (const p of productsData) {
    db.prepare(`
      INSERT INTO products (id, seller_profile_id, category_id, name, slug, description, price_egp, materials, size_dimensions, weight_kg, packaging_details, production_time_days, stock_quantity, status, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      p.id, p.seller_profile_id, p.category_id, p.name, p.slug, p.description, p.price_egp, p.materials, p.size_dimensions, p.weight_kg, p.packaging_details, p.production_time_days, p.stock_quantity, p.status, p.is_featured
    );

    p.images.forEach((url, idx) => {
      db.prepare(`
        INSERT INTO product_images (id, product_id, image_url, is_primary, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), p.id, url, idx === 0 ? 1 : 0, idx);
    });
  }

  // 4. Sample Multi-Seller Order for Buyer Sarah
  const orderId = 'FB-2026-1001';
  const shipment1Id = 'shp-1001-amina';
  const shipment2Id = 'shp-1001-akhmim';

  db.prepare(`
    INSERT INTO orders (id, buyer_id, status, payment_method, payment_status, payment_transaction_id, subtotal_egp, total_shipping_egp, total_gateway_fee_egp, total_amount_egp, total_platform_commission_egp, shipping_full_name, shipping_phone, shipping_address, shipping_city, shipping_governorate)
    VALUES (?, ?, 'CONFIRMED', 'CARD', 'PAID', 'TXN-SANDBOX-VISA-9941', 1930, 105, 51.25, 2086.25, 38.60, 'Sarah Mansour', '+201099887766', '14 Maadi Degla, Road 206', 'Cairo', 'Cairo')
  `).run(orderId, buyerId);

  // Shipment 1 (Amina)
  db.prepare(`
    INSERT INTO order_shipments (id, order_id, seller_profile_id, shipping_method, shipping_cost_egp, seller_subtotal_egp, seller_commission_egp, seller_net_amount_egp, fulfillment_status, tracking_number)
    VALUES (?, ?, ?, 'EGYPT_POST', 40, 680, 13.60, 666.40, 'CONFIRMED', 'EGPOST-98231-FAY')
  `).run(shipment1Id, orderId, seller1ProfileId);

  db.prepare(`
    INSERT INTO order_items (id, order_id, shipment_id, product_id, product_name, unit_price_egp, quantity, total_price_egp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), orderId, shipment1Id, 'prd-fayoum-vase-1', 'Fayoum Turquoise Glazed Clay Vase', 680, 1, 680);

  // Shipment 2 (Akhmim)
  db.prepare(`
    INSERT INTO order_shipments (id, order_id, seller_profile_id, shipping_method, shipping_cost_egp, seller_subtotal_egp, seller_commission_egp, seller_net_amount_egp, fulfillment_status, tracking_number)
    VALUES (?, ?, ?, 'PRIVATE_COURIER', 65, 1250, 25.00, 1225.00, 'IN_SHIPMENT', 'BOSTA-EX-8832-SHG')
  `).run(shipment2Id, orderId, seller2ProfileId);

  db.prepare(`
    INSERT INTO order_items (id, order_id, shipment_id, product_id, product_name, unit_price_egp, quantity, total_price_egp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(uuidv4(), orderId, shipment2Id, 'prd-akhmim-throw-1', 'Akhmim Handloomed 100% Egyptian Cotton Throw', 1250, 1, 1250);

  // WhatsApp Audit Log for Order 1001
  db.prepare(`
    INSERT INTO whatsapp_logs (id, order_id, recipient_phone, event_type, payload_json, status, is_demo_mode, status_message)
    VALUES (?, ?, ?, 'ORDER_STATUS_CONFIRMED', ?, 'DEMO_SIMULATED', 1, 'Demo Mode: API credentials not configured. WhatsApp message was logged and simulated in Demo Inspector.')
  `).run(
    uuidv4(),
    orderId,
    '+201099887766',
    JSON.stringify({
      messaging_product: 'whatsapp',
      to: '201099887766',
      type: 'template',
      template: { name: 'order_status_update', parameters: ['Sarah Mansour', orderId, 'CONFIRMED'] }
    }, null, 2)
  );

  console.log('Database successfully seeded!');
}

module.exports = seed;

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}
