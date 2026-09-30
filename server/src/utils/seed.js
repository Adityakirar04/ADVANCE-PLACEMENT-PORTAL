 const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartplacement';
    console.log('🔗 Connecting to:', uri);
    
    await mongoose.connect(uri);
    console.log('✅ Connected to DB');

    // Delete ALL old test users (clean slate)
    const deleted = await User.deleteMany({ 
      email: { $in: ['aditya@gmail.com', 'student@test.com', 'company@test.com', 'tpo@test.com'] }
    });
    console.log(`🗑️ Deleted ${deleted.deletedCount} old users`);

    // 🔥 FIX: Plain password do — pre('save') hook ek baar hash karega
    const users = [
      {
        first_name: 'Aditya',
        last_name: 'Kumar',
        email: 'aditya@gmail.com',
        password: 'password123', // Plain — pre('save') hook hash karega
        role: 'student',
        approvalStatus: 'approved'
      },
      {
        first_name: 'Test',
        last_name: 'Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
        approvalStatus: 'approved'
      },
      {
        first_name: 'Test',
        last_name: 'Company',
        email: 'company@test.com',
        password: 'password123',
        role: 'company',
        approvalStatus: 'approved'
      },
      {
        first_name: 'Admin',
        last_name: 'TPO',
        email: 'tpo@test.com',
        password: 'password123',
        role: 'tpo',
        approvalStatus: 'approved'
      }
    ];

    // User.create() = new User() + .save() → pre('save') hook runs ONCE
    const created = await User.create(users);
    console.log(`✅ Created ${created.length} users successfully!`);
    
    // Verify password works
    const testUser = await User.findOne({ email: 'aditya@gmail.com' }).select('+password');
    const isMatch = await testUser.comparePassword('password123');
    console.log(`🔐 Password verify test: ${isMatch ? '✅ PASS' : '❌ FAIL'}`);

    console.log('');
    console.log('📋 Login Credentials:');
    console.log('  Aditya:  aditya@gmail.com / password123');
    console.log('  Student: student@test.com / password123');
    console.log('  Company: company@test.com / password123');
    console.log('  TPO:     tpo@test.com / password123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedUsers();