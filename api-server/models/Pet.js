const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name:     { type: String, required: true },
  species:  { type: String, required: true }, // e.g., Dog, Cat
  breed:    { type: String },
  age:      { type: Number },
  gender:   { type: String, enum: ['Male', 'Female', 'Unknown'], default: 'Unknown' },
  notes:    { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Pet', petSchema);
