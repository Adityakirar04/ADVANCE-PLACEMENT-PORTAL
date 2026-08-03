const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: ['job_posted', 'application_status', 'approval', 'general'],
    default: 'general'
  },

  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  // Link to related resource (optional)
  link: {
    type: String,
    default: ''
  },

  read: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

// Index for fast unread queries
notificationSchema.index({ user_id: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);