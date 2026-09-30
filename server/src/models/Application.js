 const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  // Keep this linked to User. StudentProfile is linked through user_id.
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: [
      'applied',
      'pending', // backward compatibility with older applications
      'under_review',
      'shortlisted',
      'rejected',
      'interview_scheduled',
      'interview_completed',
      'selected',
      'offer_accepted',
      'offer_declined',
      'hired'
    ],
    default: 'applied'
  },
  cover_letter: {
    type: String,
    default: ''
  },
  match_score: {
    type: Number,
    default: 0
  },
  applied_cgpa: {
    type: Number,
    default: 0
  },
  applied_skills: {
    type: [String],
    default: []
  },
  applied_resume_url: {
    type: String,
    default: ''
  },
  feedback: {
    type: String,
    default: ''
  },
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

// One student can apply only once to a particular job.
applicationSchema.index({ job_id: 1, student_id: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
