 const { Application, Job, StudentProfile, CompanyProfile } = require('../models');

// ============================================
// APPLY FOR JOB (Student only)
// ============================================
exports.applyForJob = async (req, res) => {
  try {
    const { job_id } = req.body;

    // Student ka profile find karo
    const studentProfile = await StudentProfile.findOne({ user_id: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Job find karo
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // ========================================
    // ELIGIBILITY CHECK
    // ========================================

    // 1. CGPA Check
    if (job.min_cgpa && studentProfile.cgpa < job.min_cgpa) {
      return res.status(400).json({
        success: false,
        message: `You do not meet the CGPA requirement. Required: ${job.min_cgpa}, Your CGPA: ${studentProfile.cgpa}`
      });
    }

    // 2. Backlogs Check
    if (job.max_backlogs !== undefined && studentProfile.backlogs > job.max_backlogs) {
      return res.status(400).json({
        success: false,
        message: `You have too many active backlogs. Max allowed: ${job.max_backlogs}, Your backlogs: ${studentProfile.backlogs}`
      });
    }

    // 3. Branch Check
    if (job.eligible_branches && job.eligible_branches.length > 0) {
      if (!job.eligible_branches.includes(studentProfile.branch)) {
        return res.status(400).json({
          success: false,
          message: `Your branch '${studentProfile.branch}' is not eligible for this job`
        });
      }
    }

    // 4. Already Applied Check
    const existing = await Application.findOne({
      job_id,
      student_id: studentProfile._id
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // ========================================
    // CREATE APPLICATION (with resume & skills)
    // ========================================

    const application = await Application.create({
      job_id,
      student_id: studentProfile._id,
      applied_cgpa: studentProfile.cgpa,
      applied_skills: studentProfile.skills || [],
      applied_resume_url: studentProfile.resume_url || null,
      status: 'applied'
    });

    // Job ke total applications badhao
    job.total_applications = (job.total_applications || 0) + 1;
    await job.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET MY APPLICATIONS (Student)
// ============================================
exports.getMyApplications = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user_id: req.user.id });

    const applications = await Application.find({ student_id: studentProfile._id })
      .populate('job_id', 'title company_id location ctc_min ctc_max status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET JOB APPLICATIONS (Company - Who applied?)
// ============================================
exports.getJobApplications = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user_id: req.user.id });
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check: Ye job isi company ki hai?
    if (job.company_id.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these applications' });
    }

    const applications = await Application.find({ job_id: req.params.jobId })
      .populate('student_id', 'enrollment_number branch cgpa skills backlogs graduation_year resume_url')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// UPDATE APPLICATION STATUS (Company)
// ============================================
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const companyProfile = await CompanyProfile.findOne({ user_id: req.user.id });

    const application = await Application.findById(req.params.id).populate('job_id');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Check: Ye application isi company ki job ki hai?
    if (application.job_id.company_id.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Valid status check
    const validStatuses = ['applied', 'under_review', 'shortlisted', 'rejected', 'interview_scheduled', 'interview_completed', 'selected', 'offer_accepted', 'offer_declined'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Status update karo
    application.status = status;

    if (status === 'shortlisted') application.shortlisted_at = new Date();
    if (status === 'rejected') application.rejected_at = new Date();
    if (status === 'interview_scheduled') application.interview_scheduled_at = new Date();
    if (status === 'selected') application.selected_at = new Date();

    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to '${status}'`,
      data: application
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};