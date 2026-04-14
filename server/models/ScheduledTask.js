const mongoose = require('mongoose');

const ScheduledTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cronExpression: { type: String, required: true },
  humanReadable: { type: String, default: '' },
  taskData: { type: mongoose.Schema.Types.Mixed, required: true },
  active: { type: Boolean, default: true },
  lastRun: { type: Date },
  nextRun: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ScheduledTask', ScheduledTaskSchema);
