 const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { updateProfile, getMyProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const { parseResume } = require('../utils/resumeParser');
const StudentProfile = require('../models/StudentProfile');

const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX allowed'));
  }
});

router.get('/profile', protect, authorize('student'), getMyProfile);
router.put('/profile', protect, authorize('student'), updateProfile);

router.post(
  '/resume',
  protect,
  authorize('student'),
  upload.single('resume'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

      console.log('📥 Uploading:', req.file.originalname, '| Type:', req.file.mimetype, '| Size:', req.file.size);

      // Parse
      const parsed = await parseResume(req.file.buffer, req.file.mimetype);
      console.log('🔍 Extracted skills:', parsed.skills);
      console.log('⚠️ Parse status:', parsed.parseError || 'OK');

      // Save file
      const ext = path.extname(req.file.originalname);
      const filename = `${Date.now()}-${req.user.id}${ext}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, req.file.buffer);

      const resumeUrl = `${req.protocol}://${req.get('host')}/uploads/resumes/${filename}`;

      // Merge skills
      const profile = await StudentProfile.findOne({ user_id: req.user.id });
      const existingSkills = profile?.skills || [];
      const existingLower = existingSkills.map(s => s.toLowerCase());
      const newSkills = parsed.skills.filter(s => !existingLower.includes(s.toLowerCase()));
      const mergedSkills = [...existingSkills, ...newSkills];

      await StudentProfile.findOneAndUpdate(
        { user_id: req.user.id },
        { resume_url: resumeUrl, skills: mergedSkills },
        { new: true }
      );

      res.json({
        success: true,
        data: {
          resume_url: resumeUrl,
          extracted_skills: parsed.skills,
          merged_skills: mergedSkills,
          new_skills_added: newSkills,
          text_preview: parsed.textPreview,
          parse_warning: parsed.parseError
        },
        message: parsed.parseError 
          ? `✅ Resume saved! (${parsed.parseError})`
          : `✅ Found ${parsed.skills.length} skills from resume!`
      });
    } catch (err) {
      console.error('❌ Upload error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;