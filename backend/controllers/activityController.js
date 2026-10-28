const Activity = require('../models/Activity');

// @desc    Get recent activities
// @route   GET /api/v1/activities
// @access  Private
exports.getActivities = async (req, res, next) => {
  try {
    const activities = await Activity.find()
      .sort('-createdAt')
      .limit(10);
      
    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
