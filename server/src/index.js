 require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ============================================
// OPTIONAL PACKAGES
// ============================================
let compression, rateLimit, helmet;

try {
  compression = require('compression');
  app.use(compression());
  console.log('✅ Compression enabled');
} catch (e) {
  console.log('⚠️  compression not installed, skipping');
}

try {
  rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: { success: false, message: 'Too many requests' }
  });
  app.use('/api/', limiter);
  console.log('✅ Rate limiting enabled');
} catch (e) {
  console.log('⚠️  express-rate-limit not installed, skipping');
}

try {
  helmet = require('helmet');
  app.use(helmet());
  console.log('✅ Helmet enabled');
} catch (e) {
  console.log('⚠️  helmet not installed, skipping');
}

// ============================================
// ESSENTIAL MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Dev logging
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const tpoRoutes = require('./routes/tpoRoutes');
const studentRoutes = require('./routes/studentRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/tpo', tpoRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/ai', aiRoutes);

// 🔥 SAFE: Notification routes — agar file missing ho toh server crash nahi hoga
try {
  const notificationRoutes = require('./routes/notificationRoutes');
  app.use('/api/v1/notifications', notificationRoutes);
  console.log('✅ Notification routes loaded');
} catch (e) {
  console.log('⚠️  Notification routes not loaded:', e.message);
  console.log('   Fix: Save notificationRoutes.js in server/src/routes/');
}

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    ai: process.env.GROQ_API_KEY ? 'AI Ready' : 'AI Key Missing',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 404 + ERROR HANDLERS
// ============================================
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found` });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large (max 5MB)' });
  }
  if (err.message === 'Only PDF, DOC, DOCX allowed') {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ============================================
// DATABASE + SERVER START
// ============================================
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  }
};

connectDB();