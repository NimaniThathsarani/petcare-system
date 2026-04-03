const Vaccination = require('../models/Vaccination');

const createVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.create({
      ...req.body,
      owner: req.user._id
    });
    res.status(201).json(vaccination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getVaccinations = async (req, res) => {
  try {
    const vaccinations = await Vaccination.find({ owner: req.user._id });
    res.json(vaccinations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (!vaccination)
      return res.status(404).json({ message: 'Vaccination not found' });
    res.json(vaccination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!vaccination)
      return res.status(404).json({ message: 'Vaccination not found' });
    res.json(vaccination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteVaccination = async (req, res) => {
  try {
    await Vaccination.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vaccination deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createVaccination,
  getVaccinations,
  getVaccination,
  updateVaccination,
  deleteVaccination
};