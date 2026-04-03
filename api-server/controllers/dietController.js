const Diet = require('../models/Diet');

const createDiet = async (req, res) => {
  try {
    const diet = await Diet.create({
      ...req.body,
      owner: req.user._id
    });
    res.status(201).json(diet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDiets = async (req, res) => {
  try {
    const diets = await Diet.find({ owner: req.user._id });
    res.json(diets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDiet = async (req, res) => {
  try {
    const diet = await Diet.findById(req.params.id);
    if (!diet)
      return res.status(404).json({ message: 'Diet plan not found' });
    res.json(diet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDiet = async (req, res) => {
  try {
    const diet = await Diet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!diet)
      return res.status(404).json({ message: 'Diet plan not found' });
    res.json(diet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDiet = async (req, res) => {
  try {
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