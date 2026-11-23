const multer = require('multer');
const path = require('path');
const fs = require('fs');

const verificationDocsDir = path.join(__dirname, '../../uploads/verification_docs');
const productImagesDir = path.join(__dirname, '../../uploads/product_images');

if (!fs.existsSync(verificationDocsDir)) {
  fs.mkdirSync(verificationDocsDir, { recursive: true });
}
if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, { recursive: true });
}

// Verification ID document storage (Protected, max 5MB, PDF/JPG/PNG)
const verificationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, verificationDocsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `id-doc-${uniqueSuffix}${ext}`);
  }
});

const verificationFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, JPG, and PNG identity documents up to 5 MB are allowed.'), false);
  }
};

const uploadVerificationDoc = multer({
  storage: verificationStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: verificationFilter
});

// Product Images storage (Max 5MB each, JPG/PNG/WEBP)
const productImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `prod-${uniqueSuffix}${ext}`);
  }
});

const productImageFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Only JPG, PNG, and WEBP product photos are allowed.'), false);
  }
};

const uploadProductImages = multer({
  storage: productImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: productImageFilter
});

module.exports = {
  uploadVerificationDoc,
  uploadProductImages,
  verificationDocsDir,
  productImagesDir
};
