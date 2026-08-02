 const Job = require('../models/Job');
const CompanyProfile = require('../models/CompanyProfile');
const StudentProfile = require('../models/StudentProfile');

// ============================================
// POST JOB
// ============================================
exports.postJob = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user_id: req.user.userId });

    if (!companyProfile) {
      return res.status(400).json({
        success: false,
        message: 'Company profile not found. Please update your profile first.'
      });
    }

    const job = await Job.create({
      ...req.body,
      company_id: req.user.userId,
      company_name: companyProfile.company_name || 'Unknown Company',
      posted_by: req.user.userId
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error('Post job error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET ALL JOBS — With company name from CompanyProfile
// ============================================
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();

    if (jobs.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // 🔥 FIX: Sab unique company IDs nikaalo
    const companyIds = [...new Set(
      jobs.map(j => j.company_id?.toString()).filter(Boolean)
    )];

    // 🔥 FIX: Ek hi query mein saari company profiles lao
    const profiles = await CompanyProfile.find({
      user_id: { $in: companyIds }
    }).select('user_id company_name').lean();

    // 🔥 FIX: Map banao: user_id -> company_name
    const companyMap = {};
    profiles.forEach(p => {
      companyMap[p.user_id.toString()] = p.company_name || 'Unknown Company';
    });

    // 🔥 FIX: Har job mein company_name set karo
    const enrichedJobs = jobs.map(job => ({
      ...job,
      company_name: companyMap[job.company_id?.toString()] || job.company_name || 'N/A'
    }));

    res.status(200).json({ success: true, count: enrichedJobs.length, data: enrichedJobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET MY JOBS — For company
// ============================================
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company_id: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET SINGLE JOB
// ============================================
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Get company name from profile if missing
    let companyName = job.company_name;
    if (!companyName || companyName === 'N/A') {
      const profile = await CompanyProfile.findOne({ user_id: job.company_id }).select('company_name').lean();
      companyName = profile?.company_name || 'N/A';
    }

    res.status(200).json({ 
      success: true, 
      data: {
        ...job.toObject(),
        company_name: companyName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// UPDATE JOB
// ============================================
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, company_id: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// DELETE JOB
// ============================================
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      company_id: req.user.userId
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET JOBS WITH MATCH % (for students)
// ============================================
exports.getJobsWithMatch = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user_id: req.user.userId }).lean();
    const studentSkills = studentProfile?.skills || [];

    const jobs = await Job.find().sort({ createdAt: -1 }).lean();

    // Get all company profiles in one query
    const companyIds = [...new Set(jobs.map(j => j.company_id?.toString()).filter(Boolean))];
    const profiles = await CompanyProfile.find({
      user_id: { $in: companyIds }
    }).select('user_id company_name').lean();

    const companyMap = {};
    profiles.forEach(p => {
      companyMap[p.user_id.toString()] = p.company_name || 'Unknown Company';
    });

    const enrichedJobs = jobs.map(job => {
      // Get company name
      const companyName = companyMap[job.company_id?.toString()] || job.company_name || 'N/A';

      // Calculate match %
      const requiredSkills = job.required_skills || [];
      let matched = 0;
      if (requiredSkills.length > 0 && studentSkills.length > 0) {
        matched = requiredSkills.filter(skill => 
          studentSkills.some(s => s.toLowerCase() === skill.toLowerCase())
        ).length;
      }
      const matchPercent = requiredSkills.length > 0 
        ? Math.round((matched / requiredSkills.length) * 100) 
        : 0;

      return {
        ...job,
        company_name: companyName,
        matchPercent,
        matchedSkills: matched,
        totalSkills: requiredSkills.length
      };
    });

    res.status(200).json({ success: true, data: enrichedJobs });
  } catch (error) {
    console.error('Get jobs with match error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};