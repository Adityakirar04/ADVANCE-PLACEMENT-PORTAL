 const User = require('../models/User');

// ============================================
// GET ALL PENDING USERS
// ============================================
// TPO Dashboard pe jab "Pending Approvals" khulega,
// yeh sirf un users ko layega jinka approvalStatus 'pending' hai.
// Sort: Naye registrations pehle (createdAt descending).
// Select: Password field hata diya taaki secure rahe.
// ============================================
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ approvalStatus: 'pending' })
      .select('-password')           // Password mat bhejo response mein
      .sort({ createdAt: -1 })       // Naya pehle
      .lean();                       // Plain JS object — memory kam use hoga

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// APPROVE USER
// ============================================
// TPO "Approve" button click karega → user ka status 'approved' ho jayega.
// Rejection reason bhi clear kar dete hain taaki purani reason na rahe.
// { new: true } se updated document return hota hai.
// ============================================
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        approvalStatus: 'approved',
        rejectionReason: ''  // Purana reason hata do
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: `${user.first_name} ${user.last_name} has been approved successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// REJECT USER
// ============================================
// TPO "Reject" karega toh reason bhi dena hoga (frontend se body mein aayega).
// Status 'rejected' set hoga aur reason store hoga.
// User ko login karte waqt yeh reason dikhayega.
// ============================================
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        approvalStatus: 'rejected',
        rejectionReason: reason || 'No reason provided'
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: `${user.first_name} ${user.last_name} has been rejected`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET ALL USERS (Analytics ke liye)
// ============================================
// TPO ko overall stats chahiye honge:
// Total kitne users, kitne pending, approved, rejected.
// Lean() se mongoose documents ka overhead kam hota hai.
// ============================================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Array methods se count nikaal rahe hain
    const stats = {
      total: users.length,
      pending: users.filter(u => u.approvalStatus === 'pending').length,
      approved: users.filter(u => u.approvalStatus === 'approved').length,
      rejected: users.filter(u => u.approvalStatus === 'rejected').length,
      students: users.filter(u => u.role === 'student').length,
      companies: users.filter(u => u.role === 'company').length
    };

    res.status(200).json({
      success: true,
      stats,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};