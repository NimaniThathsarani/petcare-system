const mongoose = require('mongoose');

const cageSchema = new mongoose.Schema({
  cageNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  size: {
    type: String,
    enum: ['Small', 'Medium', 'Large'],
    required: true
  },
  type: {
    type: String,
    enum: ['AC', 'Non-AC'],
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance'],
    default: 'Available'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletionReason: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Cage', cageSchema);
