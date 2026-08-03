const Notification = require('../models/Notification');
const User = require('../models/User');

// ============================================
// GET MY NOTIFICATIONS
// ============================================
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      user_id: req.user.userId,
      read: false
    });

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// MARK AS READ
// ============================================
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findOneAndUpdate(
      { _id: notificationId, user_id: req.user.userId },
      { read: true }
    );

    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// MARK ALL AS READ
// ============================================
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.userId, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CREATE NOTIFICATION (Internal helper)
// ============================================
exports.createNotification = async (userId, title, message, type = 'general', link = '') => {
  try {
    await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      link,
      read: false
    });
  } catch (error) {
    console.error('Create notification error:', error.message);
  }
};

// ============================================
// NOTIFY ALL STUDENTS (When job posted)
// ============================================
exports.notifyAllStudents = async (title, message, link = '') => {
  try {
    const students = await User.find({ role: 'student', approvalStatus: 'approved' }).select('_id');

    const notifications = students.map(student => ({
      user_id: student._id,
      title,
      message,
      type: 'job_posted',
      link,
      read: false
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    console.log(`📢 Notified ${notifications.length} students about new job`);
  } catch (error) {
    console.error('Notify students error:', error.message);
  }
};