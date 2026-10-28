const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Role = require('./models/Role');
const Institution = require('./models/Institution');
const Branch = require('./models/Branch');
const Program = require('./models/Program');
const Level = require('./models/Level');
const Section = require('./models/Section');
const AcademicSession = require('./models/AcademicSession');

mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    await User.deleteMany();
    await Role.deleteMany();
    await Institution.deleteMany();
    await Branch.deleteMany();
    await Program.deleteMany();
    await Level.deleteMany();
    await Section.deleteMany();
    await AcademicSession.deleteMany();

    const inst = await Institution.create({
      name: 'Global University',
      type: 'university',
      contactEmail: 'contact@globaluni.com',
      contactPhone: '+1-555-0100',
      settings: { enableHostel: true, enableTransport: true, enableLibrary: true, enableAlumni: true }
    });

    const branch = await Branch.create({
      institutionId: inst._id,
      name: 'Main Campus',
      address: '123 University Blvd'
    });

    const session = await AcademicSession.create({
      institutionId: inst._id,
      name: '2026-27',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2027-05-30'),
      isActive: true
    });

    const program = await Program.create({
      institutionId: inst._id,
      name: 'B.Tech Computer Science'
    });

    const level = await Level.create({
      institutionId: inst._id,
      programId: program._id,
      name: 'Semester 1',
      order: 1
    });

    await Section.create({
      institutionId: inst._id,
      levelId: level._id,
      name: 'Section A'
    });

    let superAdminRole = await Role.findOne({ name: 'SuperAdmin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'SuperAdmin',
        description: 'System Administrator',
        institutionId: null,
        permissions: {
          'all': { read: true, write: true, edit: true, delete: true }
        }
      });
    }

    let adminRole = await Role.findOne({ name: 'Admin', institutionId: inst._id });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'Admin',
        description: 'Institution Admin',
        institutionId: inst._id,
        permissions: {
          'all': { read: true, write: true, edit: true, delete: true }
        }
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', salt);

    // Global SuperAdmin
    await User.create({
      username: 'superadmin',
      email: 'admin@Shyvora.in',
      password: hashedPassword,
      role: superAdminRole._id
    });

    // Institution Admin
    await User.create({
      username: 'instadmin',
      email: 'admin@globaluni.com',
      password: hashedPassword,
      role: adminRole._id,
      institutionId: inst._id,
      branchId: branch._id
    });

    console.log('Data Imported!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Role.deleteMany();
    await Institution.deleteMany();
    await Branch.deleteMany();
    await Program.deleteMany();
    await Level.deleteMany();
    await Section.deleteMany();
    await AcademicSession.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
