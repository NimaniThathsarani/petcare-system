const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/authMiddleware');
const {
  getCages,
  createCage,
  updateCage,
  deleteCage
} = require('../controllers/cageController');

router.route('/')
  .get(protect, getCages)
  .post(protect, checkRole(['boarding_manager', 'admin']), createCage);

// Explicitly handle no-slash if needed (Express often does this, but for clarity)
router.route('')
  .get(protect, getCages)
  .post(protect, checkRole(['boarding_manager', 'admin']), createCage);

router.route('/:id')
  .put(protect, checkRole(['boarding_manager', 'admin']), updateCage)
  .delete(protect, checkRole(['boarding_manager', 'admin']), deleteCage);

module.exports = router;
