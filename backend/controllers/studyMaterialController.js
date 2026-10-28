const StudyMaterial = require('../models/StudyMaterial');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// @desc    Create a new study material (Admin)
// @route   POST /api/v1/study-materials
// @access  Private/Admin
const createStudyMaterial = async (req, res) => {
  try {
    let { title, description, type, url, thumbnailUrl, targetClass } = req.body;
    
    if (type === 'youtube') {
      const videoId = getYouTubeVideoId(url);
      if (videoId) {
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }

    const material = await StudyMaterial.create({ title, description, type, url, thumbnailUrl, targetClass });
    
    // Notify class
    await Notification.create({
      title: `New Study Material: ${title}`,
      message: `New study material (${type}) has been uploaded.`,
      targetType: 'class',
      targetId: targetClass,
      actionTab: 'studyMaterials'
    });

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// @desc    Get study materials for logged in student
// @route   GET /api/v1/study-materials/my
// @access  Private/Student
const getMyStudyMaterials = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id);
    if (!student) {
       return res.status(404).json({ message: 'Student not found' });
    }
    const classQuery = student.currentClass ? `${student.currentClass.course} - ${student.currentClass.branch} - ${student.currentClass.semester} - ${student.currentClass.section}` : null;
    if (!classQuery) return res.json([]);
    
    const materials = await StudyMaterial.find({ targetClass: classQuery }).sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
// @desc    Get all study materials (Admin)
// @route   GET /api/v1/study-materials
// @access  Private/Admin
const getAllStudyMaterials = async (req, res) => {
  try {
    const materials = await StudyMaterial.find().sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete study material (Admin)
// @route   DELETE /api/v1/study-materials/:id
// @access  Private/Admin
const deleteStudyMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (material) {
      const Notification = require('../models/Notification');
      const { deleteMediaByUrl } = require('./mediaController');
      await Notification.deleteMany({ title: `New Study Material: ${material.title}` });
      if (material.fileUrl) await deleteMediaByUrl(material.fileUrl);
      if (material.thumbnailUrl) await deleteMediaByUrl(material.thumbnailUrl);
      if (material.url) await deleteMediaByUrl(material.url);
      await material.deleteOne();
    }
    res.json({ message: 'Study material deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createStudyMaterial, getMyStudyMaterials, getAllStudyMaterials, deleteStudyMaterial };
