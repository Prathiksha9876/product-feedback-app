const express = require('express');
const router = express.Router();
const { getFeedback, getFeedbackById, submitFeedback, updateStatus, voteFeedback, getFeedbackSummary } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(protect, getFeedback)
  .post(protect, upload.single('image'), submitFeedback);

router.route('/summary')
  .get(protect, admin, getFeedbackSummary);

router.route('/:id')
  .get(protect, getFeedbackById);

router.route('/:id/status')
  .put(protect, admin, updateStatus);

router.route('/:id/vote')
  .put(protect, voteFeedback);

module.exports = router;
