 const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// PROTECT MIDDLEWARE — JWT Verification
// ============================================
// Har protected route pe yeh pehle chalega.
// Header se token nikaal ke verify karega.
// Agar valid hai → req.user mein userId attach karke next() karega.
// Agar invalid hai → 401 Unauthorized return karega.
// ============================================
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Token Authorization header se aata hai: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token' 
      });
    }

    // Token verify karo JWT_SECRET se
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User database mein exist karta hai ya nahi check karo
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User no longer exists' 
      });
    }

    // Request object mein user data attach karo
    // Baad ke controllers mein req.user.userId se access hoga
    req.user = {
      userId: user._id,
      id: user._id,       // backwards compatibility
      role: user.role,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized, token failed' 
    });
  }
};

// ============================================
// AUTHORIZE MIDDLEWARE — Role Based Access
// ============================================
// protect() ke baad yeh lagao.
// Sirf specific roles ko access allow karega.
// Usage: authorize('tpo') ya authorize('student', 'company')
// ============================================
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`
      });
    }
    next();
  };
};