const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petName:    { type: String, required: true },
  vetName:    { type: String, required: true },
  clinicName: { type: String },
  date:       { type: Date, required: true },
  reason:     { type: String },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);