 const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/CompanyProfile');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ============================================
// REGISTER — Clean & Simple
// ============================================
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    // Check duplicate
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // TPO = instant approved, Student/Company = pending
    const approvalStatus = role === 'tpo' ? 'approved' : 'pending';

    // Create user
    const user = await User.create({
      first_name,
      last_name,
      email,
      password,
      role,
      approvalStatus
    });

    // Create empty profile based on role
    if (role === 'student') {
      await StudentProfile.create({
        user_id: user._id,
        graduation_year: new Date().getFullYear() + 4,
        branch: 'Computer Science',
        enrollment_number: '',
        cgpa: 0,
        placement_status: 'not_placed',
        skills: [],
        resume_url: '',
        backlogs: 0
      });
    } else if (role === 'company') {
      await CompanyProfile.create({
        user_id: user._id,
        company_name: '',
        industry: '',
        website: '',
        location: '',
        description: '',
        contact_person: '',
        phone: ''
      });
    }

    res.status(201).json({
      success: true,
      message: role === 'tpo' 
        ? 'Registration successful! Redirecting...' 
        : 'Registration successful! Waiting for TPO approval.',
      data: {
        user: {
          id: user._id,
          first_name: user.first_name,
          email: user.email,
          role: user.role,
          approvalStatus: user.approvalStatus
        }
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// LOGIN — Clean
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Approval check
    if (user.approvalStatus === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending TPO approval. Please contact your TPO.',
        approvalStatus: 'pending'
      });
    }

    if (user.approvalStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        message: `Rejected: ${user.rejectionReason || 'No reason provided'}`,
        approvalStatus: 'rejected'
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};