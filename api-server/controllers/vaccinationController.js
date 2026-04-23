const Vaccination = require('../models/Vaccination');

const createVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.create({
      ...req.body,
      owner: req.user.role === 'owner' ? req.user._id : (req.body.owner || req.user._id)
    });
    res.status(201).json(vaccination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getVaccinations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'owner') {
      query.owner = req.user._id;
    }
    const vaccinations = await Vaccination.find(query)
      .populate('owner', 'name email')
      .sort({ dateGiven: -1 });
    res.json(vaccinations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('appointment');
    if (!vaccination)
      return res.status(404).json({ message: 'Vaccination record not found' });
    
    if (req.user.role === 'owner' && vaccination.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(vaccination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (!vaccination)
      return res.status(404).json({ message: 'Vaccination record not found' });

    if (req.user.role === 'owner' && vaccination.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(vaccination, req.body);
    await vaccination.save();
    res.json(vaccination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteVaccination = async (req, res) => {
  try {
    const vaccination = await Vaccination.findById(req.params.id);
    if (!vaccination)
      return res.status(404).json({ message: 'Vaccination record not found' });

    if (req.user.role === 'owner' && vaccination.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Vaccination.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vaccination record deleted successfully' });
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