const CourseHierarchy = require('../models/CourseHierarchy');
const logActivity = require('../utils/logger');

// Seed default NCrF-compliant course hierarchy if empty
const seedDefaultHierarchy = async () => {
  const count = await CourseHierarchy.countDocuments();
  if (count === 0) {
    await CourseHierarchy.create({
      name: "Faculty of Engineering & Technology",
      code: "FET",
      courses: [
        {
          name: "B.Tech",
          code: "BT-CSE",
          ncrfLevel: "Level 6.0 (Bachelor Hons/Research 4-Yr)",
          totalCreditsRequired: 160,
          branches: [
            {
              name: "Computer Science & Engineering",
              sessions: [
                {
                  name: "2026-27",
                  years: [
                    {
                      name: "1st Year",
                      semesters: [
                        {
                          name: "1st Semester",
                          sections: [
                            {
                              name: "Section A",
                              subjects: [
                                {
                                  name: "Data Structures & Algorithms",
                                  code: "CS201",
                                  creditPoints: 4,
                                  creditHours: { theory: 3, tutorial: 1, practical: 2 },
                                  courseType: "Major",
                                  ncrfLevel: "Level 6.0",
                                  learningOutcomes: [
                                    "Analyze time and space complexity of sorting and graph algorithms",
                                    "Implement dynamic memory and tree operations"
                                  ]
                                },
                                {
                                  name: "Discrete Mathematics",
                                  code: "MATH201",
                                  creditPoints: 3,
                                  creditHours: { theory: 3, tutorial: 1, practical: 0 },
                                  courseType: "Major",
                                  ncrfLevel: "Level 6.0",
                                  learningOutcomes: [
                                    "Apply propositional logic and combinatorics to computing problems"
                                  ]
                                },
                                {
                                  name: "Universal Human Values & Professional Ethics",
                                  code: "UHV101",
                                  creditPoints: 2,
                                  creditHours: { theory: 2, tutorial: 0, practical: 0 },
                                  courseType: "VAC",
                                  ncrfLevel: "Level 6.0",
                                  learningOutcomes: [
                                    "Demonstrate ethical responsibility and team harmony"
                                  ]
                                }
                              ]
                            }
                          ],
                          subjects: []
                        }
                      ],
                      subjects: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });
  }
};

exports.getHierarchies = async (req, res, next) => {
  try {
    await seedDefaultHierarchy();
    const hierarchies = await CourseHierarchy.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: hierarchies.length, data: hierarchies });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getHierarchy = async (req, res, next) => {
  try {
    const hierarchy = await CourseHierarchy.findById(req.params.id);
    if (!hierarchy) return res.status(404).json({ success: false, error: 'Hierarchy not found' });
    res.status(200).json({ success: true, data: hierarchy });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createHierarchy = async (req, res, next) => {
  try {
    const hierarchy = await CourseHierarchy.create(req.body);
    const username = req.user ? req.user.username : 'admin';
    await logActivity('Created', 'Courses', `Created department: ${hierarchy.name}`, username);
    res.status(201).json({ success: true, data: hierarchy });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateHierarchy = async (req, res, next) => {
  try {
    const hierarchy = await CourseHierarchy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hierarchy) return res.status(404).json({ success: false, error: 'Hierarchy not found' });
    const username = req.user ? req.user.username : 'admin';
    await logActivity('Updated', 'Courses', `Updated department: ${hierarchy.name}`, username);
    res.status(200).json({ success: true, data: hierarchy });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteHierarchy = async (req, res, next) => {
  try {
    const hierarchy = await CourseHierarchy.findById(req.params.id);
    if (!hierarchy) return res.status(404).json({ success: false, error: 'Hierarchy not found' });
    await hierarchy.deleteOne();
    const username = req.user ? req.user.username : 'admin';
    await logActivity('Deleted', 'Courses', `Deleted department: ${hierarchy.name}`, username);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
