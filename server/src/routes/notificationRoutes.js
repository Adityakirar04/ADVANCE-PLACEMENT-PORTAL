 const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

// GET /api/v1/notifications
router.get('/', protect, getMyNotifications);

// PUT /api/v1/notifications/:notificationId/read
router.put('/:notificationId/read', protect, markAsRead);

// PUT /api/v1/notifications/read-all
router.put('/read-all', protect, markAllAsRead);

module.exports = router;