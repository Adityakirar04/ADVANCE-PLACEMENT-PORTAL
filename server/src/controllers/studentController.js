 const mongoose = require('mongoose');

// Direct model access (alternative way)
const StudentProfile = mongoose.model('StudentProfile');

// ============================================
// UPDATE MY PROFILE (Student)
// ============================================
exports.updateProfile = async (req, res) => {
  try {
    console.log('=== DEBUG: User ID ===', req.user.id);
    
    const studentProfile = await StudentProfile.findOne({ user_id: req.user.id });
    
    console.log('=== DEBUG: Profile Found ===', studentProfile ? 'YES' : 'NO');
    
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    // Update cgpa if provided
    if (req.body.cgpa !== undefined) {
      studentProfile.cgpa = req.body.cgpa;
    }
    
    // Update backlogs if provided
    if (req.body.backlogs !== undefined) {
      studentProfile.backlogs = req.body.backlogs;
    }
    
    // Update skills if provided
    if (req.body.skills !== undefined) {
      studentProfile.skills = req.body.skills;
    }
    
    await studentProfile.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: studentProfile
    });
    
  } catch (error) {
    console.log('=== DEBUG: ERROR ===', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET MY PROFILE
// ============================================
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user_id: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    res.status(200).json({ success: true, data: profile });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};