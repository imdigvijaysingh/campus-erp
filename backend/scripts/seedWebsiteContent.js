const mongoose = require('mongoose');
const dotenv = require('dotenv');
const PageContent = require('../models/PageContent');
const CareerOpening = require('../models/CareerOpening');
const GalleryImage = require('../models/GalleryImage');

// Load env vars
dotenv.config({ path: __dirname + '/../.env' });

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // 1. Placements Stats
    console.log('Seeding Placement Stats...');
    await PageContent.findOneAndUpdate(
      { page: 'placements', section: 'stats' },
      {
        content: [
          { value: '42 LPA', label: 'Highest Package' },
          { value: '8.5 LPA', label: 'Average Package' },
          { value: '250+', label: 'Top Recruiters' },
          { value: '85%', label: 'Placement Rate' }
        ]
      },
      { upsert: true, new: true }
    );

    // 2. Placements Process
    await PageContent.findOneAndUpdate(
      { page: 'placements', section: 'process' },
      {
        content: [
          { step: "01", title: "Aptitude & Soft Skills Training", desc: "Rigorous training sessions starting from pre-final year focusing on quantitative aptitude, logical reasoning, and communication skills." },
          { step: "02", title: "Technical Mock Interviews", desc: "Industry experts conduct mock technical interviews to give students real-world experience and detailed feedback." },
          { step: "03", title: "Pre-Placement Talks", desc: "Companies visit the campus to interact with students, discussing job profiles, company culture, and expectations." },
          { step: "04", title: "Campus Recruitment Drive", desc: "Final selection process including written tests, group discussions, and personal interviews by recruiting companies." }
        ]
      },
      { upsert: true, new: true }
    );

    // 3. Career Openings
    console.log('Seeding Career Openings...');
    await CareerOpening.deleteMany({}); // Clear existing
    await CareerOpening.insertMany([
      {
        title: 'Professor',
        department: 'B.Tech, MBA, MCA, B.Pharm',
        type: 'Full-time',
        description: 'Professor position for various departments.',
        requirements: ['PhD/M.Tech Required']
      },
      {
        title: 'Associate Professor',
        department: 'B.Tech, MBA, MCA, B.Pharm',
        type: 'Full-time',
        description: 'Associate Professor position for various departments.',
        requirements: ['PhD/M.Tech Required']
      },
      {
        title: 'Assistant Professor',
        department: 'B.Tech, MBA, MCA, B.Pharm',
        type: 'Full-time',
        description: 'Assistant Professor position for various departments.',
        requirements: ['M.Tech/MBA/MCA Required']
      },
      {
        title: 'Applied Science Faculty',
        department: 'Physics/Maths/Chemistry/English',
        type: 'Academic',
        description: 'Positions: Professor/Assoc.Prof./Asst.Prof.',
        requirements: ['Ph.D. in relevant field']
      },
      {
        title: 'Principal for Polytechnic Institute',
        department: 'Polytechnic',
        type: 'Leadership',
        description: 'Leadership position for the Polytechnic Institute.',
        requirements: ['As per AICTE/PCI/UGC norms']
      }
    ]);

    // 4. Default Gallery Images (Placements)
    console.log('Seeding Placement Gallery...');
    await GalleryImage.deleteMany({ page: 'placements' });
    await GalleryImage.insertMany([
      { page: 'placements', category: 'records', imageUrl: '1.webp', caption: 'Placement 1', order: 1 },
      { page: 'placements', category: 'records', imageUrl: '2.webp', caption: 'Placement 2', order: 2 },
      { page: 'placements', category: 'records', imageUrl: '3.webp', caption: 'Placement 3', order: 3 },
      { page: 'placements', category: 'records', imageUrl: '4.webp', caption: 'Placement 4', order: 4 },
      { page: 'placements', category: 'recruiters', imageUrl: '1.webp', caption: 'Recruiter 1', order: 1 },
      { page: 'placements', category: 'recruiters', imageUrl: '2.webp', caption: 'Recruiter 2', order: 2 },
      { page: 'placements', category: 'recruiters', imageUrl: '3.webp', caption: 'Recruiter 3', order: 3 },
    ]);

    // Note: The UI will need to handle these local assets carefully or the admin can replace them with ImageKit URLs

    console.log('Database successfully seeded with Website Content!');
    process.exit(0);
  } catch (error) {
    console.error('Error with data import:', error);
    process.exit(1);
  }
};

seedData();
