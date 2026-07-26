const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  company_name: {
    type: String,
    required: true
  },
  
  company_type: {
    type: String,
    enum: ['MNC', 'Startup', 'Mid-Size', 'Government', 'NGO']
  },
  
  industry: {
    type: String,
    required: true
  },
  
  website: String,
  description: String,
  city: String,
  state: String,
  
  hr_name: String,
  hr_email: String,
  hr_phone: String,
  
  is_verified: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true
});

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);