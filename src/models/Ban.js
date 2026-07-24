const mongoose = require('mongoose');

const banSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, expires: 0 },
});

module.exports = mongoose.model('Ban', banSchema);