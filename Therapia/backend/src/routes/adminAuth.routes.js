const express = require('express');
const router = express.Router();
const { register, login, logout, me } = require('../controllers/adminAuth.controller');
const adminAuth = require('../middleware/adminAuth');

// Public admin auth endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);

// Protected example endpoint to verify middleware
router.get('/protected', adminAuth, (req, res) => {
  res.json({ ok: true, adminId: req.adminId });
});

module.exports = router;