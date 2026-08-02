 const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { protect, authorize } = require('../middleware/auth');
const { analyzeResumeWithAI, generateInterviewQuestionsWithAI, chatWithAI } = require('../utils/groqAI');
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

router.post('/analyze-resume', protect, authorize('student'), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume uploaded' });
    }

    console.log('📥 File:', req.file.originalname, '| Type:', req.file.mimetype, '| Size:', req.file.size);

    const profile = await StudentProfile.findOne({ user_id: req.user.userId || req.user.id }).lean();
    const branch = profile?.branch || 'Computer Science';

    const analysis = await analyzeResumeWithAI(req.file.buffer, req.file.mimetype, branch);

    const ext = path.extname(req.file.originalname);
    const filename = `${Date.now()}-${req.user.userId || req.user.id}${ext}`;
    fs.writeFileSync(path.join(uploadDir, filename), req.file.buffer);

    res.json({
      success: true,
      data: {
        ...analysis,
        resume_url: `${req.protocol}://${req.get('host')}/uploads/resumes/${filename}`
      }
    });
  } catch (err) {
    console.error('❌ Analyze route error:', err);
    res.status(500).json({ success: false, message: err.message || 'Analysis failed' });
  }
});

router.get('/interview-roles', protect, async (req, res) => {
  const roles = [
    'Java Developer', 'React Developer', 'Node.js Developer',
    'Python Developer', 'Data Scientist', 'Full Stack Developer',
    'SDE', 'DevOps Engineer', 'AI/ML Engineer', 'Mobile Developer',
    'Cloud Architect', 'Cybersecurity Analyst'
  ];
  res.json({ success: true, data: roles });
});

router.post('/interview-questions', protect, async (req, res) => {
  try {
    const { role, count = 10 } = req.body;
    if (!role) return res.status(400).json({ success: false, message: 'Role required' });

    const profile = await StudentProfile.findOne({ user_id: req.user.userId || req.user.id }).lean();
    const skills = profile?.skills || [];

    const questions = await generateInterviewQuestionsWithAI(role, skills, parseInt(count) || 10);

    res.json({
      success: true,
      data: { role, totalQuestions: questions.length, questions }
    });
  } catch (err) {
    console.error('❌ Interview error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message required' });

    const reply = await chatWithAI(message.trim(), history || []);
    res.json({ success: true, data: { reply } });
  } catch (err) {
    console.error('❌ Chat error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;