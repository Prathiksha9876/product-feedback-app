const Comment = require('../models/Comment');
const Feedback = require('../models/Feedback');

// Add comment to feedback
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const feedbackId = req.params.feedbackId;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const comment = await Comment.create({
      text,
      user: req.user.id,
      feedback: feedbackId,
    });

    // Update feedback priority score
    const commentsCount = await Comment.countDocuments({ feedback: feedbackId });
    feedback.priorityScore = feedback.upvotes.length + commentsCount;
    await feedback.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
};
