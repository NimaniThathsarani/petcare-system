const Pet = require('../models/Pet');

// @desc    Get all pets for the logged in owner
// @route   GET /api/pets
// @access  Private
exports.getPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user._id });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new pet
// @route   POST /api/pets
// @access  Private
exports.createPet = async (req, res) => {
  try {
    const { name, species, breed, age, gender, notes } = req.body;
    const pet = await Pet.create({
      owner: req.user._id,
      name,
      species,
      breed,
      age,
      gender,
      notes
    });
    res.status(201).json(pet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update pet details
// @route   PUT /api/pets/:id
// @access  Private
exports.updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    
    // Check ownership
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a pet
// @route   DELETE /api/pets/:id
// @access  Private
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    // Check ownership
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await pet.deleteOne();
    res.json({ message: 'Pet removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
