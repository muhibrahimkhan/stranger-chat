const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Object, default: {} },
});

module.exports = mongoose.model('Event', eventSchema);