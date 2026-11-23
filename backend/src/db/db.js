const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFilePath = path.join(dataDir, 'fi_byti_db.json');

// Memory storage initialized from disk
let dbData = {
  users: [],
  seller_profiles: [],
  seller_verification_docs: [],
  categories: [],
  products: [],
  product_images: [],
  orders: [],
  order_shipments: [],
  order_items: [],
  whatsapp_logs: [],
  database_backups: []
};

function loadDb() {
  if (fs.existsSync(dbFilePath)) {
    try {
      const raw = fs.readFileSync(dbFilePath, 'utf8');
      dbData = { ...dbData, ...JSON.parse(raw) };
    } catch (e) {
      console.error('Failed to load JSON DB, initializing fresh:', e);
    }
  }
}

function saveDb() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save JSON DB:', e);
  }
}

loadDb();

// Generic SQL query parser & executor
class Statement {
  constructor(sql) {
    this.sql = sql.trim();
  }

  run(...params) {
    let args = params.flat();
    const sql = this.sql;

    // DELETE FROM table
    if (/^DELETE\s+FROM\s+(\w+)/i.test(sql)) {
      const match = sql.match(/^DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);
      const tableName = match[1];
      const whereClause = match[2];

      if (!dbData[tableName]) dbData[tableName] = [];

      if (!whereClause) {
        dbData[tableName] = [];
      } else {
        dbData[tableName] = dbData[tableName].filter(row => !evaluateWhere(row, whereClause, args));
      }
      saveDb();
      return { changes: 1 };
    }

    // INSERT INTO table
    if (/^INSERT\s+INTO\s+(\w+)/i.test(sql)) {
      const match = sql.match(/^INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (match) {
        const tableName = match[1];
        const columns = match[2].split(',').map(c => c.trim());
        const valExprs = match[3].split(',').map(v => v.trim());

        if (!dbData[tableName]) dbData[tableName] = [];

        const newRow = {};
        let argIdx = 0;
        columns.forEach((col, idx) => {
          const expr = valExprs[idx];
          if (expr === '?') {
            newRow[col] = args[argIdx++];
          } else if (expr && expr.includes('CURRENT_TIMESTAMP')) {
            newRow[col] = new Date().toISOString();
          } else if (expr && !isNaN(Number(expr))) {
            newRow[col] = Number(expr);
          } else {
            newRow[col] = expr ? expr.replace(/^['"]|['"]$/g, '') : null;
          }
        });

        if (!newRow.created_at) newRow.created_at = new Date().toISOString();
        if (!newRow.updated_at) newRow.updated_at = new Date().toISOString();

        dbData[tableName].push(newRow);
        saveDb();
        return { changes: 1 };
      }
    }

    // UPDATE table SET ... WHERE ...
    if (/^UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i.test(sql)) {
      const match = sql.match(/^UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
      const tableName = match[1];
      const setClause = match[2];
      const whereClause = match[3];

      if (!dbData[tableName]) return { changes: 0 };

      // Parse SET fields
      const setAssignments = setClause.split(',').map(s => s.trim());
      let argIndex = 0;
      let setFieldOps = [];

      setAssignments.forEach(assign => {
        const parts = assign.split('=').map(p => p.trim());
        const field = parts[0];
        const expr = parts[1];

        if (expr === '?') {
          const valIndex = argIndex++;
          setFieldOps.push(row => { row[field] = args[valIndex]; });
        } else if (expr.includes('CURRENT_TIMESTAMP')) {
          setFieldOps.push(row => { row[field] = new Date().toISOString(); });
        } else if (expr === 'NULL') {
          setFieldOps.push(row => { row[field] = null; });
        } else if (expr.includes('- ?')) {
          const valIndex = argIndex++;
          setFieldOps.push(row => { row[field] = (row[field] || 0) - args[valIndex]; });
        } else {
          setFieldOps.push(row => { row[field] = expr.replace(/^['"]|['"]$/g, ''); });
        }
      });

      const whereArgs = args.slice(argIndex);

      let updatedCount = 0;
      dbData[tableName].forEach(row => {
        if (!whereClause || evaluateWhere(row, whereClause, whereArgs)) {
          setFieldOps.forEach(op => op(row));
          row.updated_at = new Date().toISOString();
          updatedCount++;
        }
      });

      saveDb();
      return { changes: updatedCount };
    }

    return { changes: 0 };
  }

  get(...params) {
    const results = this.all(...params);
    return results.length > 0 ? results[0] : undefined;
  }

  all(...params) {
    let args = params.flat();
    const sql = this.sql;
    return executeQuery(sql, args);
  }
}

function evaluateWhere(row, whereClause, args) {
  if (!whereClause) return true;

  if (/^id\s*=\s*\?/i.test(whereClause)) return row.id === args[0];
  if (/^email\s*=\s*\?/i.test(whereClause)) return row.email && row.email.toLowerCase() === (args[0] || '').toLowerCase();
  if (/^user_id\s*=\s*\?/i.test(whereClause)) return row.user_id === args[0];
  if (/^buyer_id\s*=\s*\?/i.test(whereClause)) return row.buyer_id === args[0];
  if (/^seller_profile_id\s*=\s*\?/i.test(whereClause)) return row.seller_profile_id === args[0];
  if (/^order_id\s*=\s*\?/i.test(whereClause)) return row.order_id === args[0];
  if (/^shipment_id\s*=\s*\?/i.test(whereClause)) return row.shipment_id === args[0];
  if (/^product_id\s*=\s*\?/i.test(whereClause)) return row.product_id === args[0];
  if (/^category_id\s*=\s*\?/i.test(whereClause)) return row.category_id === args[0];
  if (/^status\s*=\s*\?/i.test(whereClause)) return row.status === args[0];

  return true;
}

function executeQuery(sql, args) {
  // Aggregate queries
  if (/SELECT\s+COALESCE\(SUM/i.test(sql)) {
    if (sql.includes('FROM order_shipments WHERE seller_profile_id = ?')) {
      const sellerId = args[0];
      const rows = dbData.order_shipments.filter(s => s.seller_profile_id === sellerId && s.fulfillment_status !== 'CANCELLED');
      const gross = rows.reduce((acc, r) => acc + (r.seller_subtotal_egp || 0), 0);
      const comm = rows.reduce((acc, r) => acc + (r.seller_commission_egp || 0), 0);
      const net = rows.reduce((acc, r) => acc + (r.seller_net_amount_egp || 0), 0);
      return [{ gross_sales_egp: gross, platform_commission_egp: comm, net_payout_egp: net, total_shipments: rows.length }];
    }

    if (sql.includes('FROM orders WHERE status != \'CANCELLED\'')) {
      const rows = dbData.orders.filter(o => o.status !== 'CANCELLED');
      const gmv = rows.reduce((acc, r) => acc + (r.total_amount_egp || 0), 0);
      const subtotal = rows.reduce((acc, r) => acc + (r.subtotal_egp || 0), 0);
      const comm = rows.reduce((acc, r) => acc + (r.total_platform_commission_egp || 0), 0);
      const ship = rows.reduce((acc, r) => acc + (r.total_shipping_egp || 0), 0);
      const fee = rows.reduce((acc, r) => acc + (r.total_gateway_fee_egp || 0), 0);
      return [{ grand_total_gmv: gmv, total_products_subtotal: subtotal, total_platform_commission_2_percent: comm, total_shipping_collected: ship, total_gateway_fees: fee, total_orders: rows.length }];
    }
  }

  // Seller Breakdown for Admin
  if (sql.includes('FROM seller_profiles sp JOIN users u ON sp.user_id = u.id LEFT JOIN order_shipments os')) {
    return dbData.seller_profiles.map(sp => {
      const u = dbData.users.find(usr => usr.id === sp.user_id) || {};
      const shipments = dbData.order_shipments.filter(os => os.seller_profile_id === sp.id && os.fulfillment_status !== 'CANCELLED');
      const gross = shipments.reduce((acc, r) => acc + (r.seller_subtotal_egp || 0), 0);
      const comm = shipments.reduce((acc, r) => acc + (r.seller_commission_egp || 0), 0);
      const net = shipments.reduce((acc, r) => acc + (r.seller_net_amount_egp || 0), 0);
      return {
        store_name: sp.store_name,
        email: u.email,
        seller_gross_sales: gross,
        platform_commission_collected: comm,
        seller_net_payout: net
      };
    });
  }

  // Users List with Seller Status
  if (sql.includes('FROM users u LEFT JOIN seller_profiles sp ON u.id = sp.user_id')) {
    return dbData.users.map(u => {
      const sp = dbData.seller_profiles.find(s => s.user_id === u.id);
      return {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        phone_number: u.phone_number,
        role: u.role,
        created_at: u.created_at,
        store_name: sp ? sp.store_name : null,
        seller_status: sp ? sp.status : null
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Admin Pending Verification Requests
  if (sql.includes('FROM seller_profiles sp JOIN users u ON sp.user_id = u.id LEFT JOIN seller_verification_docs d')) {
    if (sql.includes("sp.status = 'PENDING_VERIFICATION'")) {
      const pending = dbData.seller_profiles.filter(sp => sp.status === 'PENDING_VERIFICATION');
      return pending.map(sp => {
        const u = dbData.users.find(usr => usr.id === sp.user_id) || {};
        const d = dbData.seller_verification_docs.filter(doc => doc.seller_profile_id === sp.id).sort((a,b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))[0] || {};
        return {
          ...sp,
          user_full_name: u.full_name,
          user_email: u.email,
          user_phone: u.phone_number,
          doc_id: d.id || null,
          original_filename: d.original_filename || null,
          file_type: d.file_type || null,
          file_size: d.file_size || null,
          uploaded_at: d.uploaded_at || null
        };
      });
    }

    return dbData.seller_profiles.map(sp => {
      const u = dbData.users.find(usr => usr.id === sp.user_id) || {};
      const prodCount = dbData.products.filter(p => p.seller_profile_id === sp.id).length;
      return {
        ...sp,
        user_full_name: u.full_name,
        user_email: u.email,
        user_phone: u.phone_number,
        product_count: prodCount
      };
    });
  }

  // Admin Products List
  if (sql.includes('FROM products p JOIN categories c ON p.category_id = c.id JOIN seller_profiles sp')) {
    return dbData.products.map(p => {
      const c = dbData.categories.find(cat => cat.id === p.category_id) || {};
      const sp = dbData.seller_profiles.find(s => s.id === p.seller_profile_id) || {};
      const u = dbData.users.find(usr => usr.id === sp.user_id) || {};
      return {
        ...p,
        category_name: c.name,
        store_name: sp.store_name,
        seller_name: u.full_name
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // WhatsApp logs for admin
  if (sql.includes('FROM whatsapp_logs wl JOIN orders o ON wl.order_id = o.id')) {
    return dbData.whatsapp_logs.map(log => {
      const o = dbData.orders.find(ord => ord.id === log.order_id) || {};
      return {
        ...log,
        shipping_full_name: o.shipping_full_name,
        shipping_city: o.shipping_city
      };
    }).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Seller Products List
  if (sql.includes('FROM products p JOIN categories c ON p.category_id = c.id WHERE p.seller_profile_id = ?')) {
    const sellerId = args[0];
    const prods = dbData.products.filter(p => p.seller_profile_id === sellerId);
    return prods.map(p => {
      const c = dbData.categories.find(cat => cat.id === p.category_id) || {};
      const img = dbData.product_images.find(i => i.product_id === p.id && i.is_primary === 1) || dbData.product_images.find(i => i.product_id === p.id);
      return {
        ...p,
        category_name: c.name,
        primary_image: img ? img.image_url : null
      };
    }).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Seller Shipments
  if (sql.includes('FROM order_shipments s JOIN orders o ON s.order_id = o.id WHERE s.seller_profile_id = ?')) {
    const sellerId = args[0];
    const shipments = dbData.order_shipments.filter(s => s.seller_profile_id === sellerId);
    return shipments.map(s => {
      const o = dbData.orders.find(ord => ord.id === s.order_id) || {};
      return {
        ...s,
        shipping_full_name: o.shipping_full_name,
        shipping_phone: o.shipping_phone,
        shipping_address: o.shipping_address,
        shipping_city: o.shipping_city,
        shipping_governorate: o.shipping_governorate,
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        order_date: o.created_at
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Public Catalog
  if (sql.includes('FROM products p JOIN categories c ON p.category_id = c.id JOIN seller_profiles sp ON p.seller_profile_id = sp.id')) {
    let prods = dbData.products.filter(p => {
      const sp = dbData.seller_profiles.find(s => s.id === p.seller_profile_id);
      return p.status === 'PUBLISHED' && sp && sp.status === 'APPROVED';
    });

    // Filtering logic
    let argIdx = 0;
    if (sql.includes('p.name LIKE ?')) {
      const search = (args[argIdx] || '').replace(/%/g, '').toLowerCase();
      argIdx += 3;
      prods = prods.filter(p => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search) || p.materials.toLowerCase().includes(search));
    }

    if (sql.includes('(c.id = ? OR c.slug = ?)')) {
      const catVal = args[argIdx];
      argIdx += 2;
      prods = prods.filter(p => p.category_id === catVal || (dbData.categories.find(c => c.id === p.category_id) || {}).slug === catVal);
    }

    if (sql.includes('p.price_egp >= ?')) {
      const minP = args[argIdx++];
      prods = prods.filter(p => p.price_egp >= minP);
    }

    if (sql.includes('p.price_egp <= ?')) {
      const maxP = args[argIdx++];
      prods = prods.filter(p => p.price_egp <= maxP);
    }

    if (sql.includes('p.materials LIKE ?')) {
      const mat = (args[argIdx++] || '').replace(/%/g, '').toLowerCase();
      prods = prods.filter(p => p.materials.toLowerCase().includes(mat));
    }

    return prods.map(p => {
      const c = dbData.categories.find(cat => cat.id === p.category_id) || {};
      const sp = dbData.seller_profiles.find(s => s.id === p.seller_profile_id) || {};
      const img = dbData.product_images.find(i => i.product_id === p.id && i.is_primary === 1) || dbData.product_images.find(i => i.product_id === p.id);
      return {
        ...p,
        category_name: c.name,
        category_slug: c.slug,
        store_name: sp.store_name,
        seller_city: sp.city,
        primary_image: img ? img.image_url : null
      };
    });
  }

  // Single Product Detail
  if (sql.includes('FROM products p JOIN categories c ON p.category_id = c.id JOIN seller_profiles sp ON p.seller_profile_id = sp.id JOIN users u ON sp.user_id = u.id')) {
    const target = args[0];
    const p = dbData.products.find(prod => prod.id === target || prod.slug === target);
    if (!p) return [];

    const c = dbData.categories.find(cat => cat.id === p.category_id) || {};
    const sp = dbData.seller_profiles.find(s => s.id === p.seller_profile_id) || {};
    const u = dbData.users.find(usr => usr.id === sp.user_id) || {};

    return [{
      ...p,
      category_name: c.name,
      category_slug: c.slug,
      seller_id: sp.id,
      store_name: sp.store_name,
      store_bio: sp.store_bio,
      seller_city: sp.city,
      seller_governorate: sp.governorate,
      seller_address: sp.address_details,
      pickup_available: sp.pickup_available,
      seller_person_name: u.full_name
    }];
  }

  // Product Query with Stock & Seller
  if (sql.includes('FROM products p JOIN seller_profiles sp ON p.seller_profile_id = sp.id WHERE p.id = ?')) {
    const prodId = args[0];
    const p = dbData.products.find(prod => prod.id === prodId);
    if (!p) return [];
    const sp = dbData.seller_profiles.find(s => s.id === p.seller_profile_id) || {};
    return [{
      id: p.id,
      name: p.name,
      price_egp: p.price_egp,
      stock_quantity: p.stock_quantity,
      seller_profile_id: p.seller_profile_id,
      store_name: sp.store_name,
      seller_city: sp.city,
      pickup_available: sp.pickup_available
    }];
  }

  // Fallback direct table match
  const matchTable = sql.match(/FROM\s+(\w+)/i);
  if (matchTable) {
    const tableName = matchTable[1];
    if (dbData[tableName]) {
      let res = dbData[tableName];
      if (args.length > 0) {
        if (sql.includes('WHERE id = ?')) res = res.filter(r => r.id === args[0]);
        else if (sql.includes('WHERE email = ?')) res = res.filter(r => r.email && r.email.toLowerCase() === args[0].toLowerCase());
        else if (sql.includes('WHERE user_id = ?')) res = res.filter(r => r.user_id === args[0]);
        else if (sql.includes('WHERE buyer_id = ?')) res = res.filter(r => r.buyer_id === args[0]);
        else if (sql.includes('WHERE seller_profile_id = ?')) res = res.filter(r => r.seller_profile_id === args[0]);
        else if (sql.includes('WHERE order_id = ?')) res = res.filter(r => r.order_id === args[0]);
        else if (sql.includes('WHERE shipment_id = ?')) res = res.filter(r => r.shipment_id === args[0]);
        else if (sql.includes('WHERE product_id = ?')) res = res.filter(r => r.product_id === args[0]);
      }
      return res;
    }
  }

  return [];
}

const dbWrapper = {
  exec: (sql) => {
    const stmts = sql.split(';').map(s => s.trim()).filter(Boolean);
    stmts.forEach(s => {
      new Statement(s).run();
    });
    saveDb();
  },
  prepare: (sql) => new Statement(sql),
  transaction: (fn) => {
    return (...args) => {
      try {
        const res = fn(...args);
        saveDb();
        return res;
      } catch (err) {
        loadDb(); // rollback
        throw err;
      }
    };
  },
  backup: (backupFilePath) => {
    fs.writeFileSync(backupFilePath, JSON.stringify(dbData, null, 2), 'utf8');
  }
};

module.exports = dbWrapper;
