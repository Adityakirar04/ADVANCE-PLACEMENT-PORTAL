 const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import controllers — names must match exports in jobController.js
const {
  postJob,
  getAllJobs,
  getMyJobs,
  getJob,
  updateJob,
  deleteJob,
  getJobsWithMatch
} = require('../controllers/jobController');

// ============================================
// JOB ROUTES
// ============================================

// Public / Student routes
router.get('/', protect, getAllJobs);              // GET /api/v1/jobs
router.get('/with-match', protect, authorize('student'), getJobsWithMatch);  // GET /api/v1/jobs/with-match
router.get('/:id', protect, getJob);               // GET /api/v1/jobs/:id

// Company routes
router.post('/', protect, authorize('company'), postJob);        // POST /api/v1/jobs
router.get('/my-jobs', protect, authorize('company'), getMyJobs); // GET /api/v1/jobs/my-jobs
router.put('/:id', protect, authorize('company'), updateJob);    // PUT /api/v1/jobs/:id
router.delete('/:id', protect, authorize('company'), deleteJob); // DELETE /api/v1/jobs/:id

module.exports = router;