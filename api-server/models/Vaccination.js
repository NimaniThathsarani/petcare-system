const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petName:       { type: String, required: true },
  vaccineName:   { type: String, required: true },
  manufacturer:  { type: String },
  dateGiven:     { type: Date, required: true },
  nextDueDate:   { type: Date },
  veterinarian:  { type: String },
  status: {
    type: String,
    enum: ['Up to date', 'Due soon', 'Overdue'],
    default: 'Up to date'
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);