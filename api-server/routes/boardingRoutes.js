const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  createBoarding,
  getBoardings,
  getBoarding,
  updateBoarding,
  deleteBoarding
} = require('../controllers/boardingController');

router.route('/')
  .get(protect, getBoardings)
  .post(protect, upload.single('image'), createBoarding);

router.route('/:id')
  .get(protect, getBoarding)
  .put(protect, upload.single('image'), updateBoarding)
  .delete(protect, checkRole(['admin']), deleteBoarding);

module.exports = router;