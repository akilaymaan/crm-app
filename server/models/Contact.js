const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Contact name is required'], trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  company: { type: String, trim: true },
  status: {
    type: String,
    enum: ['Lead', 'Prospect', 'Active', 'Inactive'],
    default: 'Lead',
  },
  valuation: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  history: [{
    type: { type: String },
    note: String,
    date: { type: Date, default: Date.now },
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);
