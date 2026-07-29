 const { User, StudentProfile, CompanyProfile, Job, Application } = require('../models');

// ============================================
// GET ALL STUDENTS (TPO only)
// ============================================
const getAllStudents = async (req, res) => {
  try {
    const { branch, placement_status, min_cgpa } = req.query;

    let matchStage = {};
    if (branch) matchStage.branch = branch;
    if (placement_status) matchStage.placement_status = placement_status;
    if (min_cgpa) matchStage.cgpa = { $gte: parseFloat(min_cgpa) };

    const students = await StudentProfile.find(matchStage)
      .populate('user_id', 'first_name last_name email phone is_active')
      .sort({ cgpa: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET SINGLE STUDENT DETAIL (TPO only)
// ============================================
const getStudentById = async (req, res) => {
  try {
    const student = await StudentProfile.findById(req.params.id)
      .populate('user_id', 'first_name last_name email phone');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const applications = await Application.find({ student_id: student._id })
      .populate('job_id', 'title company_id location ctc_min ctc_max')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        student,
        applications
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET ALL COMPANIES (TPO only)
// ============================================
const getAllCompanies = async (req, res) => {
  try {
    const companies = await CompanyProfile.find()
      .populate('user_id', 'first_name last_name email phone is_active')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// VERIFY COMPANY (TPO only)
// ============================================
const verifyCompany = async (req, res) => {
  try {
    const { is_verified } = req.body;

    const company = await CompanyProfile.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    company.is_verified = is_verified;
    await company.save();

    res.status(200).json({
      success: true,
      message: `Company ${is_verified ? 'verified' : 'unverified'} successfully`,
      data: company
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// PLACEMENT STATISTICS (TPO Dashboard)
// ============================================
const getPlacementStats = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const placedStudents = await StudentProfile.countDocuments({ placement_status: 'placed' });
    const unplacedStudents = await StudentProfile.countDocuments({ placement_status: 'unplaced' });
    const higherStudies = await StudentProfile.countDocuments({ placement_status: 'higher_studies' });

    const cgpaStats = await StudentProfile.aggregate([
      { $group: { _id: null, avgCgpa: { $avg: '$cgpa' } } }
    ]);
    const averageCgpa = cgpaStats.length > 0 ? cgpaStats[0].avgCgpa.toFixed(2) : 0;

    const packageStats = await StudentProfile.aggregate([
      { $match: { placement_status: 'placed', package_lpa: { $ne: null } } },
      { $group: { _id: null, avgPackage: { $avg: '$package_lpa' } } }
    ]);
    const averagePackage = packageStats.length > 0 ? packageStats[0].avgPackage.toFixed(2) : 0;

    const totalCompanies = await CompanyProfile.countDocuments();
    const verifiedCompanies = await CompanyProfile.countDocuments({ is_verified: true });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await Application.countDocuments();

    const branchStats = await StudentProfile.aggregate([
      { $group: {
        _id: '$branch',
        total: { $sum: 1 },
        placed: { $sum: { $cond: [{ $eq: ['$placement_status', 'placed'] }, 1, 0] } },
        avgCgpa: { $avg: '$cgpa' }
      }}
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudents,
          placedStudents,
          unplacedStudents,
          higherStudies,
          averageCgpa,
          averagePackage,
          totalCompanies,
          verifiedCompanies,
          totalJobs,
          activeJobs,
          totalApplications
        },
        branchWise: branchStats
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET RECENT ACTIVITY (TPO Dashboard)
// ============================================
const getRecentActivity = async (req, res) => {
  try {
    const recentApplications = await Application.find()
      .populate('student_id', 'enrollment_number branch')
      .populate('job_id', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentJobs = await Job.find()
      .populate('company_id', 'company_name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        recentApplications,
        recentJobs
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// EK HI module.exports - LAST LINE
// ============================================
module.exports = {
  getAllStudents,
  getStudentById,
  getAllCompanies,
  verifyCompany,
  getPlacementStats,
  getRecentActivity
};