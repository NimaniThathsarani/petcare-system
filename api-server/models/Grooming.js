const mongoose = require('mongoose');

const groomingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petName:      { type: String, required: true },
  serviceType:  { type: String, required: true },
  groomerName:  { type: String },
  salonName:    { type: String },
  date:         { type: Date, required: true },
  cost:         { type: Number },
  image:        { type: String },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Grooming', groomingSchema);