const Cage = require('../models/Cage');
const Boarding = require('../models/Boarding');

const getCages = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    console.log(`Getting cages. Filter dates: ${checkIn} to ${checkOut}`);

    let query = { isDeleted: { $ne: true } };
    
    if (checkIn && checkOut) {
      // Find all overlapping boardings that have a cage assigned
      // Statuses that "block" a cage for new bookings
      const activeStatuses = ['Pending', 'Approved', 'Checked-in'];
      const overlappingBookings = await Boarding.find({
        cage: { $exists: true },
        status: { $in: activeStatuses },
        checkInDate: { $lte: new Date(checkOut) },
        checkOutDate: { $gte: new Date(checkIn) }
      }).select('cage');

      const bookedCageIds = overlappingBookings.map(b => b.cage.toString());
      console.log(`Booked cage IDs for these dates: ${bookedCageIds.length}`);
      
      if (bookedCageIds.length > 0) {
        query._id = { $nin: bookedCageIds };
      }
    }

    const cages = await Cage.find(query);
    console.log(`Found ${cages.length} available cages`);
    res.json(cages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCage = async (req, res) => {
  try {
    console.log('Creating cage with data:', req.body);
    const { cageNumber, size, type } = req.body;
    const existingCage = await Cage.findOne({ cageNumber });
    if (existingCage) {
      return res.status(400).json({ message: 'Cage number already exists' });
    }
    const cage = await Cage.create({ cageNumber, size, type });
    console.log('Cage created:', cage);
    res.status(201).json(cage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCage = async (req, res) => {
  try {
    const { type, status } = req.body;
    // Strictly only allow type and status to be updated per business rules
    const cage = await Cage.findByIdAndUpdate(
      req.params.id,
      { type, status },
      { new: true }
    );
    if (!cage) return res.status(404).json({ message: 'Cage not found' });
    res.json(cage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCage = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Deletion reason is required' });
    }
    const cage = await Cage.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletionReason: reason },
      { new: true }
    );
    if (!cage) return res.status(404).json({ message: 'Cage not found' });
    res.json({ message: 'Cage deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCages,
  createCage,
  updateCage,
  deleteCage
};
