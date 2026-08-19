// server/src/routes/companyProfileRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const CompanyProfile = require('../models/CompanyProfile');

// Get my company profile
router.get('/me', protect, authorize('company'), async (req, res) => {
  try {
    const profile = await CompanyProfile.findOne({ user_id: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create/Update company profile
router.post('/', protect, authorize('company'), async (req, res) => {
  try {
    const profile = await CompanyProfile.findOneAndUpdate(
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
router.put('/me', protect, authorize('company'), async (req, res) => {
  try {
    const profile = await CompanyProfile.findOneAndUpdate(
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