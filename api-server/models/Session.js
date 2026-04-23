const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // 'YYYY-MM-DD'
    required: true
  },
  startTime: {
    type: String, // 'HH:mm'
    required: true
  },
  endTime: {
    type: String, // 'HH:mm'
    required: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Rescheduled', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
