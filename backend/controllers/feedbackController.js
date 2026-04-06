const Feedback = require('../models/Feedback');
const Comment = require('../models/Comment');
const stringSimilarity = require('string-similarity');
const { analyzeFeedback, generateSummary } = require('../utils/aiAnalyzer');

// Get all feedback (sorted by priority or creation)
const getFeedback = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    const feedbackList = await Feedback.find(query).populate('user', 'name email').sort({ priorityScore: -1, createdAt: -1 });
    res.json(feedbackList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single feedback
const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'name email')
      .populate('upvotes', 'name');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Visibility Check
    if (req.user.role !== 'admin' && feedback.user._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this feedback' });
    }

    // Also fetch comments
    const comments = await Comment.find({ feedback: req.params.id }).populate('user', 'name').sort({ createdAt: -1 });

    res.json({ feedback, comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit feedback with duplicate detection
const submitFeedback = async (req, res) => {
  try {
    const { title, description, category, rating } = req.body;
    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // Basic duplicate detection using string similarity
    const allFeedback = await Feedback.find();
    if (allFeedback.length > 0) {
      const titles = allFeedback.map(f => f.title);
      const matches = stringSimilarity.findBestMatch(title, titles);

      // If the best match is highly similar (e.g., > 0.6 rating), flag as potential duplicate
      if (matches.bestMatch.rating > 0.6) {
        return res.status(409).json({
          message: 'Potential duplicate feedback found.',
          similarFeedback: allFeedback[matches.bestMatchIndex]
        });
      }
    }

    // Run AI Analysis
    const aiResult = analyzeFeedback(title, description, rating);

    const feedback = await Feedback.create({
      title,
      description,
      category: aiResult.category,
      sentiment: aiResult.sentiment,
      priority: aiResult.priority,
      priorityScore: aiResult.priorityScore,
      rating,
      image,
      user: req.user.id
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update status (Admin only)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upvote/Downvote feedback
const voteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    const upvoteIndex = feedback.upvotes.indexOf(req.user.id);

    if (upvoteIndex === -1) {
      // Add upvote
      feedback.upvotes.push(req.user.id);
    } else {
      // Remove upvote
      feedback.upvotes.splice(upvoteIndex, 1);
    }

    // Recalculate priority score based on upvotes + comments count (comments added later via aggregation or simple hook, let's just use upvote count for basic priority)
    const commentsCount = await Comment.countDocuments({ feedback: feedback._id });
    feedback.priorityScore = feedback.upvotes.length + commentsCount;

    await feedback.save();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeedbackSummary = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}, 'title description category');
    const summary = generateSummary(feedbacks);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFeedback,
  getFeedbackById,
  submitFeedback,
  updateStatus,
  voteFeedback,
  getFeedbackSummary
};
