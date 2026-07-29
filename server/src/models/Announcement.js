 const mongoose = require('mongoose');

// ============================================
// ANNOUNCEMENT SCHEMA
// ============================================

const announcementSchema = new mongoose.Schema({
  
  posted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  
  // Kis-kis ke liye announcement hai?
  target_roles: [{
    type: String,
    enum: ['student', 'company', 'tpo', 'alumni'],
    default: 'student'
  }],
  
  // Specific branches ke liye? (empty = sabke liye)
  target_branches: [{
    type: String
  }],
  
  // Pin kiya hua? (Top pe dikhega)
  is_pinned: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

announcementSchema.index({ posted_by: 1 });
announcementSchema.index({ target_roles: 1 });
announcementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);