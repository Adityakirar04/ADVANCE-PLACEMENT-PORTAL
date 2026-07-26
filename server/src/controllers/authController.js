 const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, StudentProfile, CompanyProfile } = require('../models');

// ============================================
// EXACT SAME SECRET (Dono files mein same hona chahiye)
// ============================================
const JWT_SECRET = 'mysupersecretkey123456789abcdef';
const JWT_EXPIRE = '7d';

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

exports.register = async (req, res) => {
  try {
    const { email, password, role, first_name, last_name, ...profileData } = req.body;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      email: email.toLowerCase(),
      password_hash,
      role,
      first_name,
      last_name
    });
    
    if (role === 'student') {
      await StudentProfile.create({ user_id: user._id, ...profileData });
    } else if (role === 'company') {
      await CompanyProfile.create({ user_id: user._id, ...profileData });
    }
    
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
    
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
    
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash');
    
    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user_id: user._id });
    } else if (user.role === 'company') {
      profile = await CompanyProfile.findOne({ user_id: user._id });
    }
    
    res.status(200).json({
      success: true,
      data: { user, profile }
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};