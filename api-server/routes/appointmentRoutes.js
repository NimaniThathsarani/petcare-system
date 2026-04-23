const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  bookAppointment
} = require('../controllers/appointmentController');

router.route('/')
  .get(protect, getAppointments)
  .post(protect, createAppointment);

router.put('/:id/book', protect, bookAppointment);

router.route('/:id')
  .get(protect, getAppointment)
  .put(protect, updateAppointment)
  .delete(protect, deleteAppointment);

module.exports = router;
