const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/db');
const { JWT_SECRET, authenticateToken } = require('../middleware/authMiddleware');

// Register Buyer or Seller
router.post('/register', async (req, res) => {
  const { email, password, fullName, phoneNumber, role, storeName, storeBio, city, governorate, addressDetails, consentDataLaw } = req.body;

  if (!email || !password || !fullName || !phoneNumber) {
    return res.status(400).json({ error: 'Please fill in all required fields (email, password, full name, phone number).' });
  }

  if (!consentDataLaw) {
    return res.status(400).json({ error: 'You must consent to data processing under Egypt Data Protection Law No. 151 of 2020 to create an account.' });
  }

  const targetRole = role === 'SELLER' ? 'SELLER' : 'BUYER';

  // Check existing user
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const userId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);

  const insertUserStmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, phone_number, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  try {
    db.transaction(() => {
      insertUserStmt.run(userId, email.toLowerCase().trim(), passwordHash, fullName.trim(), phoneNumber.trim(), targetRole);

      if (targetRole === 'SELLER') {
        const sellerProfileId = uuidv4();
        db.prepare(`
          INSERT INTO seller_profiles (id, user_id, store_name, store_bio, city, governorate, address_details, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_VERIFICATION')
        `).run(
          sellerProfileId,
          userId,
          storeName || `${fullName}'s Craft Studio`,
          storeBio || '',
          city || 'Cairo',
          governorate || 'Cairo',
          addressDetails || ''
        );
      }
    })();

    const token = jwt.sign({ id: userId, role: targetRole }, JWT_SECRET, { expiresIn: '7d' });

    const user = db.prepare('SELECT id, email, full_name, phone_number, role FROM users WHERE id = ?').get(userId);
    let sellerProfile = null;
    if (targetRole === 'SELLER') {
      sellerProfile = db.prepare('SELECT * FROM seller_profiles WHERE user_id = ?').get(userId);
    }

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user,
      sellerProfile
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter your email and password.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  let sellerProfile = null;
  if (user.role === 'SELLER') {
    sellerProfile = db.prepare('SELECT * FROM seller_profiles WHERE user_id = ?').get(user.id);
  }

  return res.json({
    message: 'Signed in successfully.',
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phoneNumber: user.phone_number,
      role: user.role
    },
    sellerProfile
  });
});

// Current user details
router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    user: req.user,
    sellerProfile: req.sellerProfile || null
  });
});

module.exports = router;
