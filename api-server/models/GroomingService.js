const mongoose = require('mongoose');

const groomingServiceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String 
  },
  duration: {
    type: String,
    default: '1 hour'
  }
}, { timestamps: true });

module.exports = mongoose.model('GroomingService', groomingServiceSchema);
