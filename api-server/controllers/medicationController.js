const Medication = require('../models/Medication');

const createMedication = async (req, res) => {
  try {
    const medication = await Medication.create({
      ...req.body,
      owner: req.user._id
    });
    res.status(201).json(medication);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ owner: req.user._id });
    res.json(medications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication)
      return res.status(404).json({ message: 'Medication not found' });
    res.json(medication);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!medication)
      return res.status(404).json({ message: 'Medication not found' });
    res.json(medication);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMedication = async (req, res) => {
  try {
    await Medication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medication deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createMedication,
  getMedications,
  getMedication,
  updateMedication,
  deleteMedication
};