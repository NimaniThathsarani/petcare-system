const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createVaccination,
  getVaccinations,
  getVaccination,
  updateVaccination,
  deleteVaccination
} = require('../controllers/vaccinationController');

router.route('/')
  .get(protect, getVaccinations)
  .post(protect, createVaccination);

router.route('/:id')
  .get(protect, getVaccination)
  .put(protect, updateVaccination)
  .delete(protect, deleteVaccination);

module.exports = router;
