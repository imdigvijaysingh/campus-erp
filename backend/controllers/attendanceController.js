const Student = require('../models/Student');

// @desc    Get students by class string (CourseName - Semester) for attendance
// @route   GET /api/v1/attendance/students
// @access  Private/Admin
const getStudentsByClass = async (req, res) => {
  try {
    const { department, course, branch, session, semester, section } = req.query;
    
    if (!department || !course || !branch || !session || !semester || !section) {
      return res.status(400).json({ message: 'All hierarchy parameters are required' });
    }

    const students = await Student.find({ 
      'currentClass.department': department,
      'currentClass.course': course,
      'currentClass.branch': branch,
      'currentClass.session': session,
      'currentClass.semester': semester,
      'currentClass.section': section,
      isActive: true
    }).select('studentId name currentClass attendanceRecords');
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Bulk update attendance
// @route   PUT /api/v1/attendance/bulk
// @access  Private/Admin
const bulkUpdateAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    // records: [{ studentId, subject, month, totalClasses, attendedClasses }]

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Invalid records format' });
    }

    for (const record of records) {
      const student = await Student.findById(record.studentId);
      if (student) {
        // Calculate percentage
        const percentage = record.totalClasses > 0 ? ((record.attendedClasses / record.totalClasses) * 100).toFixed(2) : 0;
        
        // Check if attendance record for subject and month already exists
        const existingRecordIndex = student.attendanceRecords.findIndex(
          r => r.subject === record.subject && r.month === record.month
        );

        if (existingRecordIndex !== -1) {
          // Update existing
          student.attendanceRecords[existingRecordIndex].totalClasses = record.totalClasses;
          student.attendanceRecords[existingRecordIndex].attendedClasses = record.attendedClasses;
          student.attendanceRecords[existingRecordIndex].percentage = parseFloat(percentage);
        } else {
          // Add new
          student.attendanceRecords.push({
            subject: record.subject,
            month: record.month,
            totalClasses: record.totalClasses,
            attendedClasses: record.attendedClasses,
            percentage: parseFloat(percentage)
          });
        }

        // Calculate overall attendance percentage
        let totalAllClasses = 0;
        let attendedAllClasses = 0;
        student.attendanceRecords.forEach(r => {
          totalAllClasses += r.totalClasses;
          attendedAllClasses += r.attendedClasses;
        });
        
        if (totalAllClasses > 0) {
          student.attendance = parseFloat(((attendedAllClasses / totalAllClasses) * 100).toFixed(2));
        } else {
          student.attendance = 0;
        }

        await student.save();
      }
    }

    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error("Bulk update attendance error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getStudentsByClass, bulkUpdateAttendance };
