const jwt = require('jsonwebtoken');
const db = require('../db/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fi_byti_secret_jwt_key_2026_egypt_artisan_crafts_key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, full_name, phone_number, role FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User session invalid or expired.' });
    }

    req.user = user;

    // If user is a seller, load seller profile
    if (user.role === 'SELLER') {
      const sellerProfile = db.prepare('SELECT * FROM seller_profiles WHERE user_id = ?').get(user.id);
      req.sellerProfile = sellerProfile || null;
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token.' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires ${allowedRoles.join(' or ')} privileges.`
      });
    }

    next();
  };
}

function requireApprovedSeller(req, res, next) {
  if (req.user.role !== 'SELLER') {
    return res.status(403).json({ error: 'Only sellers can perform this operation.' });
  }

  if (!req.sellerProfile || req.sellerProfile.status !== 'APPROVED') {
    return res.status(403).json({
      error: 'Your store profile is not approved yet. Seller verification is pending review by an administrator.',
      sellerStatus: req.sellerProfile ? req.sellerProfile.status : 'NO_PROFILE'
    });
  }

  next();
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireRole,
  requireApprovedSeller
};
