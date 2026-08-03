 const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // index: true  ← HATA DO (niche schema.index() se ban raha hai)
  },

  company_name: {
    type: String,
    default: 'N/A'
  },

  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  location: {
    type: String,
    default: ''
  },

  salary_range: {
    type: String,
    default: ''
  },

  required_skills: [{
    type: String
  }],

  eligible_branches: [{
    type: String
  }],

  min_cgpa: {
    type: Number,
    default: 0
  },

  max_backlogs: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },

  posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

// Single index definitions
jobSchema.index({ company_id: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);