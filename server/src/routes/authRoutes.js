const express = require('express');
const router = express.Router();

// Controllers
const { register, login, getMe } = require('../controllers/authController');

// Middleware
const { protect } = require('../middleware/auth');

// ============================================
// ROUTES
// ============================================

// POST /api/v1/auth/register
router.post('/register', register);

// POST /api/v1/auth/login
router.post('/login', login);

// GET /api/v1/auth/me (Protected: Token chahiye)
router.get('/me', protect, getMe);

module.exports = router;