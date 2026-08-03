 const Job = require('../models/Job');
const CompanyProfile = require('../models/CompanyProfile');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { notifyAllStudents } = require('../controllers/notificationController');

// ============================================
// POST JOB — Save company_name properly
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

    let companyName = companyProfile.company_name?.trim();

    if (!companyName) {
      // 🔥 FALLBACK: User se name lao
      const user = await User.findById(req.user.userId).select('first_name last_name');
      companyName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Unknown Company';
    }

    console.log('🏢 Posting job for company:', companyName);

    const job = await Job.create({
      ...req.body,
      company_id: req.user.userId,
      company_name: companyName,
      posted_by: req.user.userId
    });

    console.log('✅ Job posted:', job.title, '| Company:', job.company_name);

    await notifyAllStudents(
      '📢 New Job Posted!',
      `${companyName} posted a new job: ${job.title}`,
      '/jobs'
    );

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error('❌ Post job error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET ALL JOBS — With User fallback for company name
// ============================================
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();

    if (jobs.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const companyIds = [...new Set(
      jobs.map(j => j.company_id?.toString()).filter(Boolean)
    )];

    console.log('🔍 Looking up companies:', companyIds.length);

    // Fetch company profiles
    const profiles = await CompanyProfile.find({
      user_id: { $in: companyIds }
    }).select('user_id company_name').lean();

    // 🔥 FALLBACK: Fetch User names for missing/empty profiles
    const userIdsNeedingFallback = [];
    profiles.forEach(p => {
      if (!p.company_name?.trim()) {
        userIdsNeedingFallback.push(p.user_id.toString());
      }
    });

    // Also add IDs that have no profile at all
    const profileIds = profiles.map(p => p.user_id.toString());
    companyIds.forEach(id => {
      if (!profileIds.includes(id)) {
        userIdsNeedingFallback.push(id);
      }
    });

    // Fetch User names
    let userMap = {};
    if (userIdsNeedingFallback.length > 0) {
      const users = await User.find({
        _id: { $in: userIdsNeedingFallback }
      }).select('_id first_name last_name').lean();

      users.forEach(u => {
        userMap[u._id.toString()] = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown Company';
      });

      console.log('👤 User fallbacks:', users.length);
    }

    console.log('📋 Found profiles:', profiles.length);
    profiles.forEach(p => {
      console.log('   →', p.user_id.toString(), ':', p.company_name || '(empty, will use User name)');
    });

    // Build lookup map
    const companyMap = {};
    profiles.forEach(p => {
      const cid = p.user_id.toString();
      const name = p.company_name?.trim();
      companyMap[cid] = name || userMap[cid] || 'Unknown Company';
    });

    // Also add user fallbacks for missing profiles
    Object.keys(userMap).forEach(uid => {
      if (!companyMap[uid]) {
        companyMap[uid] = userMap[uid];
      }
    });

    // Enrich jobs
    const enrichedJobs = [];
    for (const job of jobs) {
      const cid = job.company_id?.toString();
      let companyName = job.company_name;

      if (!companyName || companyName === 'N/A' || companyName === '') {
        companyName = companyMap[cid] || userMap[cid] || 'Unknown Company';

        // Update DB for future
        if (companyName !== 'N/A' && companyName !== 'Unknown Company') {
          Job.findByIdAndUpdate(job._id, { company_name: companyName }).catch(() => {});
        }
      }

      enrichedJobs.push({ ...job, company_name: companyName });
    }

    res.status(200).json({ success: true, count: enrichedJobs.length, data: enrichedJobs });
  } catch (error) {
    console.error('❌ Get jobs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET MY JOBS
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

    let companyName = job.company_name;
    if (!companyName || companyName === 'N/A') {
      const profile = await CompanyProfile.findOne({ user_id: job.company_id }).select('company_name').lean();
      companyName = profile?.company_name?.trim();

      if (!companyName) {
        const user = await User.findById(job.company_id).select('first_name last_name').lean();
        companyName = user ? `${user.first_name} ${user.last_name}`.trim() : 'Unknown Company';
      }
    }

    res.status(200).json({ 
      success: true, 
      data: { ...job.toObject(), company_name: companyName }
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
// GET JOBS WITH MATCH %
// ============================================
exports.getJobsWithMatch = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user_id: req.user.userId }).lean();
    const studentSkills = studentProfile?.skills || [];

    const jobs = await Job.find().sort({ createdAt: -1 }).lean();

    const companyIds = [...new Set(jobs.map(j => j.company_id?.toString()).filter(Boolean))];
    const profiles = await CompanyProfile.find({
      user_id: { $in: companyIds }
    }).select('user_id company_name').lean();

    const profileIds = profiles.map(p => p.user_id.toString());
    const missingIds = companyIds.filter(id => !profileIds.includes(id) || !profiles.find(p => p.user_id.toString() === id)?.company_name?.trim());

    let userMap = {};
    if (missingIds.length > 0) {
      const users = await User.find({ _id: { $in: missingIds } }).select('_id first_name last_name').lean();
      users.forEach(u => {
        userMap[u._id.toString()] = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown Company';
      });
    }

    const companyMap = {};
    profiles.forEach(p => {
      companyMap[p.user_id.toString()] = p.company_name?.trim() || userMap[p.user_id.toString()] || 'Unknown Company';
    });
    missingIds.forEach(id => {
      if (!companyMap[id]) companyMap[id] = userMap[id] || 'Unknown Company';
    });

    const enrichedJobs = jobs.map(job => {
      const cid = job.company_id?.toString();
      let companyName = job.company_name;

      if (!companyName || companyName === 'N/A') {
        companyName = companyMap[cid] || userMap[cid] || 'Unknown Company';
      }

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
    console.error('❌ Get jobs with match error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// FIX OLD JOBS — One-time migration
// ============================================
exports.fixCompanyNames = async (req, res) => {
  try {
    const jobs = await Job.find({ $or: [
      { company_name: { $exists: false } },
      { company_name: 'N/A' },
      { company_name: '' },
      { company_name: null }
    ]});

    let fixed = 0;
    for (const job of jobs) {
      let companyName = null;

      // Try CompanyProfile first
      const profile = await CompanyProfile.findOne({ user_id: job.company_id }).select('company_name').lean();
      if (profile && profile.company_name?.trim()) {
        companyName = profile.company_name.trim();
      } else {
        // Fallback to User
        const user = await User.findById(job.company_id).select('first_name last_name').lean();
        if (user) {
          companyName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown Company';
        }
      }

      if (companyName && companyName !== 'Unknown Company') {
        job.company_name = companyName;
        await job.save();
        fixed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Fixed ${fixed} jobs with missing company names`,
      totalChecked: jobs.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};