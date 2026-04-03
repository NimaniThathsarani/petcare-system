const Grooming = require('../models/Grooming');

const createGrooming = async (req, res) => {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const grooming = await Grooming.create({
      ...req.body,
      owner: req.user._id,
      image: imagePath
    });
    res.status(201).json(grooming);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getGroomings = async (req, res) => {
  try {
    const groomings = await Grooming.find({ owner: req.user._id });
    res.json(groomings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getGrooming = async (req, res) => {
  try {
    const grooming = await Grooming.findById(req.params.id);
    if (!grooming)
      return res.status(404).json({ message: 'Grooming session not found' });
    res.json(grooming);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateGrooming = async (req, res) => {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const updateData = { ...req.body };
    if (imagePath) updateData.image = imagePath;
    const grooming = await Grooming.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!grooming)
      return res.status(404).json({ message: 'Grooming session not found' });
    res.json(grooming);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteGrooming = async (req, res) => {
  try {
    await Grooming.findByIdAndDelete(req.params.id);
    res.json({ message: 'Grooming session deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createGrooming,
  getGroomings,
  getGrooming,
  updateGrooming,
  deleteGrooming
};