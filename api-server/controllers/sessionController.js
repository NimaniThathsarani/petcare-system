const Session = require('../models/Session');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createSession = async (req, res) => {
  try {
    const session = new Session({
      ...req.body,
      doctor: req.user._id
    });
    await session.save();

    // Notify all vet managers
    const managers = await User.find({ role: 'vet_manager' });
    for (const manager of managers) {
      await Notification.create({
        recipient: manager._id,
        title: 'New Doctor Session',
        message: `Dr. ${req.user.name} has submitted a new availability session for ${session.date} at ${session.startTime}.`,
        type: 'General',
        relatedId: session._id
      });
    }

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSessions = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }
    const sessions = await Session.find(query)
      .populate('doctor', 'name email')
      .sort({ date: 1, startTime: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('doctor', 'name email');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Verify ownership or manager role
    if (req.user.role === 'doctor' && session.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const oldDate = session.date;
    const oldTime = session.startTime;

    Object.assign(session, req.body);
    
    // If rescheduled, update status
    if (req.body.date !== oldDate || req.body.startTime !== oldTime) {
      session.status = 'Rescheduled';
      
      // Notify vet managers of rescheduling
      const managers = await User.find({ role: 'vet_manager' });
      for (const manager of managers) {
        await Notification.create({
          recipient: manager._id,
          title: 'Doctor Session Rescheduled',
          message: `Dr. ${req.user.name} has rescheduled their session for ${session.date} at ${session.startTime}. Previous: ${oldDate} ${oldTime}.`,
          type: 'Reschedule',
          relatedId: session._id
        });
      }
    }

    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    if (req.user.role === 'doctor' && session.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await session.deleteOne();
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession
};
