const { Announcement } = require('../models');

// ============================================
// CREATE ANNOUNCEMENT (TPO only)
// ============================================
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, target_roles, target_branches, is_pinned } = req.body;
    
    const announcement = await Announcement.create({
      posted_by: req.user.id,
      title,
      content,
      target_roles: target_roles || ['student'],
      target_branches: target_branches || [],
      is_pinned: is_pinned || false
    });
    
    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      data: announcement
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET ALL ANNOUNCEMENTS
// ============================================
exports.getAllAnnouncements = async (req, res) => {
  try {
    // User ke role ke hisaab se filter
    const { role } = req.user;
    
    let filter = {};
    
    // Agar student hai toh sirf student/targeted announcements dikho
    if (role === 'student') {
      filter = { 
        $or: [
          { target_roles: 'student' },
          { target_roles: { $size: 0 } }  // Empty = sabke liye
        ]
      };
    } else if (role === 'company') {
      filter = { target_roles: 'company' };
    }
    
    const announcements = await Announcement.find(filter)
      .populate('posted_by', 'first_name last_name role')
      .sort({ is_pinned: -1, createdAt: -1 });  // Pinned pehle, phir naye
    
    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET SINGLE ANNOUNCEMENT
// ============================================
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('posted_by', 'first_name last_name');
    
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    res.status(200).json({ success: true, data: announcement });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// DELETE ANNOUNCEMENT (TPO only)
// ============================================
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    
    await announcement.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};