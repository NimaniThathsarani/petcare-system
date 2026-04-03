const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  createGrooming,
  getGroomings,
  getGrooming,
  updateGrooming,
  deleteGrooming
} = require('../controllers/groomingController');

router.route('/')
  .get(protect, getGroomings)
  .post(protect, upload.single('image'), createGrooming);

router.route('/:id')
  .get(protect, getGrooming)
  .put(protect, upload.single('image'), updateGrooming)
  .delete(protect, deleteGrooming);

module.exports = router;