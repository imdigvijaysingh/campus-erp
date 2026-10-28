const Syllabus = require('../models/Syllabus');

// Get all syllabi
exports.getSyllabi = async (req, res) => {
  try {
    const syllabi = await Syllabus.find();
    res.status(200).json({ success: true, data: syllabi });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new syllabus (for testing/admin)
exports.createSyllabus = async (req, res) => {
  try {
    const newSyllabus = await Syllabus.create(req.body);
    res.status(201).json({ success: true, data: newSyllabus });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
