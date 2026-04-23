const Appointment = require('../models/Appointment');
const Medication = require('../models/Medication');
const Vaccination = require('../models/Vaccination');
const Diet = require('../models/Diet');
const VaccinePrescription = require('../models/VaccinePrescription');
const Notification = require('../models/Notification');


const createAppointment = async (req, res) => {
  try {
    const isStaff = req.user.role !== 'owner';
    
    // Owners cannot create ad-hoc appointments anymore
    if (!isStaff) {
      return res.status(403).json({ message: 'Owners must book from available slots' });
    }

    const status = req.body.owner ? 'Scheduled' : 'Available';
    
    const appointmentData = {
      ...req.body,
      status
    };

    const appointment = await Appointment.create(appointmentData);
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    let query = {};
    // Owners only see their own appointments
    if (req.user.role === 'owner') {
      query = {
        $or: [
          { owner: req.user._id },
          { status: 'Available', date: { $gte: new Date() } }
        ]
      };
    }
    // Managers and Admins see all (or could be filtered by status if needed)
    
    const appointments = await Appointment.find(query)
      .populate('owner', 'name email')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('owner', 'name email');
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });
    
    // Check access
    if (req.user.role === 'owner' && appointment.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const medications = await Medication.find({ appointment: req.params.id });
    const vaccinations = await Vaccination.find({ appointment: req.params.id });
    const diets = await Diet.find({ appointment: req.params.id });
    
    // Also find any pending prescriptions for this pet that might have been mentioned in this visit context
    // or just prescriptions linked via appointmentId if you added that field
    const vaccinePrescriptions = await VaccinePrescription.find({ 
      owner: appointment.owner._id,
      petName: appointment.petName,
      status: { $ne: 'Completed' }
    });

    res.json({
      ...appointment.toObject(),
      medications,
      vaccinations,
      diets,
      vaccinePrescriptions
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });

    // Check access
    if (req.user.role === 'owner' && appointment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const oldDate = new Date(appointment.date).getTime();
    const newDate = req.body.date ? new Date(req.body.date).getTime() : oldDate;

    Object.assign(appointment, req.body);
    await appointment.save();

    // Check if rescheduled and notify owner
    if (oldDate !== newDate && appointment.owner) {
      await Notification.create({
        recipient: appointment.owner,
        title: 'Appointment Rescheduled',
        message: `Your appointment with ${appointment.vetName} has been rescheduled to ${new Date(newDate).toLocaleString()}.`,
        type: 'Reschedule',
        relatedId: appointment._id
      });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: 'Appointment not found' });

    // Check access
    if (req.user.role === 'owner' && appointment.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { petName, reason, notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res.status(404).json({ message: 'Appointment slot not found' });

    if (appointment.status !== 'Available')
      return res.status(400).json({ message: 'This slot is no longer available' });

    appointment.owner = req.user._id;
    appointment.petName = petName;
    appointment.reason = reason;
    appointment.notes = notes || appointment.notes;
    appointment.status = 'Scheduled';

    await appointment.save();
    
    const updatedAppointment = await Appointment.findById(id).populate('owner', 'name email');
    res.json(updatedAppointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  bookAppointment
};