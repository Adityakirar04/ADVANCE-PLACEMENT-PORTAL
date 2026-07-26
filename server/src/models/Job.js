const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    required: true
  },
  
  posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  
  job_type: {
    type: String,
    required: true,
    enum: ['full_time', 'internship', 'contract', 'part_time']
  },
  
  required_skills: [{
    type: String,
    trim: true
  }],
  
  min_cgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  
  max_backlogs: {
    type: Number,
    default: 0,
    min: 0
  },
  
  eligible_branches: [{
    type: String
  }],
  
  ctc_min: {
    type: Number,
    default: 0
  },
  
  ctc_max: {
    type: Number,
    default: 0
  },
  
  currency: {
    type: String,
    default: 'INR'
  },
  
  location: String,
  
  is_remote: {
    type: Boolean,
    default: false
  },
  
  application_deadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  
  drive_date: {
    type: Date
  },
  
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'cancelled'],
    default: 'active'
  },
  
  total_applications: {
    type: Number,
    default: 0
  }
  
}, {
  timestamps: true
});

jobSchema.index({ company_id: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ application_deadline: 1 });

module.exports = mongoose.model('Job', jobSchema);