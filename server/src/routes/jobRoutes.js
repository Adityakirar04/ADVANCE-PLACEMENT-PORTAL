  // server/src/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import controllers
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
// JOB ROUTES — SPECIFIC FIRST, GENERIC LAST
// ============================================

// Public / Student routes
router.get('/', protect, getAllJobs);                    // GET /api/v1/jobs
router.get('/with-match', protect, authorize('student'), getJobsWithMatch);  // GET /api/v1/jobs/with-match
router.get('/my-jobs', protect, authorize('company'), getMyJobs);              // GET /api/v1/jobs/my-jobs
router.post('/fix-company-names', protect, authorize('tpo'), fixCompanyNames); // POST /api/v1/jobs/fix-company-names

// Generic ID route — MUST BE LAST
router.get('/:id', protect, getJob);                   // GET /api/v1/jobs/:id

// Company routes
router.post('/', protect, authorize('company'), postJob);
router.put('/:id', protect, authorize('company'), updateJob);
router.delete('/:id', protect, authorize('company'), deleteJob);

module.exports = router;