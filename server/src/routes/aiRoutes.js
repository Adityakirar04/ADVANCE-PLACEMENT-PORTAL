 // server/src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { analyzeResume, generateInterviewQuestions, chatWithAI } = require('../utils/groqAI');

// ============================================
// AI ROUTES — Real Groq AI Only
// ============================================

// Resume Analyzer
router.post('/analyze-resume', protect, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText) {
      return res.status(400).json({ success: false, message: 'Resume text required' });
    }
    const analysis = await analyzeResume(resumeText, jobDescription);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Analyze Resume Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Interview Prep
router.post('/interview-prep', protect, async (req, res) => {
  try {
    const { role, experience } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }
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
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    const result = await chatWithAI(message, history || []);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;