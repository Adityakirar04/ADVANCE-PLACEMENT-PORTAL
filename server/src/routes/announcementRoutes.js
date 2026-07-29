 const express = require('express');
const router = express.Router();

const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  deleteAnnouncement
} = require('../controllers/announcementController');

const { protect, authorize } = require('../middleware/auth');

// POST /api/v1/announcements (TPO only)
router.post('/', protect, authorize('tpo'), createAnnouncement);

// GET /api/v1/announcements (Anyone logged in)
router.get('/', protect, getAllAnnouncements);

// GET /api/v1/announcements/:id
router.get('/:id', protect, getAnnouncementById);

// DELETE /api/v1/announcements/:id (TPO only)
router.delete('/:id', protect, authorize('tpo'), deleteAnnouncement);

module.exports = router;