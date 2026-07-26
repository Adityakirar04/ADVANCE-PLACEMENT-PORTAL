 const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = 'mysupersecretkey123456789abcdef';

// ============================================
// PROTECT: Logged in hai ki nahi check karega
// ============================================
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    req.user = user;
    next();
    
  } catch (error) {
    console.log('AUTH ERROR:', error.message);
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

// ============================================
// AUTHORIZE: Specific role check karega
// ============================================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};