const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petName:       { type: String, required: true },
  medicationName:{ type: String, required: true },
  dosage:        { type: String, required: true },
  frequency:     { type: String, required: true },
  startDate:     { type: Date, required: true },
  endDate:       { type: Date },
  prescribedBy:  { type: String },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Discontinued'],
    default: 'Active'
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);