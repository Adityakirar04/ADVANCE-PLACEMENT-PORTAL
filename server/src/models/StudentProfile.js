 const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
  skills: [String],
  placement_status: {
    type: String,
    enum: ['unplaced', 'placed', 'higher_studies', 'entrepreneur'],
    default: 'unplaced'
  },
  placed_company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    default: null
  },
  package_lpa: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

 

// ✅ Ye theek hain — inme unique nahi hai
studentProfileSchema.index({ branch: 1 });
studentProfileSchema.index({ cgpa: -1 });
studentProfileSchema.index({ placement_status: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);