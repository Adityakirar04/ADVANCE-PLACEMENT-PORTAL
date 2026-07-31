 require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Static Files — Uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========================
// Routes
// ========================
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const tpoRoutes = require('./routes/tpoRoutes');
const studentRoutes = require('./routes/studentRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/tpo', tpoRoutes);
app.use('/api/v1/students', studentRoutes);

// ========================
// DB Connect + Server Start
// ========================
const PORT = process.env.PORT || 5000;

// Debug: URI ko mask karke print karo (password hide karke)
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartplacement';
console.log('🔗 Connecting to:', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

mongoose.connect(uri)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
    console.log('\n💡 Check:');
    console.log('   1. MongoDB Atlas pe cluster "Resume" kiya hua hai?');
    console.log('   2. IP whitelist mein teri current IP hai?');
    console.log('   3. Internet chal raha hai?');
  });