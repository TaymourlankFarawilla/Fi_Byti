/**
 * Client-Side API Mock Interceptor for GitHub Pages Deployment
 * Synchronously handles all /api/ endpoints directly on client-side state
 * eliminating network 404 HTML fallback responses completely!
 */

const INITIAL_DB = {
  categories: [
    { id: 'cat-pottery', name: 'Pottery & Ceramics', name_ar: 'فخار وخزف الفايوم', slug: 'pottery-ceramics', description: 'Handcrafted Egyptian earthenware, glazed clay vases, and Fayoum pottery.', description_ar: 'فخار مصري يدوي الصنع، فازات طين مطلية بالورنيش، ومنتجات تونس بالفايوم.', image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-textiles', name: 'Handwoven Textiles', name_ar: 'منسوجات قطن أخميم', slug: 'handwoven-textiles', description: 'Authentic Akhmim cotton throws, bedspreads, and hand-loomed rugs.', description_ar: 'مفارش وأغطية سرير قطنية منسوجة على النول اليدوي بسوهاج وأخميم.', image_url: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-leather', name: 'Artisan Leathercraft', name_ar: 'صناعات جلدية خان الخليلي', slug: 'artisan-leathercraft', description: 'Genuine Egyptian leather bags, hand-carved poufs, and footwear.', description_ar: 'حقائب جلدية مصرية طبيعية، بوفات محفورة يدوياً، ومنتجات جلدية فاخرة.', image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-jewelry', name: 'Fine Egyptian Jewelry', name_ar: 'مجوهرات وفضيات سيوة التراثية', slug: 'fine-egyptian-jewelry', description: 'Sterling silver filigree, brass cartouches, and turquoise beadwork.', description_ar: 'فضيات تراثية، خراطيش نحاسية، وأعمال خرز الفيروز.', image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80' },
    { id: 'cat-wood', name: 'Woodwork & Carvings', name_ar: 'حفر ونقش خشب الزيتون والصدف', slug: 'woodwork-carvings', description: 'Mother-of-pearl inlaid boxes, olive wood bowls, and Islamic geometric screens.', description_ar: 'علب مطعمة بالصدف، أطباق خشب زيتون، وأرابيسك إسلامي هندسي.', image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80' }
  ],
  users: [
    { id: 'usr-admin-1', email: 'admin@fibyti.eg', password_hash: 'Admin123!', full_name: 'Platform Administrator', phone_number: '+201001112233', role: 'ADMIN' },
    { id: 'usr-seller-amina', email: 'artisan.amina@fibyti.eg', password_hash: 'Seller123!', full_name: 'أمينة الفيوطي', phone_number: '+201012345678', role: 'SELLER' },
    { id: 'usr-seller-nile', email: 'artisan.nile@fibyti.eg', password_hash: 'Seller123!', full_name: 'يوسف الأخميمي', phone_number: '+201023456789', role: 'SELLER' },
    { id: 'usr-seller-tarek', email: 'artisan.tarek@fibyti.eg', password_hash: 'Seller123!', full_name: 'طارق الجلاد', phone_number: '+201034567890', role: 'SELLER' },
    { id: 'usr-seller-siwa', email: 'artisan.siwa@fibyti.eg', password_hash: 'Seller123!', full_name: 'فاطمة السيوية', phone_number: '+201045678901', role: 'SELLER' },
    { id: 'usr-buyer-sarah', email: 'buyer.sarah@fibyti.eg', password_hash: 'Buyer123!', full_name: 'سارة منصور', phone_number: '+201099887766', role: 'BUYER' }
  ],
  seller_profiles: [
    { id: 'sel-amina-ceramics', user_id: 'usr-seller-amina', store_name: 'Amina Fayoum Clay Studio', store_name_ar: 'ورشة أمينة للفخار والخزف', store_bio: 'ورشة تراثية لصناعة الفخار الملون بقرية تونس بالفايوم منذ ثلاثة أجيال.', city: 'الفايوم', governorate: 'الفايوم', address_details: 'قرية تونس، شارع الورش الرئيسي', pickup_available: 1, status: 'APPROVED' },
    { id: 'sel-nile-looms', user_id: 'usr-seller-nile', store_name: 'Nile Looms Handwoven Textiles', store_name_ar: 'أنوال النيل للمنسوجات اليدوية', store_bio: 'نساجون محترفون من أخميم بسوهاج لصناعة المنسوجات القطنية على الأنوال الخشبية.', city: 'سوهاج', governorate: 'سوهاج', address_details: 'حي النساجين بأخميم، ورشة 12', pickup_available: 1, status: 'APPROVED' },
    { id: 'sel-khedive-leather', user_id: 'usr-seller-tarek', store_name: 'Khedive Handmade Leather', store_name_ar: 'الخديوي للجلود الطبيعية', store_bio: 'صناعة المنتجات الجلدية الطبيعية يدويًا بالقاهرة التاريخية وخان الخليلي.', city: 'القاهرة', governorate: 'القاهرة', address_details: 'خان الخليلي، شارع المعز رقم 44', pickup_available: 0, status: 'APPROVED' },
    { id: 'sel-siwa-crafts', user_id: 'usr-seller-siwa', store_name: 'Siwa Oasis Salt & Silver', store_name_ar: 'منتجات ملح وفضيات سيوة', store_bio: 'مصابيح صخرية ملحية وشيلان مطرزة يدويًا بأسلوب واحة سيوة الأصيل.', city: 'سيوة', governorate: 'مطروح', address_details: 'منطقة قلعة شالي', pickup_available: 1, status: 'PENDING_VERIFICATION' }
  ],
  seller_verification_docs: [
    { id: 'doc-siwa-id', seller_profile_id: 'sel-siwa-crafts', original_filename: 'Fatima_Siwa_National_ID.pdf', file_type: 'application/pdf', file_size: 1572864, uploaded_at: new Date().toISOString() }
  ],
  products: [
    { id: 'prd-fayoum-vase-1', seller_profile_id: 'sel-amina-ceramics', category_id: 'cat-pottery', name: 'Fayoum Turquoise Glazed Clay Vase', name_ar: 'مزهرية طين الفايوم المطلية بالتركواز', slug: 'fayoum-turquoise-glazed-clay-vase', description: 'مزهرية فخارية مصنوعة يدوياً على عجلة الفخار بواسطة أمهر حرفيي قرية تونس بالفايوم. تمتاز بطلاء أكسيد التركواز التراثي ونقوش سعف النخل.', price_egp: 680, materials: 'Natural Fayoum Clay, Glaze', materials_ar: 'طين الفايوم الطبيعي، أكسيد التركواز', size_dimensions: 'Height: 28 cm, Dia: 18 cm', weight_kg: 1.4, packaging_details: 'Double-walled corrugated box.', production_time_days: 3, stock_quantity: 12, status: 'PUBLISHED', primary_image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80' },
    { id: 'prd-fayoum-bowl-set', seller_profile_id: 'sel-amina-ceramics', category_id: 'cat-pottery', name: 'Handcrafted Terracotta Salad Bowls (Set of 3)', name_ar: 'أطقم أطباق سلطة فخارية مصنوعة يدوياً (3 قطع)', slug: 'handcrafted-terracotta-salad-bowls-set-of-3', description: 'طقم أطباق فخارية ريفية لتقديم الطعام والفاكهة. طلاء داخلي آمن خالي من الرصاص.', price_egp: 950, materials: 'Red Nile Terracotta Clay', materials_ar: 'طين أحمر نيل طبيعي', size_dimensions: 'Large: 25cm, Medium: 20cm, Small: 15cm', weight_kg: 2.2, packaging_details: 'Padded wooden crate.', production_time_days: 4, stock_quantity: 8, status: 'PUBLISHED', primary_image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80' },
    { id: 'prd-akhmim-throw-1', seller_profile_id: 'sel-nile-looms', category_id: 'cat-textiles', name: 'Akhmim Handloomed 100% Egyptian Cotton Throw', name_ar: 'مفرش قطن مصري 100% غزل أخميم', slug: 'akhmim-handloomed-100-percent-egyptian-cotton-throw', description: 'منسوج على الأنوال الخشبية التاريخية بصعيد مصر باستخدام القطن المصري طويل التيلة.', price_egp: 1250, materials: '100% Pure Egyptian Long-Staple Cotton', materials_ar: 'قطن مصري طويل التيلة 100%', size_dimensions: '220 cm × 160 cm', weight_kg: 0.95, packaging_details: 'Organic linen dust bag.', production_time_days: 2, stock_quantity: 15, status: 'PUBLISHED', primary_image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80' },
    { id: 'prd-akhmim-cushions', seller_profile_id: 'sel-nile-looms', category_id: 'cat-textiles', name: 'Geometric Handwoven Cushion Covers (Pair)', name_ar: 'أغطية وسائد هندسية نسيج يدوي (زوج)', slug: 'geometric-handwoven-cushion-covers-pair', description: 'زوج أغطية وسائد ديكور بنقوش نسيج الصعيد التقليدية باللونين النيلي والكريمي.', price_egp: 540, materials: 'Handwoven Cotton & Linen Blend', materials_ar: 'نسيج قطن وكتان يدوي', size_dimensions: '50 cm × 50 cm', weight_kg: 0.4, packaging_details: 'Cotton drawstring bag.', production_time_days: 1, stock_quantity: 20, status: 'PUBLISHED', primary_image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80' },
    { id: 'prd-leather-pouf-1', seller_profile_id: 'sel-khedive-leather', category_id: 'cat-leather', name: 'Hand-Embossed Full-Grain Leather Pouf', name_ar: 'بوف جاف جلد طبيعي مزخرف يدوياً', slug: 'hand-embossed-full-grain-leather-pouf', description: 'مخيط يدوياً بخان الخليلي باستخدام الجلد البقري الطبيعي المدبوغ نباتياً.', price_egp: 1850, materials: 'Vegetable-Tanned Full-Grain Leather', materials_ar: 'جلد طبيعي مدبوغ نباتياً', size_dimensions: 'Diameter: 55 cm, Height: 35 cm', weight_kg: 1.2, packaging_details: 'Poly-sleeve inside carton.', production_time_days: 5, stock_quantity: 6, status: 'PUBLISHED', primary_image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80' },
    { id: 'prd-leather-tote', seller_profile_id: 'sel-khedive-leather', category_id: 'cat-leather', name: 'Hand-Carved Artisan Leather Tote Bag', name_ar: 'حقيبة كتف جلدية مصنوعة يدوياً', slug: 'hand-carved-artisan-leather-tote-bag', description: 'حقيبة جلد طبيعي يومية مع قفل مغناطيسي وجيب داخلي للهاتف وإكسسوارات نحاسية.', price_egp: 2100, materials: 'Egyptian Calfskin Leather', materials_ar: 'جلد بقر طبيعي', size_dimensions: '38 cm × 32 cm × 12 cm', weight_kg: 0.85, packaging_details: 'Canvas dust cover.', production_time_days: 4, stock_quantity: 5, status: 'PUBLISHED', primary_image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80' }
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
      shipping_full_name: 'سارة منصور',
      shipping_phone: '+201099887766',
      shipping_address: '14 المعادي',
      shipping_city: 'القاهرة',
      shipping_governorate: 'القاهرة',
      created_at: new Date().toISOString(),
      shipments: [
        {
          id: 'shp-1001-amina',
          seller_profile_id: 'sel-amina-ceramics',
          store_name: 'ورشة أمينة للفخار والخزف',
          seller_city: 'الفايوم',
          shipping_method: 'EGYPT_POST',
          shipping_cost_egp: 40,
          seller_subtotal_egp: 680,
          seller_commission_egp: 13.60,
          seller_net_amount_egp: 666.40,
          fulfillment_status: 'CONFIRMED',
          tracking_number: 'EGPOST-98231-FAY',
          items: [{ id: 'itm-1', product_name: 'مزهرية طين الفايوم المطلية بالتركواز', unit_price_egp: 680, quantity: 1, total_price_egp: 680 }]
        },
        {
          id: 'shp-1001-akhmim',
          seller_profile_id: 'sel-nile-looms',
          store_name: 'أنوال النيل للمنسوجات اليدوية',
          seller_city: 'سوهاج',
          shipping_method: 'PRIVATE_COURIER',
          shipping_cost_egp: 65,
          seller_subtotal_egp: 1250,
          seller_commission_egp: 25.00,
          seller_net_amount_egp: 1225.00,
          fulfillment_status: 'IN_SHIPMENT',
          tracking_number: 'BOSTA-EX-8832-SHG',
          items: [{ id: 'itm-2', product_name: 'مفرش قطن مصري 100% غزل أخميم', unit_price_egp: 1250, quantity: 1, total_price_egp: 1250 }]
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
      status_message: 'Demo Mode: Notification logged.',
      created_at: new Date().toISOString()
    }
  ],
  database_backups: [
    { id: 'bkp-1', filename: 'fi_byti_backup_2026-11-23.db', file_size: 18742, backup_type: 'AUTOMATED_DAILY', created_at: new Date().toISOString() }
  ]
};

function getDb() {
  const saved = localStorage.getItem('fibyti_ghpages_db_v3');
  if (!saved) {
    localStorage.setItem('fibyti_ghpages_db_v3', JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    localStorage.setItem('fibyti_ghpages_db_v3', JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  }
}

function saveDb(db) {
  localStorage.setItem('fibyti_ghpages_db_v3', JSON.stringify(db));
}

// Intercept window.fetch for /api
export function setupClientApiMock() {
  window.fetch = async function(resource, config) {
    const url = typeof resource === 'string' ? resource : (resource ? resource.url || '' : '');

    if (url.includes('/api/')) {
      const mockRes = handleMockRequest(url, config);
      return new Response(JSON.stringify(mockRes.body), {
        status: mockRes.status || 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return window.fetchOriginal ? window.fetchOriginal(resource, config) : Response.error();
  };
}

if (!window.fetchOriginal && window.fetch) {
  window.fetchOriginal = window.fetch;
}

function getLoggedInSellerProfile(db, config) {
  const authHeader = config.headers ? (config.headers['Authorization'] || config.headers['authorization']) : '';
  const token = authHeader ? authHeader.replace('Bearer mock-token-', '') : '';
  let user = db.users.find(u => u.id === token || u.email.toLowerCase() === token.toLowerCase());

  if (!user && token) {
    user = db.users.find(u => u.id.includes(token));
  }
  if (!user) user = db.users.find(u => u.role === 'SELLER');

  const profile = db.seller_profiles.find(s => s.user_id === user.id) || db.seller_profiles[0];
  return { user, profile };
}

function handleMockRequest(url, config = {}) {
  const db = getDb();
  const method = (config.method || 'GET').toUpperCase();
  const currentLang = localStorage.getItem('fibyti_lang') || 'en';
  const isAr = currentLang === 'ar';

  let body = {};
  if (config.body) {
    try {
      if (typeof config.body === 'string') body = JSON.parse(config.body);
    } catch (e) {}
  }

  // Reset Demo Endpoint
  if (url.includes('/api/reset-demo')) {
    localStorage.setItem('fibyti_ghpages_db_v3', JSON.stringify(INITIAL_DB));
    return { status: 200, body: { message: 'Demo data reset successfully.' } };
  }

  // Auth / Login
  if (url.includes('/api/auth/login')) {
    const targetEmail = (body.email || '').toLowerCase().trim();
    let user = db.users.find(u => u.email.toLowerCase() === targetEmail);

    if (!user) {
      user = { id: 'usr-' + Date.now(), email: targetEmail, full_name: body.fullName || targetEmail.split('@')[0], phone_number: '+201000000000', role: 'BUYER' };
      db.users.push(user);
      saveDb(db);
    }

    const sellerProfile = db.seller_profiles.find(s => s.user_id === user.id) || null;
    return { status: 200, body: { message: 'Signed in successfully', token: 'mock-token-' + user.id, user, sellerProfile } };
  }

  // Auth / Register
  if (url.includes('/api/auth/register')) {
    const newUser = {
      id: 'usr-' + Date.now(),
      email: (body.email || '').toLowerCase().trim(),
      full_name: body.fullName || 'New User',
      phone_number: body.phoneNumber || '+201000000000',
      role: body.role === 'SELLER' ? 'SELLER' : 'BUYER'
    };

    db.users.push(newUser);

    let sellerProfile = null;
    if (newUser.role === 'SELLER') {
      sellerProfile = {
        id: 'sel-' + Date.now(),
        user_id: newUser.id,
        store_name: body.storeName || `${newUser.full_name}'s Studio`,
        store_bio: body.storeBio || '',
        city: body.city || 'Cairo',
        governorate: body.governorate || 'Cairo',
        address_details: body.addressDetails || '',
        pickup_available: 1,
        status: 'PENDING_VERIFICATION'
      };
      db.seller_profiles.push(sellerProfile);
    }

    saveDb(db);
    return { status: 201, body: { message: 'Account created successfully', token: 'mock-token-' + newUser.id, user: newUser, sellerProfile } };
  }

  // Auth / Me
  if (url.includes('/api/auth/me')) {
    const { user, profile } = getLoggedInSellerProfile(db, config);
    return { status: 200, body: { user, sellerProfile: profile } };
  }

  // Categories
  if (url.includes('/api/categories')) {
    const formattedCategories = db.categories.map(c => ({
      ...c,
      name: isAr && c.name_ar ? c.name_ar : c.name,
      description: isAr && c.description_ar ? c.description_ar : c.description
    }));
    return { status: 200, body: { categories: formattedCategories } };
  }

  // Public Products Catalog (Hide if seller status === 'SUSPENDED')
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
            name: isAr && p.name_ar ? p.name_ar : p.name,
            description: isAr && p.description_ar ? p.description_ar : p.description,
            materials: isAr && p.materials_ar ? p.materials_ar : p.materials,
            seller_id: sp.id,
            store_name: isAr && sp.store_name_ar ? sp.store_name_ar : sp.store_name,
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
        name: isAr && p.name_ar ? p.name_ar : p.name,
        description: isAr && p.description_ar ? p.description_ar : p.description,
        materials: isAr && p.materials_ar ? p.materials_ar : p.materials,
        store_name: isAr && sp.store_name_ar ? sp.store_name_ar : sp.store_name,
        seller_city: sp.city,
        images: [{ image_url: p.primary_image }]
      };
    });

    return { status: 200, body: { products: catalogProducts } };
  }

  // Seller Profile
  if (url.includes('/api/seller/profile')) {
    const { profile } = getLoggedInSellerProfile(db, config);
    const doc = db.seller_verification_docs.find(d => d.seller_profile_id === profile.id) || null;
    return { status: 200, body: { profile, verificationDoc: doc } };
  }

  // Seller Upload Verification ID
  if (url.includes('/api/seller/verify')) {
    const { profile } = getLoggedInSellerProfile(db, config);
    profile.status = 'PENDING_VERIFICATION';

    const doc = { id: 'doc-' + Date.now(), seller_profile_id: profile.id, original_filename: 'National_ID_Card.pdf', file_type: 'application/pdf', file_size: 1572864, uploaded_at: new Date().toISOString() };
    db.seller_verification_docs.unshift(doc);
    saveDb(db);

    return { status: 200, body: { message: 'Document uploaded successfully.', profile, document: doc } };
  }

  // Seller Products (STRICT USER DATA ISOLATION by seller_profile_id)
  if (url.includes('/api/seller/products')) {
    const { profile } = getLoggedInSellerProfile(db, config);

    if (method === 'POST') {
      const newProd = {
        id: 'prd-' + Date.now(),
        seller_profile_id: profile.id,
        category_id: body.categoryId || 'cat-pottery',
        name: body.name || 'Handmade Craft',
        name_ar: body.name || 'منتج حرفي جديد',
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

    // Filter strictly by logged in seller profile ID
    const sellerProducts = db.products.filter(p => p.seller_profile_id === profile.id).map(p => {
      const c = db.categories.find(cat => cat.id === p.category_id) || {};
      return {
        ...p,
        name: isAr && p.name_ar ? p.name_ar : p.name,
        category_name: isAr && c.name_ar ? c.name_ar : c.name
      };
    });

    return { status: 200, body: { products: sellerProducts } };
  }

  // Seller Orders (STRICT USER DATA ISOLATION)
  if (url.includes('/api/seller/orders')) {
    const { profile } = getLoggedInSellerProfile(db, config);
    const sellerShipments = [];

    db.orders.forEach(ord => {
      if (ord.shipments) {
        ord.shipments.forEach(shp => {
          if (shp.seller_profile_id === profile.id) {
            sellerShipments.push({
              ...shp,
              shipping_full_name: ord.shipping_full_name,
              shipping_city: ord.shipping_city,
              shipping_governorate: ord.shipping_governorate
            });
          }
        });
      }
    });

    return { status: 200, body: { shipments: sellerShipments } };
  }

  // Seller Analytics (STRICT USER DATA ISOLATION: 2% commission & 98% net)
  if (url.includes('/api/seller/analytics')) {
    const { profile } = getLoggedInSellerProfile(db, config);
    let gross = 0;
    let comm = 0;
    let net = 0;
    let count = 0;

    db.orders.forEach(ord => {
      if (ord.shipments) {
        ord.shipments.forEach(shp => {
          if (shp.seller_profile_id === profile.id && shp.fulfillment_status !== 'CANCELLED') {
            gross += (shp.seller_subtotal_egp || 0);
            comm += (shp.seller_commission_egp || 0);
            net += (shp.seller_net_amount_egp || 0);
            count++;
          }
        });
      }
    });

    return {
      status: 200,
      body: {
        summary: {
          grossSalesEgp: Math.round(gross * 100) / 100,
          platformCommissionEgp: Math.round(comm * 100) / 100,
          netPayoutEgp: Math.round(net * 100) / 100,
          totalShipments: count
        }
      }
    };
  }

  // Admin Verifications Queue & Suspend Store
  if (url.includes('/api/admin/verifications')) {
    if (url.includes('/toggle-status')) {
      const sellerId = url.split('/verifications/')[1].split('/toggle-status')[0];
      const sp = db.seller_profiles.find(s => s.id === sellerId);
      if (sp) {
        sp.status = body.status || (sp.status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED');
        saveDb(db);
      }
      return { status: 200, body: { message: 'Seller store status updated', seller: sp } };
    }

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
      const prodCount = db.products.filter(p => p.seller_profile_id === s.id).length;
      return { ...s, user_full_name: u.full_name, user_email: u.email, product_count: prodCount };
    });

    return { status: 200, body: { pendingCount: pendingRequests.length, pendingRequests, allSellers } };
  }

  // Admin Financials
  if (url.includes('/api/admin/financials')) {
    const sellerBreakdown = db.seller_profiles.map(sp => {
      const u = db.users.find(usr => usr.id === sp.user_id) || {};
      let gross = 0, comm = 0, net = 0;
      db.orders.forEach(ord => {
        if (ord.shipments) {
          ord.shipments.forEach(shp => {
            if (shp.seller_profile_id === sp.id && shp.fulfillment_status !== 'CANCELLED') {
              gross += (shp.seller_subtotal_egp || 0);
              comm += (shp.seller_commission_egp || 0);
              net += (shp.seller_net_amount_egp || 0);
            }
          });
        }
      });
      return {
        store_name: isAr && sp.store_name_ar ? sp.store_name_ar : sp.store_name,
        email: u.email,
        seller_gross_sales: Math.round(gross * 100) / 100,
        platform_commission_collected: Math.round(comm * 100) / 100,
        seller_net_payout: Math.round(net * 100) / 100
      };
    });

    return {
      status: 200,
      body: {
        summary: { grandTotalGmv: 2086.25, totalProductsSubtotal: 1930, totalPlatformCommission: 38.60, totalShippingCollected: 105, totalGatewayFees: 51.25, totalOrders: db.orders.length },
        sellerBreakdown
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
      shipping_full_name: body.shippingFullName || 'سارة منصور',
      shipping_phone: body.shippingPhone || '+201099887766',
      shipping_address: body.shippingAddress || '14 المعادي',
      shipping_city: body.shippingCity || 'القاهرة',
      shipping_governorate: body.shippingGovernorate || 'القاهرة',
      created_at: new Date().toISOString(),
      shipments: [
        {
          id: 'shp-' + Date.now(),
          seller_profile_id: 'sel-amina-ceramics',
          store_name: 'ورشة أمينة للفخار والخزف',
          seller_city: 'الفايوم',
          shipping_method: 'EGYPT_POST',
          shipping_cost_egp: 40,
          seller_subtotal_egp: 680,
          seller_commission_egp: 13.60,
          seller_net_amount_egp: 666.40,
          fulfillment_status: 'CONFIRMED',
          tracking_number: 'EGPOST-98231-FAY',
          items: [{ id: 'itm-1', product_name: 'مزهرية طين الفايوم', unit_price_egp: 680, quantity: 1, total_price_egp: 680 }]
        }
      ]
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
          statusMessage: 'Demo Mode: WhatsApp notification logged in Demo Inspector.',
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
