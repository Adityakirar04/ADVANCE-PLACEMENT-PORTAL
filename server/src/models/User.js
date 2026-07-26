const mongoose = require('mongoose');

// User Schema: Sab roles ke liye common (Student, Company, TPO, Alumni)
const userSchema = new mongoose.Schema({
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,           // Do users ka email same nahi ho sakta
    lowercase: true,
    trim: true
  },
  
  password_hash: {
    type: String,
    required: [true, 'Password is required']
  },
  
  role: {
    type: String,
    required: true,
    enum: ['student', 'company', 'tpo', 'alumni']  // Sirf ye 4 values allowed
  },
  
  first_name: {
    type: String,
    required: [true, 'First name is required']
  },
  
  last_name: {
    type: String,
    required: [true, 'Last name is required']
  },
  
  phone: String,
  
  is_active: {
    type: Boolean,
    default: true
  },
  
  is_verified: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true    // createdAt, updatedAt automatically add hoga
});

module.exports = mongoose.model('User', userSchema);