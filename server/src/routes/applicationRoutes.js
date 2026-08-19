 // server/src/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Apply for a job (Student)
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { job_id } = req.body;

    // Check if already applied
    const existing = await Application.findOne({
      job_id,
      student_id: req.user.id
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied to this job' });
    }

    const application = await Application.create({
      job_id,
      student_id: req.user.id,
      status: 'pending'
    });

    // Increment job application count
    await Job.findByIdAndUpdate(job_id, { $inc: { application_count: 1 } });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my applications (Student)
router.get('/my-applications', protect, authorize('student'), async (req, res) => {
  try {
    const applications = await Application.find({ student_id: req.user.id })
      .populate('job_id', 'title company_name location salary')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get applications for my jobs (Company)
router.get('/company-applications', protect, authorize('company'), async (req, res) => {
  try {
    // Get all jobs posted by this company
    const jobs = await Job.find({ company_id: req.user.id }).select('_id');
    const jobIds = jobs.map(j => j._id);

    const applications = await Application.find({ job_id: { $in: jobIds } })
      .populate('job_id', 'title')
      .populate('student_id', 'first_name last_name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update application status (Company)
router.put('/:id/status', protect, authorize('company'), async (req, res) => {
  try {
    const { status, feedback } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, feedback },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;