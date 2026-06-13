const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ip: {
      type: String,
      default: 'Unknown',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    device: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    country: {
      type: String,
      default: 'Unknown',
    },
    city: {
      type: String,
      default: 'Unknown',
    },
  },
  {
    timestamps: false, // Explicit timestamps aren't needed since we track 'timestamp' field
  }
);

module.exports = mongoose.model('Visit', visitSchema);
