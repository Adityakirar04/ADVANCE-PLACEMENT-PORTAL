 const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // index: true  ← HATA DO (niche schema.index() se ban raha hai)
  },

  graduation_year: {
    type: Number,
    default: new Date().getFullYear() + 4
  },

  branch: {
    type: String,
    default: 'Computer Science'
  },

  enrollment_number: {
    type: String,
    default: ''
  },

  cgpa: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },

  placement_status: {
    type: String,
    enum: ['not_placed', 'placed', 'internship', 'higher_studies'],
    default: 'not_placed'
  },

  skills: [{
    type: String
  }],

  resume_url: {
    type: String,
    default: ''
  },

  backlogs: {
    type: Number,
    default: 0
  },

  phone: {
    type: String,
    default: ''
  },

  address: {
    type: String,
    default: ''
  }

}, { timestamps: true });

// Single index definition
studentProfileSchema.index({ user_id: 1 });
studentProfileSchema.index({ placement_status: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);