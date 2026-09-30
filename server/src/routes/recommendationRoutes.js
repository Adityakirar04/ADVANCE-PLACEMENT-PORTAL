 const express = require('express');
const router = express.Router();
const {
  getRecommendedJobs,
  getPlacementPrediction,
  getStats
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.get('/jobs', protect, getRecommendedJobs);
router.get('/predict', protect, getPlacementPrediction);
router.get('/stats', protect, getStats);

module.exports = router;