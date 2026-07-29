 const { Job, CompanyProfile } = require('../models');

// ============================================
// CREATE JOB (Company only)
// ============================================
const createJob = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user_id: req.user.id });
    if (!companyProfile) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }
    const job = await Job.create({
      company_id: companyProfile._id,
      posted_by: req.user.id,
      ...req.body
    });
    res.status(201).json({ success: true, message: 'Job posted successfully', data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET ALL JOBS
// ============================================
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' })
      .populate('company_id', 'company_name company_type city')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET SINGLE JOB BY ID
// ============================================
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company_id', 'company_name description city website');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET MY JOBS (Company ki posted jobs)
// ============================================
const getMyJobs = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user_id: req.user.id });
    const jobs = await Job.find({ company_id: companyProfile._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// UPDATE JOB
// ============================================
const updateJob = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user_id: req.user.id });
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.company_id.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this job' });
    }
    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// DELETE JOB
// ============================================
const deleteJob = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user_id: req.user.id });
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.company_id.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await job.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// EK HI module.exports - LAST LINE
// ============================================
module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob
};