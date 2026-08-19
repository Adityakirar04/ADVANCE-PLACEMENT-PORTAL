 // server/src/models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  cover_letter: {
    type: String,
    default: ''
  },
  match_score: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ job_id: 1, student_id: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);