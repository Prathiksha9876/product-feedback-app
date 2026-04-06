const Feedback = require('../models/Feedback');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFeedback = await Feedback.countDocuments();

    // Most reported bugs
    const bugs = await Feedback.find({ category: 'Bug' }).sort({ priorityScore: -1 }).limit(5);

    // Most requested features
    const features = await Feedback.find({ category: 'Feature Request' }).sort({ priorityScore: -1 }).limit(5);

    // Get feedback counts by status for charts
    const statusCounts = await Feedback.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // New Aggregations
    const categoryCounts = await Feedback.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    const priorityCounts = await Feedback.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]);
    const sentimentCounts = await Feedback.aggregate([{ $group: { _id: "$sentiment", count: { $sum: 1 } } }]);

    // Trends (by day)
    const trends = await Feedback.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for charts
    const chartData = [
      { name: 'Planned', value: statusCounts.find(s => s._id === 'Planned')?.count || 0 },
      { name: 'In Progress', value: statusCounts.find(s => s._id === 'In Progress')?.count || 0 },
      { name: 'Completed', value: statusCounts.find(s => s._id === 'Completed')?.count || 0 },
      { name: 'Rejected', value: statusCounts.find(s => s._id === 'Rejected')?.count || 0 },
      { name: 'Under Review', value: statusCounts.find(s => s._id === 'Under Review')?.count || 0 },
    ];

    res.json({
      totalUsers,
      totalFeedback,
      topBugs: bugs,
      topFeatures: features,
      statusChartData: chartData,
      categoryDistribution: categoryCounts.map(c => ({ name: c._id || 'Unknown', value: c.count })),
      priorityDistribution: priorityCounts.map(p => ({ name: p._id || 'Unknown', value: p.count })),
      sentimentDistribution: sentimentCounts.map(s => ({ name: s._id || 'Unknown', value: s.count })),
      trendsOverTime: trends.map(t => ({ date: t._id, submissions: t.count }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
