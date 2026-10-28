const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('../models/User');
const Student = require('../models/Student');
const Role = require('../models/Role');
const Institution = require('../models/Institution');
const Program = require('../models/Program');
const Level = require('../models/Level');

const setup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    let studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      studentRole = await Role.create({
        name: 'Student',
        description: 'Student Portal Access',
        permissions: { erp_dashboard: { read: true } }
      });
    }

    const inst = await Institution.findOne();
    let prog = await Program.findOne();
    if (!prog) {
      prog = await Program.create({
        name: 'B.Tech Computer Science & Engineering',
        code: 'BT-CSE',
        institutionId: inst?._id
      });
    }

    let level = await Level.findOne();
    if (!level) {
      level = await Level.create({
        name: '5th Sem',
        order: 5,
        programId: prog._id,
        institutionId: inst?._id
      });
    }

    // Check or update Aarav Sharma
    let student = await Student.findOne({ studentId: 'NCF_533137' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Student@123', salt);

    if (student) {
      student.password = 'Student@123';
      student.programId = prog._id;
      student.levelId = level._id;
      student.institutionId = inst?._id;
      student.college = 'Quantum School of Technology';
      student.specialization = 'Computer Science & Engineering';
      await student.save();
    } else {
      student = await Student.create({
        studentId: 'NCF_533137',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@campus.edu',
        password: 'Student@123',
        college: 'Quantum School of Technology',
        specialization: 'Computer Science & Engineering',
        programId: prog._id,
        levelId: level._id,
        institutionId: inst?._id
      });
    }

    // Check or update User
    let user = await User.findOne({ username: 'student' });
    if (!user) {
      user = await User.create({
        username: 'student',
        email: 'student@campus.edu',
        password: hashedPassword,
        role: studentRole._id,
        studentProfile: student._id,
        institutionId: inst?._id
      });
    } else {
      user.password = hashedPassword;
      user.studentProfile = student._id;
      user.role = studentRole._id;
      await user.save();
    }

    // Also update NCF_533137 user
    let userNcf = await User.findOne({ username: 'NCF_533137' });
    if (userNcf) {
      userNcf.password = hashedPassword;
      userNcf.studentProfile = student._id;
      userNcf.role = studentRole._id;
      await userNcf.save();
    }

    console.log('Demo Student user ready: username="student" or "NCF_533137", password="Student@123"');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

setup();
