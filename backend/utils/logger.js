const Activity = require('../models/Activity');

const logActivity = async (action, entity, details, user = 'System') => {
  try {
    await Activity.create({
      action,
      entity,
      details,
      user: user.username || user
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = logActivity;
