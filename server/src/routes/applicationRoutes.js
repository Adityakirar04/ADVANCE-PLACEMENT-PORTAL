const express = require('express');
const router = express.Router();

const { applyForJob, getMyApplications, getJobApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

// ============================================
// ROUTES
// ============================================

// POST /api/v1/applications/apply  → Student apply kare
router.post('/apply', protect, authorize('student'), applyForJob);

// GET /api/v1/applications/my-applications  → Student apni applications dekhe
router.get('/my-applications', protect, authorize('student'), getMyApplications);

// GET /api/v1/applications/job/:jobId  → Company dekhe kisne apply kiya
router.get('/job/:jobId', protect, authorize('company'), getJobApplications);

// PUT /api/v1/applications/:id/status  → Company status update kare
router.put('/:id/status', protect, authorize('company'), updateApplicationStatus);

module.exports = router;