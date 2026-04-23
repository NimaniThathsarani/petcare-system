const Diet = require('../models/Diet');

const createDiet = async (req, res) => {
  try {
    const diet = await Diet.create({
      ...req.body,
      owner: req.user.role === 'owner' ? req.user._id : (req.body.owner || req.user._id)
    });
    res.status(201).json(diet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDiets = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'owner') {
      query.owner = req.user._id;
    }
    const diets = await Diet.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(diets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDiet = async (req, res) => {
  try {
    const diet = await Diet.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('appointment');
    if (!diet)
      return res.status(404).json({ message: 'Diet plan not found' });
    
    if (req.user.role === 'owner' && diet.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(diet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDiet = async (req, res) => {
  try {
    const diet = await Diet.findById(req.params.id);
    if (!diet)
      return res.status(404).json({ message: 'Diet plan not found' });

    if (req.user.role === 'owner' && diet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(diet, req.body);
    await diet.save();
    res.json(diet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDiet = async (req, res) => {
  try {
    const diet = await Diet.findById(req.params.id);
    if (!diet)
      return res.status(404).json({ message: 'Diet plan not found' });

    if (req.user.role === 'owner' && diet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Diet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Diet plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createDiet,
  getDiets,
  getDiet,
  updateDiet,
  deleteDiet
};