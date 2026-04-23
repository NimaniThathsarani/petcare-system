const Medication = require('../models/Medication');

const createMedication = async (req, res) => {
  try {
    const medication = await Medication.create({
      ...req.body,
      owner: req.user.role === 'owner' ? req.user._id : (req.body.owner || req.user._id)
    });
    res.status(201).json(medication);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMedications = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'owner') {
      query.owner = req.user._id;
    }
    const medications = await Medication.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(medications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('appointment');
    if (!medication)
      return res.status(404).json({ message: 'Medication not found' });
    
    if (req.user.role === 'owner' && medication.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(medication);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication)
      return res.status(404).json({ message: 'Medication not found' });

    if (req.user.role === 'owner' && medication.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(medication, req.body);
    await medication.save();
    res.json(medication);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication)
      return res.status(404).json({ message: 'Medication not found' });

    if (req.user.role === 'owner' && medication.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

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