const express = require('express');
const router = express.Router();
const db = require('../db/db');

// List Categories
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
  return res.json({ categories });
});

// Marketplace Product Catalog
router.get('/products', (req, res) => {
  const { search, category, minPrice, maxPrice, material, sortBy } = req.query;

  let query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug, sp.store_name, sp.city as seller_city,
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN seller_profiles sp ON p.seller_profile_id = sp.id
    WHERE p.status = 'PUBLISHED' AND sp.status = 'APPROVED'
  `;

  const params = [];

  if (search) {
    query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.materials LIKE ?)`;
    const searchPattern = `%${search.trim()}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  if (category) {
    query += ` AND (c.id = ? OR c.slug = ?)`;
    params.push(category, category);
  }

  if (minPrice) {
    query += ` AND p.price_egp >= ?`;
    params.push(parseFloat(minPrice));
  }

  if (maxPrice) {
    query += ` AND p.price_egp <= ?`;
    params.push(parseFloat(maxPrice));
  }

  if (material) {
    query += ` AND p.materials LIKE ?`;
    params.push(`%${material.trim()}%`);
  }

  // Sorting
  if (sortBy === 'price_asc') {
    query += ` ORDER BY p.price_egp ASC`;
  } else if (sortBy === 'price_desc') {
    query += ` ORDER BY p.price_egp DESC`;
  } else if (sortBy === 'name') {
    query += ` ORDER BY p.name ASC`;
  } else {
    query += ` ORDER BY p.is_featured DESC, p.created_at DESC`;
  }

  const products = db.prepare(query).all(...params);

  // Attach images for each product
  const productsWithImages = products.map(product => {
    const images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC').all(product.id);
    return {
      ...product,
      images: images.length > 0 ? images : [{ image_url: product.primary_image || 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' }]
    };
  });

  return res.json({ products: productsWithImages });
});

// Single Product Details
router.get('/products/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug,
      sp.id as seller_id, sp.store_name, sp.store_bio, sp.city as seller_city, sp.governorate as seller_governorate, sp.address_details as seller_address, sp.pickup_available,
      u.full_name as seller_person_name
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN seller_profiles sp ON p.seller_profile_id = sp.id
    JOIN users u ON sp.user_id = u.id
    WHERE p.id = ? OR p.slug = ?
  `).get(req.params.id, req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const images = db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC').all(product.id);

  return res.json({
    product: {
      ...product,
      images: images.length > 0 ? images : [{ image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80' }]
    }
  });
});

module.exports = router;
