const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('./src/models/Job');
const CompanyProfile = require('./src/models/CompanyProfile');
const User = require('./src/models/User');

async function fixAllJobs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const jobs = await Job.find({
      $or: [
        { company_name: { $exists: false } },
        { company_name: 'N/A' },
        { company_name: '' },
        { company_name: null }
      ]
    });

    console.log(`🔍 Found ${jobs.length} jobs with missing company names`);

    let fixed = 0;
    for (const job of jobs) {
      let companyName = null;

      // Step 1: Try CompanyProfile
      const profile = await CompanyProfile.findOne({ user_id: job.company_id });
      if (profile && profile.company_name && profile.company_name.trim()) {
        companyName = profile.company_name.trim();
        console.log(`   📋 Profile found: ${companyName}`);
      } else {
        // Step 2: Fallback to User
        const user = await User.findById(job.company_id);
        if (user) {
          companyName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
          console.log(`   👤 User fallback: ${companyName}`);
        }
      }

      if (companyName) {
        job.company_name = companyName;
        await job.save();
        console.log(`   ✅ Fixed: ${job.title} → ${companyName}`);
        fixed++;
      } else {
        console.log(`   ❌ Could not fix: ${job.title}`);
      }
    }

    console.log(`
🎉 Done! Fixed ${fixed}/${jobs.length} jobs`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixAllJobs();