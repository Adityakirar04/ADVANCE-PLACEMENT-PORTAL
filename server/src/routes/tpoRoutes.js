  // server/src/routes/tpoRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// Get all pending approvals
router.get('/pending-users', protect, authorize('tpo'), async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ['student', 'company'] },
      isApproved: false
    }).select('-password');

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve a user
router.put('/approve/:id', protect, authorize('tpo'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: `${user.first_name} approved!`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject/Delete a user
router.delete('/reject/:id', protect, authorize('tpo'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User rejected and removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users
router.get('/all-users', protect, authorize('tpo'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;