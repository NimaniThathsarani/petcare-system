const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createMedication,
  getMedications,
  getMedication,
  updateMedication,
  deleteMedication
} = require('../controllers/medicationController');

router.route('/')
  .get(protect, getMedications)
  .post(protect, createMedication);

router.route('/:id')
  .get(protect, getMedication)
  .put(protect, updateMedication)
  .delete(protect, deleteMedication);

module.exports = router;