const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { 
    type: String, 
    enum: [
      'owner', 
      'admin', 
      'vet_manager', 
      'vaccine_manager', 
      'grooming_manager', 
      'boarding_manager',
      'doctor'
    ], 
    default: 'owner' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);