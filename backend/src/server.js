const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static product images ONLY (Identity documents are protected and served via /api/admin/verifications/docs/:docId)
app.use('/uploads/product_images', express.static(path.join(__dirname, '../uploads/product_images')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/categories', productRoutes); // Category endpoint alias

// Healthcheck & performance monitoring endpoint
app.get('/api/health', (req, res) => {
  const start = Date.now();
  res.json({
    status: 'healthy',
    app: 'Fi Byti Egyptian Artisan Marketplace',
    timestamp: new Date().toISOString(),
    responseTimeMs: Date.now() - start
  });
});

// Serve frontend static build files if running in production mode
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
if (require('fs').existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  Fi Byti (في بيتي) Server running on port ${PORT}`);
  console.log(`  API Base: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});
