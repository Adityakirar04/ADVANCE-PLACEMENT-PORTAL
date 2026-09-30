 const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');

// ============================================
// APPLY FOR A JOB (Student)
// ============================================
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({ success: false, message: 'job_id is required' });
    }

    const job = await Job.findOne({ _id: job_id, status: 'active' });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or no longer active' });
    }

    const existing = await Application.findOne({
      job_id,
      student_id: req.user.id
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        alreadyApplied: true,
        applicationId: existing._id,
        status: existing.status === 'pending' ? 'applied' : existing.status,
        message: 'Already applied to this job'
      });
    }

    // Save a snapshot of the student's current placement information.
    const profile = await StudentProfile.findOne({ user_id: req.user.id });

    const application = await Application.create({
      job_id,
      student_id: req.user.id,
      applied_cgpa: profile?.cgpa || 0,
      applied_skills: profile?.skills || [],
      applied_resume_url: profile?.resume_url || '',
      status: 'applied',
      applied_at: new Date()
    });

    await Job.findByIdAndUpdate(job_id, { $inc: { application_count: 1 } });

    // Tell the company that a new applicant has arrived.
    try {
      await Notification.create({
        user_id: job.company_id,
        title: 'New Job Application',
        message: `A student applied for ${job.title}. Open Applications to review the candidate.`,
        type: 'application_status',
        link: `/company-applications`,
        read: false
      });
    } catch (notificationError) {
      console.error('Application notification error:', notificationError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    // Unique index can also catch a race-condition duplicate application.
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        alreadyApplied: true,
        message: 'Already applied to this job'
      });
    }

    console.error('Apply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET MY APPLICATIONS (Student)
// ============================================
router.get('/my-applications', protect, authorize('student'), async (req, res) => {
  try {
    const applications = await Application.find({ student_id: req.user.id })
      .populate('job_id', 'title company_name company_id location salary requirements status')
      .sort({ createdAt: -1 })
      .lean();

    const normalized = applications.map(app => ({
      ...app,
      status: app.status === 'pending' ? 'applied' : app.status,
      applied_at: app.applied_at || app.createdAt
    }));

    res.json({ success: true, count: normalized.length, data: normalized });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET APPLICATIONS FOR A SPECIFIC COMPANY JOB
// This is the endpoint used by CompanyApplications.jsx
// ============================================
router.get('/job/:jobId', protect, authorize('company'), async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      company_id: req.user.id
    }).select('_id title company_name location status');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you are not the owner of this job'
      });
    }

    const applications = await Application.find({ job_id: job._id })
      .populate('student_id', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .lean();

    const studentIds = applications
      .map(app => app.student_id?._id)
      .filter(Boolean);

    const profiles = await StudentProfile.find({ user_id: { $in: studentIds } }).lean();
    const profileMap = new Map(
      profiles.map(profile => [profile.user_id.toString(), profile])
    );

    const enriched = applications.map(app => {
      const profile = app.student_id
        ? profileMap.get(app.student_id._id.toString())
        : null;

      const student = app.student_id || {};

      return {
        ...app,
        status: app.status === 'pending' ? 'applied' : app.status,
        applied_at: app.applied_at || app.createdAt,
        student_id: {
          ...student,
          enrollment_number: profile?.enrollment_number || '',
          branch: profile?.branch || '',
          cgpa: profile?.cgpa ?? 0,
          skills: profile?.skills || [],
          backlogs: profile?.backlogs ?? 0,
          graduation_year: profile?.graduation_year || '',
          resume_url: app.applied_resume_url || profile?.resume_url || ''
        }
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// GET ALL APPLICATIONS FOR COMPANY
// ============================================
router.get('/company-applications', protect, authorize('company'), async (req, res) => {
  try {
    const jobs = await Job.find({ company_id: req.user.id }).select('_id title');
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ job_id: { $in: jobIds } })
      .populate('job_id', 'title')
      .populate('student_id', 'first_name last_name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error('Get company applications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// UPDATE APPLICATION STATUS (Company)
// ============================================
router.put('/:id/status', protect, authorize('company'), async (req, res) => {
  try {
    const { status, feedback = '' } = req.body;

    const validStatuses = [
      'applied',
      'under_review',
      'shortlisted',
      'rejected',
      'interview_scheduled',
      'interview_completed',
      'selected',
      'offer_accepted',
      'offer_declined',
      'hired'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid application status' });
    }

    const application = await Application.findById(req.params.id).populate('job_id', 'title company_id');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.job_id.company_id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
    }

    application.status = status;
    application.feedback = feedback;

    if (status === 'shortlisted') application.shortlisted_at = new Date();
    if (status === 'rejected') application.rejected_at = new Date();
    if (status === 'interview_scheduled') application.interview_scheduled_at = new Date();
    if (status === 'selected') application.selected_at = new Date();

    await application.save();

    // Student gets a notification so they can see the next step.
    try {
      const statusLabel = status.replace(/_/g, ' ');
      await Notification.create({
        user_id: application.student_id,
        title: 'Application Status Updated',
        message: `Your application for ${application.job_id.title} is now: ${statusLabel}.`,
        type: 'application_status',
        link: '/applications',
        read: false
      });
    } catch (notificationError) {
      console.error('Status notification error:', notificationError.message);
    }

    res.json({
      success: true,
      message: `Application status updated to '${status}'`,
      data: application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
