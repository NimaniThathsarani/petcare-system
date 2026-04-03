const Boarding = require('../models/Boarding');

const createBoarding = async (req, res) => {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const boarding = await Boarding.create({
      ...req.body,
      owner: req.user._id,
      image: imagePath
    });
    res.status(201).json(boarding);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBoardings = async (req, res) => {
  try {
    let query = { owner: req.user._id };
    // If the user is boarding_manager or admin, they can see everything
    if (['boarding_manager', 'admin'].includes(req.user.role)) {
      query = {};
    }
    const boardings = await Boarding.find(query)
      .populate('owner', 'name email')
      .populate('cage');
    res.json(boardings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBoarding = async (req, res) => {
  try {
    const boarding = await Boarding.findById(req.params.id);
    if (!boarding)
      return res.status(404).json({ message: 'Boarding record not found' });
    res.json(boarding);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateBoarding = async (req, res) => {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;
    const updateData = { ...req.body };
    if (imagePath) updateData.image = imagePath;

    // Check if user is owner or manager
    const boardingToUpdate = await Boarding.findById(req.params.id);
    if (!boardingToUpdate)
      return res.status(404).json({ message: 'Boarding record not found' });

    const isManager = ['boarding_manager', 'admin'].includes(req.user.role);
    const isOwner = boardingToUpdate.owner.toString() === req.user._id.toString();

    if (!isOwner && !isManager) {
      return res.status(403).json({ message: 'Not authorized to update this record' });
    }

    // Role-specific restrictions (if any)
    // Managers can update status, cageNumber, managementNotes, etc.
    // If the user is NOT a manager, they shouldn't change status to Approved, Checked-in, etc.
    if (!isManager && updateData.status && updateData.status !== 'Cancelled') {
      delete updateData.status; // Prevent status tampering by owners (except Cancelled)
    }

    const updatedBoarding = await Boarding.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedBoarding);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteBoarding = async (req, res) => {
  try {
    // Only admin can delete records
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can delete records. Please use cancellation instead.' });
    }
    await Boarding.findByIdAndDelete(req.params.id);
    res.json({ message: 'Boarding record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createBoarding,
  getBoardings,
  getBoarding,
  updateBoarding,
  deleteBoarding
};