  // server/src/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },

  // Company reference
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company_name: {
    type: String,
    required: true,
    default: 'Unknown Company'
  },

  // Job details
  location: {
    type: String,
    default: 'Not Specified'
  },
  job_type: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract'],
    default: 'full-time'
  },

  // Salary with proper structure
  salary: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },

  // Requirements
  requirements: {
    cgpa: { type: Number, default: 0 },
    backlogs: { type: Number, default: 0 },
    branches: { type: [String], default: ['Computer Science', 'Information Technology'] }
  },

  // Skills
  skills_required: {
    type: [String],
    default: []
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },

  // TPO approval
  isApproved: {
    type: Boolean,
    default: true
  },

  // Application count (denormalized)
  application_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company_id: 1 });
jobSchema.index({ 'requirements.cgpa': 1 });

module.exports = mongoose.model('Job', jobSchema);