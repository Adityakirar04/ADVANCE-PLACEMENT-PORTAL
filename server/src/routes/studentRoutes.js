 const express = require('express');
const router = express.Router();

const { updateProfile, getMyProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// GET /api/v1/students/profile
router.get('/profile', protect, authorize('student'), getMyProfile);

// PUT /api/v1/students/profile
router.put('/profile', protect, authorize('student'), updateProfile);

module.exports = router;