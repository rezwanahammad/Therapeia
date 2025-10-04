const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../services/cloudinary');

const upload = multer({ storage });

// GET /api/upload/status - diagnostic endpoint
router.get('/status', (req, res) => {
  const hasCloudName = !!process.env.CLOUD_NAME;
  const hasApiKey = !!process.env.CLOUD_API_KEY;
  const hasApiSecret = !!process.env.CLOUD_API_SECRET;
  const isConfigured = hasCloudName && hasApiKey && hasApiSecret;
  return res.json({ isConfigured, hasCloudName, hasApiKey, hasApiSecret });
});

// POST /api/upload/image
router.post('/image', (req, res, next) => {
  const hasCloudName = !!process.env.CLOUD_NAME;
  const hasApiKey = !!process.env.CLOUD_API_KEY;
  const hasApiSecret = !!process.env.CLOUD_API_SECRET;
  const isConfigured = hasCloudName && hasApiKey && hasApiSecret;
  if (!isConfigured) {
    return res.status(500).json({ message: 'Cloudinary not configured' });
  }
  const handler = upload.single('image');
  handler(req, res, function (err) {
    if (err) return next(err);
    try {
      const file = req.file;
      if (!file || !file.path) {
        return res.status(400).json({ message: 'No image uploaded' });
      }
      // Multer-Cloudinary returns file.path as the URL
      return res.status(201).json({ url: file.path });
    } catch (e) {
      next(e);
    }
  });
});

module.exports = router;