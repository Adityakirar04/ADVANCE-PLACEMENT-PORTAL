 const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  postJob,
  getAllJobs,
  getMyJobs,
  getJob,
  updateJob,
  deleteJob,
  getJobsWithMatch,
  fixCompanyNames
} = require('../controllers/jobController');

// ============================================
// IMPORTANT: Specific routes BEFORE /:id
// ============================================

// GET /api/v1/jobs/my-jobs — MUST be before /:id
router.get('/my-jobs', protect, authorize('company'), getMyJobs);

// GET /api/v1/jobs/with-match — MUST be before /:id
router.get('/with-match', protect, authorize('student'), getJobsWithMatch);

// GET /api/v1/jobs/fix-company-names — MUST be before /:id
router.post('/fix-company-names', protect, authorize('tpo'), fixCompanyNames);

// ============================================
// Generic routes AFTER specific routes
// ============================================

// GET /api/v1/jobs — All jobs
router.get('/', protect, getAllJobs);

// GET /api/v1/jobs/:id — Single job
router.get('/:id', protect, getJob);

// POST /api/v1/jobs — Create job
router.post('/', protect, authorize('company'), postJob);

// PUT /api/v1/jobs/:id — Update job
router.put('/:id', protect, authorize('company'), updateJob);

// DELETE /api/v1/jobs/:id — Delete job
router.delete('/:id', protect, authorize('company'), deleteJob);

module.exports = router;