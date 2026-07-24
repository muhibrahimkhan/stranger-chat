const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterNickname: { type: String, required: true },
  reportedNickname: { type: String, required: true },
  roomId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);