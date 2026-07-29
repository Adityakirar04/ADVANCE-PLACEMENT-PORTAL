 const express = require('express');
const router = express.Router();

const { createJob, getAllJobs, getJobById, getMyJobs, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('company'), createJob);
router.get('/', protect, getAllJobs);
router.get('/my-jobs', protect, authorize('company'), getMyJobs);
router.get('/:id', protect, getJobById);
router.put('/:id', protect, authorize('company'), updateJob);
router.delete('/:id', protect, authorize('company'), deleteJob);

module.exports = router;