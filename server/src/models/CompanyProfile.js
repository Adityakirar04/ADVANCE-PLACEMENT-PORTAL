 const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // index: true  ← HATA DO (niche schema.index() se ban raha hai)
  },

  company_name: {
    type: String,
    default: ''
  },

  industry: {
    type: String,
    default: ''
  },

  website: {
    type: String,
    default: ''
  },

  location: {
    type: String,
    default: ''
  },

  description: {
    type: String,
    default: ''
  },

  contact_person: {
    type: String,
    default: ''
  },

  phone: {
    type: String,
    default: ''
  }

}, { timestamps: true });

// Single index definition
companyProfileSchema.index({ user_id: 1 });

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);