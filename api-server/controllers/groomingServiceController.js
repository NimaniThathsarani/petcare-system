const GroomingService = require('../models/GroomingService');

const getGroomingServices = async (req, res) => {
  try {
    const services = await GroomingService.find().sort({ name: 1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createGroomingService = async (req, res) => {
  try {
    const service = await GroomingService.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateGroomingService = async (req, res) => {
  try {
    const service = await GroomingService.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteGroomingService = async (req, res) => {
  try {
    const service = await GroomingService.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getGroomingServices,
  createGroomingService,
  updateGroomingService,
  deleteGroomingService
};
