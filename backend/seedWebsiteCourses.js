const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const WebsiteCourse = require('./models/WebsiteCourse');

dotenv.config();

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Shyvora');
    console.log('MongoDB connected for seeding WebsiteCourses');

    // Read the frontend coursesData.js
    const dataPath = path.join(__dirname, '../frontend/src/data/coursesData.js');
    let content = fs.readFileSync(dataPath, 'utf-8');

    // Convert ES6 imports to string paths
    // Example: import BtechCS from "../assets/courses_images/courses/undergraduate/btech/computer_science.webp";
    // Becomes: const BtechCS = "/src/assets/courses_images/courses/undergraduate/btech/computer_science.webp";
    content = content.replace(/import\s+(\w+)\s+from\s+["'](.*?)["'];/g, 'const $1 = "$2";');

    // Convert `export const X =` to `const X = exports.X =`
    content = content.replace(/export\s+const\s+(\w+)\s*=/g, 'const $1 = exports.$1 =');

    // Save as a temporary CommonJS file
    const tempPath = path.join(__dirname, 'tempCoursesData.js');
    fs.writeFileSync(tempPath, content);

    // Require the temp file
    const coursesData = require('./tempCoursesData.js');

    // Clear existing data
    await WebsiteCourse.deleteMany();
    console.log('Cleared existing WebsiteCourses');

    // Build the payload
    const payload = [];

    const categories = [
      { name: 'engineering', data: coursesData.engineeringCourses },
      { name: 'computer-applications', data: coursesData.computerApplicationCourses },
      { name: 'polytechnic', data: coursesData.polytechnicCourses },
      { name: 'management', data: coursesData.managementCourses },
      { name: 'pharmacy', data: coursesData.pharmacyCourses }
    ];

    for (const cat of categories) {
      if (cat.data) {
        for (const course of cat.data) {
          payload.push({
            id: course.id,
            slug: course.slug,
            title: course.title,
            duration: course.duration,
            category: cat.name,
            image: course.image.replace('../assets', '/src/assets'), // fix path for frontend Vite
            description: course.description,
            aboutDescription: course.aboutDescription || course.description,
            features: course.features,
            eligibility: course.eligibility,
            approach: course.approach,
            documentsRequired: course.documentsRequired,
            syllabus: course.syllabus || [],
            isActive: true
          });
        }
      }
    }

    await WebsiteCourse.insertMany(payload);
    console.log(`Successfully seeded ${payload.length} WebsiteCourses`);

    // Clean up
    fs.unlinkSync(tempPath);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedCourses();
