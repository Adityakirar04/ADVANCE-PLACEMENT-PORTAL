   // server/src/controllers/jobController.js
const Job = require('../models/Job');
const CompanyProfile = require('../models/CompanyProfile');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');

// ============================================
// POST A NEW JOB (Company only)
// ============================================
exports.postJob = async (req, res) => {
  try {
    const companyId = req.user.id;

    // Step 1: Get company name from profile or user
    let companyName = null;
    const companyProfile = await CompanyProfile.findOne({ user_id: companyId });

    if (companyProfile && companyProfile.company_name && companyProfile.company_name.trim() !== '') {
      companyName = companyProfile.company_name.trim();
    } else {
      // Fallback: Use user's first + last name
      const user = await User.findById(companyId);
      if (user) {
        companyName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      }
    }

    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: 'Company name is empty. Please update your company profile first.'
      });
    }

    // Step 2: Clean salary data
    const salary = req.body.salary || {};
    const cleanSalary = {
      min: Number(salary.min) || 0,
      max: Number(salary.max) || 0,
      currency: salary.currency || 'INR'
    };

    // Step 3: Clean requirements data
    const requirements = req.body.requirements || {};
    const cleanRequirements = {
      cgpa: Number(requirements.cgpa) || 0,
      backlogs: Number(requirements.backlogs) || 0,
      branches: Array.isArray(requirements.branches) ? requirements.branches : 
                (requirements.branches ? [requirements.branches] : ['Computer Science', 'Information Technology'])
    };

    // Step 4: Create job
    const jobData = {
      ...req.body,
      company_id: companyId,
      company_name: companyName,
      salary: cleanSalary,
      requirements: cleanRequirements,
      status: req.body.status || 'active',
      isApproved: req.body.isApproved !== undefined ? req.body.isApproved : true
    };

    const job = await Job.create(jobData);

    console.log(`🏢 Job posted: ${job.title} | Company: ${job.company_name}`);

    // Step 5: Send notifications to all approved students
    try {
      const students = await User.find({
        role: 'student',
        isApproved: true
      }).select('_id');

      if (students.length > 0) {
        const notifications = students.map(student => ({
          user_id: student._id,
          message: `New job posted: ${job.title} at ${job.company_name}`,
          type: 'job_posted',
          related_id: job._id
        }));

        await Notification.insertMany(notifications);
        console.log(`📧 Sent ${notifications.length} notifications to students`);
      }
    } catch (notifErr) {
      console.error('Notification error (non-critical):', notifErr.message);
    }

    res.status(201).json({
      success: true,
      data: job,
      message: 'Job posted successfully!'
    });

  } catch (error) {
    console.error('Post Job Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to post job'
    });
  }
};

// ============================================
// GET ALL JOBS (For Students)
// ============================================
exports.getAllJobs = async (req, res) => {
  try {
    // Get student's skills for matching
    let studentSkills = [];
    try {
      const studentProfile = await StudentProfile.findOne({ user_id: req.user.id });
      if (studentProfile && studentProfile.skills) {
        studentSkills = studentProfile.skills.map(s => s.toLowerCase().trim());
      }
    } catch (e) {
      console.log('Student profile not found for matching');
    }

    // Fetch all active jobs
    const jobs = await Job.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`🔍 Found ${jobs.length} active jobs`);

    // Collect all company IDs that need name lookup
    const companyIdsNeedingName = [];
    jobs.forEach(job => {
      if (!job.company_name || job.company_name === 'N/A' || job.company_name === '') {
        companyIdsNeedingName.push(job.company_id.toString());
      }
    });

    // Fetch company profiles in bulk
    const profileMap = {};
    const userMap = {};

    if (companyIdsNeedingName.length > 0) {
      const uniqueIds = [...new Set(companyIdsNeedingName)];

      // Get company profiles
      const profiles = await CompanyProfile.find({
        user_id: { $in: uniqueIds }
      }).select('user_id company_name');

      profiles.forEach(p => {
        profileMap[p.user_id.toString()] = p.company_name;
      });

      // Get user fallbacks for missing profiles
      const users = await User.find({
        _id: { $in: uniqueIds }
      }).select('first_name last_name');

      users.forEach(u => {
        userMap[u._id.toString()] = `${u.first_name || ''} ${u.last_name || ''}`.trim();
      });
    }

    // Enhance jobs with company names and match scores
    const enhancedJobs = jobs.map(job => {
      const jobObj = { ...job };

      // Fix company name
      let finalCompanyName = job.company_name;
      if (!finalCompanyName || finalCompanyName === 'N/A' || finalCompanyName === '') {
        const profileName = profileMap[job.company_id.toString()];
        const userName = userMap[job.company_id.toString()];
        finalCompanyName = profileName || userName || 'Unknown Company';
      }
      jobObj.company_name = finalCompanyName;

      // Fix salary display
      const salary = job.salary || {};
      jobObj.salary_display = {
        min: Number(salary.min) || 0,
        max: Number(salary.max) || 0,
        currency: salary.currency || 'INR',
        formatted: formatSalary(salary.min, salary.max, salary.currency)
      };

      // Fix requirements display
      const req = job.requirements || {};
      jobObj.requirements_display = {
        cgpa: Number(req.cgpa) || 0,
        backlogs: Number(req.backlogs) || 0,
        branches: Array.isArray(req.branches) ? req.branches : 
                  (req.branches ? [req.branches] : ['Computer Science', 'Information Technology'])
      };

      // Calculate match score
      const jobSkills = (job.skills_required || []).map(s => s.toLowerCase().trim());
      let matchCount = 0;
      if (studentSkills.length > 0 && jobSkills.length > 0) {
        matchCount = jobSkills.filter(skill => 
          studentSkills.some(ss => ss.includes(skill) || skill.includes(ss))
        ).length;
      }
      const matchScore = jobSkills.length > 0 
        ? Math.round((matchCount / jobSkills.length) * 100) 
        : 0;

      jobObj.match_score = matchScore;
      jobObj.match_count = matchCount;
      jobObj.total_skills = jobSkills.length;

      return jobObj;
    });

    res.json({
      success: true,
      count: enhancedJobs.length,
      data: enhancedJobs
    });

  } catch (error) {
    console.error('Get All Jobs Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// GET COMPANY'S OWN JOBS
// ============================================
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company_id: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Get company name
    const companyProfile = await CompanyProfile.findOne({ user_id: req.user.id });
    const user = await User.findById(req.user.id);
    const companyName = (companyProfile?.company_name) || 
                        `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 
                        'Your Company';

    const enhancedJobs = jobs.map(job => {
      const jobObj = { ...job };
      jobObj.company_name = companyName;

      const salary = job.salary || {};
      jobObj.salary_display = {
        formatted: formatSalary(salary.min, salary.max, salary.currency)
      };

      return jobObj;
    });

    res.json({
      success: true,
      count: enhancedJobs.length,
      data: enhancedJobs
    });

  } catch (error) {
    console.error('Get My Jobs Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// GET SINGLE JOB
// ============================================
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Fix company name
    let companyName = job.company_name;
    if (!companyName || companyName === 'N/A' || companyName === '') {
      const profile = await CompanyProfile.findOne({ user_id: job.company_id });
      const user = await User.findById(job.company_id);
      companyName = profile?.company_name || 
                     `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 
                     'Unknown Company';
    }
    job.company_name = companyName;

    // Fix salary display
    const salary = job.salary || {};
    job.salary_display = {
      formatted: formatSalary(salary.min, salary.max, salary.currency)
    };

    res.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Get Job Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// UPDATE JOB
// ============================================
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, company_id: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    res.json({
      success: true,
      data: job,
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('Update Job Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// DELETE JOB
// ============================================
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      company_id: req.user.id
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Delete Job Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// GET JOBS WITH MATCH SCORE (Student)
// ============================================
exports.getJobsWithMatch = async (req, res) => {
  try {
    // Get student skills
    const studentProfile = await StudentProfile.findOne({ user_id: req.user.id });
    const studentSkills = (studentProfile?.skills || []).map(s => s.toLowerCase().trim());

    const jobs = await Job.find({ status: 'active' }).lean();

    const jobsWithMatch = jobs.map(job => {
      const jobSkills = (job.skills_required || []).map(s => s.toLowerCase().trim());
      const matched = jobSkills.filter(skill =>
        studentSkills.some(ss => ss.includes(skill) || skill.includes(ss))
      );

      return {
        ...job,
        match_score: jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 0,
        matched_skills: matched,
        total_skills: jobSkills.length
      };
    });

    // Sort by match score
    jobsWithMatch.sort((a, b) => b.match_score - a.match_score);

    res.json({
      success: true,
      data: jobsWithMatch
    });

  } catch (error) {
    console.error('Get Jobs With Match Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// FIX COMPANY NAMES (One-time migration)
// ============================================
exports.fixCompanyNames = async (req, res) => {
  try {
    const jobs = await Job.find({
      $or: [
        { company_name: { $exists: false } },
        { company_name: null },
        { company_name: '' },
        { company_name: 'N/A' }
      ]
    });

    console.log(`🔧 Found ${jobs.length} jobs with missing company names`);

    let fixed = 0;
    for (const job of jobs) {
      const profile = await CompanyProfile.findOne({ user_id: job.company_id });
      const user = await User.findById(job.company_id);

      const name = profile?.company_name || 
                   `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 
                   'Unknown Company';

      await Job.findByIdAndUpdate(job._id, { company_name: name });
      fixed++;
      console.log(`   ✅ Fixed: ${job.title} → ${name}`);
    }

    res.json({
      success: true,
      message: `Fixed ${fixed}/${jobs.length} jobs`,
      fixed
    });

  } catch (error) {
    console.error('Fix Company Names Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// HELPER: Format Salary
// ============================================
function formatSalary(min, max, currency = 'INR') {
  const minVal = Number(min) || 0;
  const maxVal = Number(max) || 0;
  const symbol = currency === 'INR' ? '₹' : (currency === 'USD' ? '$' : currency);

  if (minVal === 0 && maxVal === 0) return 'Not Disclosed';
  if (minVal === 0) return `${symbol}${(maxVal / 100000).toFixed(1)}L`;
  if (maxVal === 0) return `${symbol}${(minVal / 100000).toFixed(1)}L`;

  return `${symbol}${(minVal / 100000).toFixed(1)}L - ${symbol}${(maxVal / 100000).toFixed(1)}L`;
}