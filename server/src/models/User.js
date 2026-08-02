 const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  first_name: { 
    type: String, 
    required: [true, 'First name is required'] 
  },
  last_name: { 
    type: String, 
    required: [true, 'Last name is required'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password at least 6 characters'],
    select: false
  },
  role: { 
    type: String, 
    enum: ['student', 'company', 'tpo'], 
    required: true 
  },
  
  // 🔥 FIX: Static default rakho. Register controller mein explicitly set karenge.
  // Mongoose default function mein `this.role` unreliable hota hai.
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  rejectionReason: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true
});

userSchema.index({ role: 1 });
userSchema.index({ approvalStatus: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);