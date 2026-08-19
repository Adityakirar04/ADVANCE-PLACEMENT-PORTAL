 // server/src/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================
// DATABASE CONNECTION (Mongoose 6+ — NO deprecated options)
// ============================================
const connectDB = async () => {
  try {
    // Mongoose 6+ mein yeh options automatically enabled hain
    // useNewUrlParser, useUnifiedTopology — HATA DO
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// ============================================
// HELPER: Safe Route Loader
// ============================================
const safeRequire = (path, routePath) => {
  try {
    const route = require(path);
    app.use(routePath, route);
    console.log(`✅ Route loaded: ${routePath}`);
    return true;
  } catch (err) {
    console.warn(`⚠️  Route missing: ${routePath}`);
    console.warn(`   Reason: ${err.message}`);
    return false;
  }
};

// ============================================
// ROUTES (Safe Loading)
// ============================================

// Core routes
safeRequire('./routes/authRoutes', '/api/v1/auth');
safeRequire('./routes/jobRoutes', '/api/v1/jobs');

// Optional routes (graceful if missing)
safeRequire('./routes/applicationRoutes', '/api/v1/applications');
safeRequire('./routes/notificationRoutes', '/api/v1/notifications');
safeRequire('./routes/aiRoutes', '/api/v1/ai');
safeRequire('./routes/studentProfileRoutes', '/api/v1/student-profiles');
safeRequire('./routes/companyProfileRoutes', '/api/v1/company-profiles');
safeRequire('./routes/tpoRoutes', '/api/v1/tpo');

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API Base: http://localhost:${PORT}/api/v1`);
});