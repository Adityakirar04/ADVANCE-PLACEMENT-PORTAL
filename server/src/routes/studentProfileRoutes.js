 // server/src/routes/studentProfileRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const StudentProfile = require('../models/StudentProfile');

// Get my profile
router.get('/me', protect, authorize('student'), async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user_id: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create/Update profile
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { user_id: req.user.id },
      { ...req.body, user_id: req.user.id },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile
router.put('/me', protect, authorize('student'), async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { user_id: req.user.id },
      req.body,
      { new: true }
    );
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;