 const express = require('express');
const router = express.Router();

// ============================================
// MIDDLEWARE IMPORT
// ============================================
// protect     → JWT verify karega (login hai ya nahi)
// authorize   → Role check karega (sirf TPO access kar paaye)
// ============================================
const { protect, authorize } = require('../middleware/auth');

const {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers
} = require('../controllers/tpoController');

// ============================================
// TPO ROUTES
// ============================================
// Har route pe pehle 'protect' chalega (login check),
// phir 'authorize("tpo")' chalega (sirf TPO allowed).
// ============================================

// GET  /api/v1/tpo/pending-users   → Pending approvals dekhne ke liye
router.get('/pending-users', protect, authorize('tpo'), getPendingUsers);

// PUT  /api/v1/tpo/approve-user/:userId   → User approve karo
router.put('/approve-user/:userId', protect, authorize('tpo'), approveUser);

// PUT  /api/v1/tpo/reject-user/:userId    → User reject karo (reason bhi bhejo body mein)
router.put('/reject-user/:userId', protect, authorize('tpo'), rejectUser);

// GET  /api/v1/tpo/all-users       → Sab users + stats dekhne ke liye
router.get('/all-users', protect, authorize('tpo'), getAllUsers);

module.exports = router;