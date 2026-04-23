const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  petName:    { type: String, required: false },
  vetName:    { type: String, required: true },
  clinicName: { type: String },
  date:       { type: Date, required: true },
  reason:     { type: String },
  status: {
    type: String,
    enum: ['Available', 'Pending', 'Scheduled', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);