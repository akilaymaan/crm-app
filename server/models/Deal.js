const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Deal title is required'], trim: true },
  value: { type: Number, required: [true, 'Deal value is required'], min: 0 },
  stage: {
    type: String,
    enum: ['Prospect', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'Prospect',
  },
  probability: { type: Number, min: 0, max: 100, default: 20 },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  notes: { type: String, default: '' },
  daysInStage: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Deal', DealSchema);
