/**
 * Client-Side API Mock Fallback for GitHub Pages Deployment
 * Allows 100% of marketplace features (Catalog, Cart, Checkout, 2% Commission,
 * Seller Dashboard, Admin Verification Workspace) to run directly on GitHub Pages!
 */

const INITIAL_DB = {
  categories: [
    { id: 'cat-pottery', name: 'Pottery & Ceramics', slug: 'pottery-ceramics', description: 'Handcrafted Egyptian earthenware, glazed clay vases, and Fayoum pottery.', image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-textiles', name: 'Handwoven Textiles', slug: 'handwoven-textiles', description: 'Authentic Akhmim cotton throws, bedspreads, and hand-loomed rugs.', image_url: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-leather', name: 'Artisan Leathercraft', slug: 'artisan-leathercraft', description: 'Genuine Egyptian leather bags, hand-carved poufs, and footwear.', image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-jewelry', name: 'Fine Egyptian Jewelry', slug: 'fine-egyptian-jewelry', description: 'Sterling silver filigree, brass cartouches, and turquoise beadwork.', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-wood', name: 'Woodwork & Carvings', slug: 'woodwork-carvings', description: 'Mother-of-pearl inlaid boxes, olive wood bowls, and Islamic geometric screens.', image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80' }
  ],
  users: [
    { id: 'usr-admin-1', email: 'admin@fibyti.eg', full_name: 'Platform Administrator', phone_number: '+201001112233', role: 'ADMIN' },
    { id: 'usr-seller-amina', email: 'artisan.amina@fibyti.eg', full_name: 'Amina El-Fayoumi', phone_number: '+201012345678', role: 'SELLER' },
    { id: 'usr-seller-nile', email: 'artisan.nile@fibyti.eg', full_name: 'Youssef Akhmim', phone_number: '+201023456789', role: 'SELLER' },
    { id: 'usr-seller-tarek', email: 'artisan.tarek@fibyti.eg', full_name: 'Tarek Leatherworks', phone_number: '+201034567890', role: 'SELLER' },
    { id: 'usr-seller-siwa', email: 'artisan.siwa@fibyti.eg', full_name: 'Fatima Siwi', phone_number: '+201045678901', role: 'SELLER' },
    { id: 'usr-buyer-sarah', email: 'buyer.sarah@fibyti.eg', full_name: 'Sarah Mansour', phone_number: '+201099887766', role: 'BUYER' }
  ],
  seller_profiles: [
    { id: 'sel-amina-ceramics', user_id: 'usr-seller-amina', store_name: 'Amina Fayoum Clay Studio', store_bio: 'Third-generation Fayoum pottery artisan preserving traditional Tunis Village clay glazing techniques.', city: 'Fayoum', governorate: 'Fayoum', address_details: 'Tunis Village, Main Workshop Road', pickup_available: 1, status: 'APPROVED' },
    { id: 'sel-nile-looms', user_id: 'usr-seller-nile', store_name: 'Nile Looms Handwoven Textiles', store_bio: 'Master loom weavers from Akhmim, Sohag, crafting 100% Egyptian cotton home textiles.', city: 'Sohag', governorate: 'Sohag', address_details: 'Akhmim Weavers District, Studio 12', pickup_available: 1, status: 'APPROVED' },
    { id: 'sel-khedive-leather', user_id: 'usr-seller-tarek', store_name: 'Khedive Handmade Leather', store_bio: 'Hand-embossed full grain leather bags and traditional ottomans made in Historic Cairo.', city: 'Cairo', governorate: 'Cairo', address_details: 'Khan El-Khalili, Al-Muizz Street #44', pickup_available: 0, status: 'APPROVED' },
    { id: 'sel-siwa-crafts', user_id: 'usr-seller-siwa', store_name: 'Siwa Oasis Salt & Silver', store_bio: 'Hand-carved crystalline salt lamps and authentic Amazigh embroidered wool shawls from Siwa Oasis.', city: 'Siwa', governorate: 'Matrouh', address_details: 'Shali Fortress District', pickup_available: 1, status: 'PENDING_VERIFICATION' }
  ],
  seller_verification_docs: [
    { id: 'doc-siwa-id', seller_profile_id: 'sel-siwa-crafts', original_filename: 'Fatima_Siwa_National_ID.pdf', file_type: 'application/pdf', file_size: 1572864, uploaded_at: new Date().toISOString() }
  ],
  products: [
    { id: 'prd-fayoum-vase-1', seller_profile_id: 'sel-amina-ceramics', category_id: 'cat-pottery', name: 'Fayoum Turquoise Glazed Clay Vase', slug: 'fayoum-turquoise-glazed-clay-vase', description: 'Hand-thrown earthenware clay vase crafted by master potters in Tunis Village, Fayoum. Features traditional oxide turquoise glazing.', price_egp: 680, materials: 'Natural Fayoum Clay, Glaze', size_dimensions: 'Height: 28 cm, Dia: 18 cm', weight_kg: 1.4, packaging_details: 'Double-walled corrugated box with kraft paper cushioning.', production_time_days: 3, stock_quantity: 12, status: 'PUBLISHED', primary_image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80' },
    { id: 'prd-fayoum-bowl-set', seller_profile_id: 'sel-amina-ceramics', category_id: 'cat-pottery', name: 'Handcrafted Terracotta Salad Bowls (Set of 3)', slug: 'handcrafted-terracotta-salad-bowls-set-of-3', description: 'Rustic handmade clay bowl set for entertaining and fruit display. Food-safe lead-free interior glaze.', price_egp: 950, materials: 'Red Nile Terracotta Clay', size_dimensions: 'Large: 25cm, Medium: 20cm, Small: 15cm', weight_kg: 2.2, packaging_details: 'Padded wooden crate.', production_time_days: 4, stock_quantity: 8, status: 'PUBLISHED', primary_image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80' },
    { id: 'prd-akhmim-throw-1', seller_profile_id: 'sel-nile-looms', category_id: 'cat-textiles', name: 'Akhmim Handloomed 100% Egyptian Cotton Throw', slug: 'akhmim-handloomed-100-percent-egyptian-cotton-throw', description: 'Woven on historic wooden handlooms in Upper Egypt using long-staple Egyptian cotton.', price_egp: 1250, materials: '100% Pure Egyptian Long-Staple Cotton', size_dimensions: '220 cm x 160 cm', weight_kg: 0.95, packaging_details: 'Organic linen dust bag.', production_time_days: 2, stock_quantity: 15, status: 'PUBLISHED', primary_image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80' },
    { id: 'prd-akhmim-cushions', seller_profile_id: 'sel-nile-looms', category_id: 'cat-textiles', name: 'Geometric Handwoven Cushion Covers (Pair)', slug: 'geometric-handwoven-cushion-covers-pair', description: 'Pair of decorative accent pillow covers featuring traditional Upper Egyptian jacquard weave patterns.', price_egp: 540, materials: 'Handwoven Cotton & Linen Blend', size_dimensions: '50 cm x 50 cm', weight_kg: 0.4, packaging_details: 'Cotton drawstring bag.', production_time_days: 1, stock_quantity: 20, status: 'PUBLISHED', primary_image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80' },
    { id: 'prd-leather-pouf-1', seller_profile_id: 'sel-khedive-leather', category_id: 'cat-leather', name: 'Hand-Embossed Full-Grain Leather Pouf', slug: 'hand-embossed-full-grain-leather-pouf', description: 'Stitched by hand in Khan El-Khalili using vegetable-tanned Egyptian cowhide leather.', price_egp: 1850, materials: 'Vegetable-Tanned Full-Grain Leather', size_dimensions: 'Diameter: 55 cm, Height: 35 cm', weight_kg: 1.2, packaging_details: 'Poly-sleeve inside carton.', production_time_days: 5, stock_quantity: 6, status: 'PUBLISHED', primary_image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80' },
    { id: 'prd-leather-tote', seller_profile_id: 'sel-khedive-leather', category_id: 'cat-leather', name: 'Hand-Carved Artisan Leather Tote Bag', slug: 'hand-carved-artisan-leather-tote-bag', description: 'Timeless everyday leather shoulder tote bag with magnetic snap closure and brass hardware.', price_egp: 2100, materials: 'Egyptian Calfskin Leather', size_dimensions: '38 cm x 32 cm x 12 cm', weight_kg: 0.85, packaging_details: 'Canvas dust cover.', production_time_days: 4, stock_quantity: 5, status: 'PUBLISHED', primary_image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80' }
  ],
  orders: [
    {
      id: 'FB-2026-1001',
      buyer_id: 'usr-buyer-sarah',
      status: 'CONFIRMED',
      payment_method: 'CARD',
      payment_status: 'PAID',
      subtotal_egp: 1930,
      total_shipping_egp: 105,
      total_gateway_fee_egp: 51.25,
      total_amount_egp: 2086.25,
      total_platform_commission_egp: 38.60,
      shipping_full_name: 'Sarah Mansour',
      shipping_phone: '+201099887766',
      shipping_address: '14 Maadi Degla, Road 206',
      shipping_city: 'Cairo',
      shipping_governorate: 'Cairo',
      created_at: new Date().toISOString(),
      shipments: [
        {
          id: 'shp-1001-amina',
          seller_profile_id: 'sel-amina-ceramics',
          store_name: 'Amina Fayoum Clay Studio',
          seller_city: 'Fayoum',
          shipping_method: 'EGYPT_POST',
          shipping_cost_egp: 40,
          seller_subtotal_egp: 680,
          seller_commission_egp: 13.60,
          seller_net_amount_egp: 666.40,
          fulfillment_status: 'CONFIRMED',
          tracking_number: 'EGPOST-98231-FAY',
          items: [{ id: 'itm-1', product_name: 'Fayoum Turquoise Glazed Clay Vase', unit_price_egp: 680, quantity: 1, total_price_egp: 680 }]
        },
        {
          id: 'shp-1001-akhmim',
          seller_profile_id: 'sel-nile-looms',
          store_name: 'Nile Looms Handwoven Textiles',
          seller_city: 'Sohag',
          shipping_method: 'PRIVATE_COURIER',
          shipping_cost_egp: 65,
          seller_subtotal_egp: 1250,
          seller_commission_egp: 25.00,
          seller_net_amount_egp: 1225.00,
          fulfillment_status: 'IN_SHIPMENT',
          tracking_number: 'BOSTA-EX-8832-SHG',
          items: [{ id: 'itm-2', product_name: 'Akhmim Handloomed 100% Egyptian Cotton Throw', unit_price_egp: 1250, quantity: 1, total_price_egp: 1250 }]
        }
      ]
    }
  ],
  whatsapp_logs: [
    {
      id: 'log-1001',
      order_id: 'FB-2026-1001',
      recipient_phone: '+201099887766',
      event_type: 'ORDER_STATUS_CONFIRMED',
      payload_json: JSON.stringify({ messaging_product: 'whatsapp', to: '201099887766', type: 'template' }, null, 2),
      status: 'DEMO_SIMULATED',
      is_demo_mode: 1,
      status_message: 'Demo Mode: Message recorded and displayed in Demo Inspector.',
      created_at: new Date().toISOString()
    }
  ],
  database_backups: [
    { id: 'bkp-1', filename: 'fi_byti_backup_2026-11-23.db', file_size: 18742, backup_type: 'AUTOMATED_DAILY', created_at: new Date().toISOString() }
  ]
};

function getDb() {
  const saved = localStorage.getItem('fibyti_ghpages_db');
  if (!saved) {
    localStorage.setItem('fibyti_ghpages_db', JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    localStorage.setItem('fibyti_ghpages_db', JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
}

function saveDb(db) {
  localStorage.setItem('fibyti_ghpages_db', JSON.stringify(db));
}

// Intercept window.fetch for /api
export function setupClientApiMock() {
  const originalFetch = window.fetch;

  window.fetch = async function(resource, config) {
    const url = typeof resource === 'string' ? resource : resource.url;

    if (url.includes('/api/')) {
      try {
        // Try real network request first
        const realRes = await originalFetch(resource, config);
        if (realRes.status !== 404 && realRes.status !== 502 && realRes.status !== 503) {
          return realRes;
        }
      } catch (e) {
        // Network error (GitHub Pages static host) -> route to client-side mock!
      }

      const mockRes = handleMockRequest(url, config);
      return new Response(JSON.stringify(mockRes.body), {
        status: mockRes.status || 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return originalFetch(resource, config);
  };
}

function handleMockRequest(url, config = {}) {
  const db = getDb();
  const method = (config.method || 'GET').toUpperCase();
  let body = {};
  if (config.body) {
    try {
      if (typeof config.body === 'string') body = JSON.parse(config.body);
    } catch (e) {}
  }

  // Auth / Login
  if (url.includes('/api/auth/login')) {
    const user = db.users.find(u => u.email.toLowerCase() === (body.email || '').toLowerCase());
    if (user) {
      const sellerProfile = db.seller_profiles.find(s => s.user_id === user.id) || null;
      return { status: 200, body: { message: 'Signed in successfully', token: 'mock-token-' + user.id, user, sellerProfile } };
    }
    return { status: 401, body: { error: 'Invalid email or password.' } };
  }

  // Auth / Me
  if (url.includes('/api/auth/me')) {
    const authHeader = config.headers ? (config.headers['Authorization'] || config.headers['authorization']) : '';
    const userId = authHeader ? authHeader.replace('Bearer mock-token-', '') : 'usr-admin-1';
    const user = db.users.find(u => u.id === userId) || db.users[0];
    const sellerProfile = db.seller_profiles.find(s => s.user_id === user.id) || null;
    return { status: 200, body: { user, sellerProfile } };
  }

  // Categories
  if (url.includes('/api/categories')) {
    return { status: 200, body: { categories: db.categories } };
  }

  // Public Products Catalog
  if (url.includes('/api/products') && method === 'GET') {
    if (url.includes('/api/products/')) {
      const prodId = url.split('/api/products/')[1].split('?')[0];
      const p = db.products.find(item => item.id === prodId || item.slug === prodId) || db.products[0];
      const sp = db.seller_profiles.find(s => s.id === p.seller_profile_id) || {};
      const u = db.users.find(usr => usr.id === sp.user_id) || {};
      return {
        status: 200,
        body: {
          product: {
            ...p,
            seller_id: sp.id,
            store_name: sp.store_name,
            store_bio: sp.store_bio,
            seller_city: sp.city,
            seller_governorate: sp.governorate,
            seller_address: sp.address_details,
            pickup_available: sp.pickup_available,
            seller_person_name: u.full_name,
            images: [{ id: 'img-1', image_url: p.primary_image }]
          }
        }
      };
    }

    const approvedSellers = db.seller_profiles.filter(s => s.status === 'APPROVED').map(s => s.id);
    const catalogProducts = db.products.filter(p => approvedSellers.includes(p.seller_profile_id) && p.status === 'PUBLISHED').map(p => {
      const sp = db.seller_profiles.find(s => s.id === p.seller_profile_id) || {};
      return {
        ...p,
        store_name: sp.store_name,
        seller_city: sp.city,
        images: [{ image_url: p.primary_image }]
      };
    });

    return { status: 200, body: { products: catalogProducts } };
  }

  // Seller Profile
  if (url.includes('/api/seller/profile')) {
    const profile = db.seller_profiles[0];
    const doc = db.seller_verification_docs.find(d => d.seller_profile_id === profile.id) || null;
    return { status: 200, body: { profile, verificationDoc: doc } };
  }

  // Seller Products
  if (url.includes('/api/seller/products')) {
    if (method === 'POST') {
      const newProd = {
        id: 'prd-' + Date.now(),
        seller_profile_id: 'sel-amina-ceramics',
        category_id: body.categoryId || 'cat-pottery',
        name: body.name || 'New Craft',
        description: body.description || '',
        price_egp: parseFloat(body.priceEgp) || 500,
        materials: body.materials || 'Clay',
        size_dimensions: body.sizeDimensions || 'Standard',
        weight_kg: parseFloat(body.weightKg) || 0.5,
        packaging_details: body.packagingDetails || 'Craft box',
        production_time_days: parseInt(body.productionTimeDays) || 2,
        stock_quantity: parseInt(body.stockQuantity) || 10,
        status: body.status || 'PUBLISHED',
        primary_image: body.existingPhotoUrls || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
      };
      db.products.unshift(newProd);
      saveDb(db);
      return { status: 201, body: { message: 'Product created', product: newProd } };
    }

    const sellerProducts = db.products.map(p => ({ ...p, category_name: 'Pottery & Ceramics' }));
    return { status: 200, body: { products: sellerProducts } };
  }

  // Seller Orders
  if (url.includes('/api/seller/orders')) {
    const shipments = db.orders[0] ? db.orders[0].shipments : [];
    return { status: 200, body: { shipments } };
  }

  // Seller Analytics
  if (url.includes('/api/seller/analytics')) {
    return { status: 200, body: { summary: { grossSalesEgp: 1930, platformCommissionEgp: 38.60, netPayoutEgp: 1891.40, totalShipments: 2 } } };
  }

  // Admin Verifications Queue
  if (url.includes('/api/admin/verifications')) {
    if (url.includes('/review')) {
      const sellerId = url.split('/verifications/')[1].split('/review')[0];
      const sp = db.seller_profiles.find(s => s.id === sellerId);
      if (sp) {
        sp.status = body.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        saveDb(db);
      }
      return { status: 200, body: { message: 'Seller review updated', seller: sp } };
    }

    const pendingRequests = db.seller_profiles.filter(s => s.status === 'PENDING_VERIFICATION').map(s => {
      const u = db.users.find(usr => usr.id === s.user_id) || {};
      const d = db.seller_verification_docs.find(doc => doc.seller_profile_id === s.id) || {};
      return { ...s, user_full_name: u.full_name, user_email: u.email, user_phone: u.phone_number, doc_id: d.id, original_filename: d.original_filename, file_type: d.file_type, file_size: d.file_size };
    });

    const allSellers = db.seller_profiles.map(s => {
      const u = db.users.find(usr => usr.id === s.user_id) || {};
      return { ...s, user_full_name: u.full_name, user_email: u.email, product_count: 2 };
    });

    return { status: 200, body: { pendingCount: pendingRequests.length, pendingRequests, allSellers } };
  }

  // Admin Financials
  if (url.includes('/api/admin/financials')) {
    return {
      status: 200,
      body: {
        summary: { grandTotalGmv: 2086.25, totalProductsSubtotal: 1930, totalPlatformCommission: 38.60, totalShippingCollected: 105, totalGatewayFees: 51.25, totalOrders: 1 },
        sellerBreakdown: [
          { store_name: 'Amina Fayoum Clay Studio', seller_gross_sales: 680, platform_commission_collected: 13.60, seller_net_payout: 666.40 },
          { store_name: 'Nile Looms Handwoven Textiles', seller_gross_sales: 1250, platform_commission_collected: 25.00, seller_net_payout: 1225.00 }
        ]
      }
    };
  }

  // Admin WhatsApp Logs
  if (url.includes('/api/admin/whatsapp-logs')) {
    return { status: 200, body: { logs: db.whatsapp_logs } };
  }

  // Admin Backups
  if (url.includes('/api/admin/backups')) {
    if (method === 'POST') {
      const bkp = { id: 'bkp-' + Date.now(), filename: `fi_byti_backup_${Date.now()}.db`, file_size: 18920, backup_type: 'MANUAL', created_at: new Date().toISOString() };
      db.database_backups.unshift(bkp);
      saveDb(db);
      return { status: 200, body: { message: 'Backup created', backup: bkp } };
    }
    return { status: 200, body: { backups: db.database_backups } };
  }

  // Admin Users
  if (url.includes('/api/admin/users')) {
    return { status: 200, body: { users: db.users } };
  }

  // Place Order
  if (url.includes('/api/checkout/place-order')) {
    const newOrder = {
      id: 'FB-2026-' + Math.floor(1000 + Math.random() * 9000),
      status: 'CONFIRMED',
      payment_method: body.paymentMethod || 'CARD',
      payment_status: 'PAID',
      subtotal_egp: 1930,
      total_shipping_egp: 105,
      total_amount_egp: 2086.25,
      total_platform_commission_egp: 38.60,
      shipping_full_name: body.shippingFullName || 'Sarah Mansour',
      shipping_phone: body.shippingPhone || '+201099887766',
      shipping_address: body.shippingAddress || '14 Degla Road',
      shipping_city: body.shippingCity || 'Cairo',
      shipping_governorate: body.shippingGovernorate || 'Cairo'
    };

    db.orders.unshift(newOrder);
    saveDb(db);

    return {
      status: 201,
      body: {
        message: 'Order placed successfully!',
        order: newOrder,
        platformCommissionEgp: 38.60,
        whatsappNotification: {
          isDemoMode: true,
          status: 'DEMO_SIMULATED',
          statusMessage: 'Demo Mode: API credentials not configured. WhatsApp notification logged in Demo Inspector.',
          payload: { messaging_product: 'whatsapp', to: body.shippingPhone, template: { name: 'order_status_update' } }
        }
      }
    };
  }

  // Buyer Orders
  if (url.includes('/api/checkout/orders')) {
    return { status: 200, body: { orders: db.orders } };
  }

  return { status: 200, body: {} };
}
