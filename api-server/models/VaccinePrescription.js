const mongoose = require('mongoose');

const vaccinePrescriptionSchema = new mongoose.Schema({
  petName: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vaccineName: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Scheduled', 'Completed'],
    default: 'Pending'
  },
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('VaccinePrescription', vaccinePrescriptionSchema);
