const express = require('express');
const router = express.Router();

const { createJob, getAllJobs, getJobById, getMyJobs, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// ============================================
// ROUTES
// ============================================

// POST /api/v1/jobs/  → Company job post kare (Sirf Company)
router.post('/', protect, authorize('company'), createJob);

// GET /api/v1/jobs/  → Saari jobs dekho (Student/Company/TPO)
router.get('/', protect, getAllJobs);

// GET /api/v1/jobs/my-jobs  → Company ki posted jobs (Sirf Company)
router.get('/my-jobs', protect, authorize('company'), getMyJobs);

// GET /api/v1/jobs/:id  → Single job dekho
router.get('/:id', protect, getJobById);

// PUT /api/v1/jobs/:id  → Job update karo (Sirf Company)
router.put('/:id', protect, authorize('company'), updateJob);

// DELETE /api/v1/jobs/:id  → Job delete karo (Sirf Company)
router.delete('/:id', protect, authorize('company'), deleteJob);

module.exports = router;