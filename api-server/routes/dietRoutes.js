const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createDiet,
  getDiets,
  getDiet,
  updateDiet,
  deleteDiet
} = require('../controllers/dietController');

router.route('/')
  .get(protect, getDiets)
  .post(protect, createDiet);

router.route('/:id')
  .get(protect, getDiet)
  .put(protect, updateDiet)
  .delete(protect, deleteDiet);

module.exports = router;