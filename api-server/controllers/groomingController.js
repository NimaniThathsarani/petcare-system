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
    let query = {};
    if (req.user.role === 'owner') {
      query.owner = req.user._id;
    }
    const groomings = await Grooming.find(query)
      .populate('owner', 'name email')
      .populate('service')
      .sort({ date: -1 });
    res.json(groomings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getGrooming = async (req, res) => {
  try {
    const grooming = await Grooming.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('service');
    if (!grooming)
      return res.status(404).json({ message: 'Grooming session not found' });
    
    if (req.user.role === 'owner' && grooming.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(grooming);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateGrooming = async (req, res) => {
  try {
    const grooming = await Grooming.findById(req.params.id);
    if (!grooming)
      return res.status(404).json({ message: 'Grooming session not found' });

    if (req.user.role === 'owner' && grooming.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const updateData = { ...req.body };
    if (imagePath) updateData.image = imagePath;
    
    Object.assign(grooming, updateData);
    await grooming.save();
    res.json(grooming);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteGrooming = async (req, res) => {
  try {
    const grooming = await Grooming.findById(req.params.id);
    if (!grooming)
      return res.status(404).json({ message: 'Grooming session not found' });

    if (req.user.role === 'owner' && grooming.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

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