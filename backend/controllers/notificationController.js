const Notification = require("../models/Notification");
const Student = require("../models/Student");

// @desc    Create a new notification (Admin)
// @route   POST /api/v1/notifications
// @access  Private/Admin
const createNotification = async (req, res) => {
  try {
    const { title, message, targetType, targetId } = req.body;
    const notification = await Notification.create({
      title,
      message,
      targetType,
      targetId,
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get notifications for logged in student
// @route   GET /api/v1/notifications/my
// @access  Private/Student
const getMyNotifications = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const classQuery = student.currentClass
      ? `${student.currentClass.course} - ${student.currentClass.branch} - ${student.currentClass.semester} - ${student.currentClass.section}`
      : null;

    const queryConditions = [
      { targetType: "all" },
      { targetType: "student", targetId: student.studentId },
    ];

    if (classQuery) {
      queryConditions.push({ targetType: "class", targetId: classQuery });
    }

    const notifications = await Notification.find({
      $or: queryConditions,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all notifications (Admin)
// @route   GET /api/v1/notifications
// @access  Private/Admin
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete notification (Admin)
// @route   DELETE /api/v1/notifications/:id
// @access  Private/Admin
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  getAllNotifications,
  deleteNotification,
};
