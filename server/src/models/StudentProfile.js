const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',              // User collection se link
    required: true,
    unique: true              // Ek user = Ek hi profile
  },
  
  enrollment_number: {
    type: String,
    required: true,
    unique: true
  },
  
  branch: {
    type: String,
    required: true
  },
  
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  
  backlogs: {
    type: Number,
    default: 0
  },
  
  graduation_year: {
    type: Number,
    required: true
  },
  
  date_of_birth: Date,
  
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  
  city: String,
  state: String,
  linkedin_url: String,
  github_url: String,
  resume_url: String,
  
  skills: [String],           // Array of strings: ['Python', 'React']
  
  placement_status: {
    type: String,
    enum: ['unplaced', 'placed', 'higher_studies', 'entrepreneur'],
    default: 'unplaced'
  }
  
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);