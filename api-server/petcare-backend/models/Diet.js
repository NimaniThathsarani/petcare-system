const mongoose = require('mongoose');

const dietSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petName:      { type: String, required: true },
  foodType:     { type: String, required: true },
  brand:        { type: String },
  portionSize:  { type: String, required: true },
  frequency:    { type: String, required: true },
  feedingTimes: [{ type: String }],
  startDate:    { type: Date, required: true },
  endDate:      { type: Date },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Paused'],
    default: 'Active'
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Diet', dietSchema);