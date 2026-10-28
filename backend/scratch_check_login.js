const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({ username: 'superadmin' }).select('+password');
  if (!user) {
    console.log('User not found');
  } else {
    console.log('User found:', user.username, user.email);
    const isMatch = await bcrypt.compare('SuperAdmin@123', user.password);
    console.log('Password match:', isMatch);
  }
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
