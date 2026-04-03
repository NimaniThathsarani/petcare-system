const mongoose = require('mongoose');

const boardingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petName:      { type: String, required: true },
  petAge:       { type: Number },
  breed:        { type: String },
  phone:        { type: String, required: true },
  ownerName:    { type: String },
  facilityName: { type: String },
  checkInDate:  { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  costPerDay:   { type: Number },
  totalCost:    { type: Number },
  image:        { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Checked-in', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  cage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cage'
  },
  specialInstructions: { type: String },
  managementNotes:     { type: String },
  notes:        { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Boarding', boardingSchema);