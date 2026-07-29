 const express = require('express');
const router = express.Router();

const { 
  getAllStudents, 
  getStudentById, 
  getAllCompanies, 
  verifyCompany,
  getPlacementStats,
  getRecentActivity
} = require('../controllers/tpoController');

const { protect, authorize } = require('../middleware/auth');

// ============================================
// TPO ROUTES
// ============================================

// GET /api/v1/tpo/students
router.get('/students', protect, authorize('tpo'), getAllStudents);

// GET /api/v1/tpo/students/:id
router.get('/students/:id', protect, authorize('tpo'), getStudentById);

// GET /api/v1/tpo/companies
router.get('/companies', protect, authorize('tpo'), getAllCompanies);

// PUT /api/v1/tpo/companies/:id/verify
router.put('/companies/:id/verify', protect, authorize('tpo'), verifyCompany);

// GET /api/v1/tpo/stats
router.get('/stats', protect, authorize('tpo'), getPlacementStats);

// GET /api/v1/tpo/activity
router.get('/activity', protect, authorize('tpo'), getRecentActivity);

module.exports = router;