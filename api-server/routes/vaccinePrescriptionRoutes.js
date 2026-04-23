const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createVaccinePrescription,
  getVaccinePrescriptions,
  updateVaccinePrescription,
  deleteVaccinePrescription
} = require('../controllers/vaccinePrescriptionController');

router.route('/')
  .get(protect, getVaccinePrescriptions)
  .post(protect, createVaccinePrescription);

router.route('/:id')
  .put(protect, updateVaccinePrescription)
  .delete(protect, deleteVaccinePrescription);

module.exports = router;
