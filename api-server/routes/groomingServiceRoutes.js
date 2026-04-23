const express = require('express');
const router = express.Router();
const { 
  getGroomingServices, 
  createGroomingService, 
  updateGroomingService, 
  deleteGroomingService 
} = require('../controllers/groomingServiceController');
const { protect, checkRole } = require('../middleware/authMiddleware');

router.route('/')
  .get(getGroomingServices) // Public or Owner can see prices
  .post(protect, checkRole(['grooming_manager', 'admin']), createGroomingService);

router.route('/:id')
  .put(protect, checkRole(['grooming_manager', 'admin']), updateGroomingService)
  .delete(protect, checkRole(['grooming_manager', 'admin']), deleteGroomingService);

module.exports = router;
