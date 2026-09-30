 // server/src/routes/aiRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { analyzeResume, generateInterviewQuestions, chatWithAI } = require('../utils/groqAI');
const { analyzeResume: analyzeATSResume } = require('../utils/atsAnalyzer');
const StudentProfile = require('../models/StudentProfile');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExt = ['.pdf', '.docx'];
    const allowedMime = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedExt.includes(ext) && allowedMime.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Invalid resume. Only PDF or DOCX files are allowed.'));
  }
});

// Resume Analyzer — file upload is mandatory.
// Returns a deterministic ATS-style score that does not depend on an AI API key.
router.post('/analyze-resume', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Invalid request: please upload a resume PDF/DOCX file.' });
    }

    const profile = await StudentProfile.findOne({ user_id: req.user.id }).lean();
    const branch = profile?.branch || 'Computer Science';
    const analysis = await analyzeATSResume(req.file.buffer, req.file.mimetype, branch);

    // Optional AI enhancement. ATS scoring remains valid if Groq is unavailable.
    try {
      if (process.env.GROQ_API_KEY && analysis.extractedText) {
        const ai = await analyzeResume(analysis.extractedText, req.body?.jobDescription || '');
        analysis.aiInsights = {
          skills_found: ai.skills_found || [],
          skills_missing: ai.skills_missing || [],
          strengths: ai.strengths || '',
          improvements: ai.improvements || '',
          overall_feedback: ai.overall_feedback || ''
        };
      }
    } catch (aiError) {
      console.warn('Optional AI resume insights skipped:', aiError.message);
      analysis.aiInsights = null;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...analysis,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Analyze Resume Error:', error);
    const message = error.message || 'Resume analysis failed';
    const clientError = /invalid|upload|only pdf|not enough|parse|extract/i.test(message);
    return res.status(clientError ? 422 : 500).json({ success: false, message });
  }
});

// Interview Prep
router.post('/interview-prep', protect, async (req, res) => {
  try {
    const { role, experience } = req.body || {};
    if (!role) return res.status(400).json({ success: false, message: 'Role is required' });
    const result = await generateInterviewQuestions(role, experience || 'entry');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Interview Prep Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// AI Chat
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
    const result = await chatWithAI(message, history || []);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
