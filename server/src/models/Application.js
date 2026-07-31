 const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  status: {
    type: String,
    enum: [
      'applied',
      'under_review',
      'shortlisted',
      'rejected',
      'interview_scheduled',
      'interview_completed',
      'selected',
      'offer_accepted',
      'offer_declined'
    ],
    default: 'applied'
  },
  match_score: {
    type: Number,
    min: 0,
    max: 100
  },
  applied_cgpa: Number,
  applied_skills: [String],
  applied_resume_url: String,
  company_feedback: String,
  student_feedback: String,
  applied_at: {
    type: Date,
    default: Date.now
  },
  shortlisted_at: Date,
  rejected_at: Date,
  interview_scheduled_at: Date,
  selected_at: Date
}, {
  timestamps: true
});

// Ek student ek job ko ek hi baar apply kar sake
applicationSchema.index({ job_id: 1, student_id: 1 }, { unique: true });
applicationSchema.index({ student_id: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);