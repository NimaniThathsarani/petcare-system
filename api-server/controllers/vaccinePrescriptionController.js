const VaccinePrescription = require('../models/VaccinePrescription');

const User = require('../models/User');
const Notification = require('../models/Notification');

const createVaccinePrescription = async (req, res) => {
  try {
    const prescription = await VaccinePrescription.create({
      ...req.body,
      prescribedBy: req.user._id
    });

    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getVaccinePrescriptions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'owner') {
      query.owner = req.user._id;
    }
    const prescriptions = await VaccinePrescription.find(query)
      .populate('owner', 'name email')
      .populate('prescribedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateVaccinePrescription = async (req, res) => {
  try {
    const prescription = await VaccinePrescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

    // Allow status updates by managers
    Object.assign(prescription, req.body);
    await prescription.save();
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteVaccinePrescription = async (req, res) => {
  try {
    const Prescription = await VaccinePrescription.findByIdAndDelete(req.params.id);
    if (!Prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json({ message: 'Prescription deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createVaccinePrescription,
  getVaccinePrescriptions,
  updateVaccinePrescription,
  deleteVaccinePrescription
};
