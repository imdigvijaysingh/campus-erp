const Student = require('../models/Student');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Institution = require('../models/Institution');
const Program = require('../models/Program');
const Level = require('../models/Level');
const AcademicSession = require('../models/AcademicSession');

// Generate JWT for student
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Admin: Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const { department, course, branch, session, semester, section } = req.query;
    const filter = { ...(req.tenantFilter || {}) };
    
    if (department) filter['currentClass.department'] = department;
    if (course) filter['currentClass.course'] = course;
    if (branch) filter['currentClass.branch'] = branch;
    if (session) filter['currentClass.session'] = session;
    if (semester) filter['currentClass.semester'] = semester;
    if (section) filter['currentClass.section'] = section;

    const students = await Student.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Public: Register a new student
// @route   POST /api/students/signup
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const { studentId, password, name, email, phone, dob, apaarId, abcAccountId, parentalConsent } = req.body;

    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    const emailExists = await Student.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const student = await Student.create({
      studentId,
      password,
      name,
      email,
      phone,
      ...(dob && { dob }),
      ...(apaarId && { apaarId }),
      ...(abcAccountId && { abcAccountId }),
      ...(parentalConsent && { parentalConsent }),
      currentClass: {
        department: '',
        course: '',
        branch: '',
        session: '',
        semester: '1st Semester',
        section: 'Section A',
        marks: []
      }
    });

    // Find or create Student Role
    let studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      studentRole = await Role.create({
        name: 'Student',
        description: 'Default Student Role',
        permissions: { dashboard: { read: true } }
      });
    }

    // Create linked User
    await User.create({
      username: studentId,
      email,
      password: req.body.password, // raw password, User model hashes it
      role: studentRole._id,
      studentProfile: student._id
    });

    if (student) {
      res.status(201).json({
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        token: generateToken(student._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid student data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin: Create a new student
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    const { 
      studentId, password, name, email, phone, address, photo, currentClass, 
      attendance, feeDetails, semesters, admitCardUrl, isActive,
      fatherName, motherName, dob, college, specialization, classRollNo, 
      enrollmentNo, universityRollNo, highSchoolPercent, intermediatePercent,
      apaarId, abcAccountId, digilockerVerified, ncrfCredits, parentalConsent
    } = req.body;

    // Check if student exists
    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    if (email) {
      const emailExists = await Student.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const studentData = {
      studentId, password, name, 
      ...(email && { email }), 
      ...(phone && { phone }),
      address, photo, currentClass, attendance, feeDetails, semesters, admitCardUrl, 
      isActive: isActive !== undefined ? isActive : true,
      fatherName, motherName, dob, college, specialization, classRollNo,
      enrollmentNo, universityRollNo, highSchoolPercent, intermediatePercent,
      apaarId, abcAccountId, digilockerVerified, ncrfCredits, parentalConsent
    };

    if (studentData.currentClass) {
      if (!studentData.currentClass.semester) {
        studentData.currentClass.semester = '1st Semester';
      }
    } else {
      studentData.currentClass = {
        department: '',
        course: '',
        branch: '',
        session: '',
        semester: '1st Semester',
        section: 'Section A',
        marks: []
      };
    }

    const student = await Student.create(studentData);

    // Find or create Student Role
    let studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      studentRole = await Role.create({
        name: 'Student',
        description: 'Default Student Role',
        permissions: { dashboard: { read: true } }
      });
    }

    // Create linked User
    await User.create({
      username: studentId,
      email,
      password: req.body.password, // raw password, User model hashes it
      role: studentRole._id,
      studentProfile: student._id
    });

    if (student) {
      res.status(201).json({
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        currentClass: student.currentClass
      });
    } else {
      res.status(400).json({ message: 'Invalid student data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin: Create multiple students (bulk)
// @route   POST /api/students/bulk
// @access  Private/Admin
const createBulkStudents = async (req, res) => {
  try {
    const studentsArray = req.body.students; // expects { students: [...] }
    if (!studentsArray || !Array.isArray(studentsArray)) {
      return res.status(400).json({ message: 'Invalid bulk data' });
    }

    const createdStudents = [];
    const errors = [];

    // Find or create Student Role once
    let studentRole = await Role.findOne({ name: 'Student' });
    if (!studentRole) {
      studentRole = await Role.create({
        name: 'Student',
        description: 'Default Student Role',
        permissions: { dashboard: { read: true } }
      });
    }

    for (let i = 0; i < studentsArray.length; i++) {
      const studentData = studentsArray[i];
      try {
        const studentExists = await Student.findOne({ studentId: studentData.studentId });
        if (studentExists) {
          errors.push(`Row ${i + 1}: Student ID ${studentData.studentId} already exists`);
          continue;
        }

        if (studentData.email) {
          const emailExists = await Student.findOne({ email: studentData.email });
          if (emailExists) {
            errors.push(`Row ${i + 1}: Email ${studentData.email} already exists`);
            continue;
          }
        }

        // Add isActive default
        if (studentData.isActive === undefined) studentData.isActive = true;

        // Default semester to 1st Semester for new admission
        if (!studentData.currentClass) {
          studentData.currentClass = {
            semester: '1st Semester',
            section: 'Section A',
            marks: []
          };
        } else if (!studentData.currentClass.semester) {
          studentData.currentClass.semester = '1st Semester';
        }

        const student = await Student.create(studentData);

        // Create linked User
        await User.create({
          username: studentData.studentId,
          email: studentData.email,
          password: studentData.password, // raw password
          role: studentRole._id,
          studentProfile: student._id
        });

        createdStudents.push(student);
      } catch (err) {
        errors.push(`Row ${i + 1}: Failed to create - ${err.message}`);
      }
    }

    res.status(201).json({
      message: `Successfully created ${createdStudents.length} students. Failed: ${errors.length}`,
      createdCount: createdStudents.length,
      errors: errors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin: Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      let admitCardUpdated = false;
      let reportCardUpdated = false;

      // Update basic fields
      if (req.body.name) student.name = req.body.name;
      if (req.body.email) student.email = req.body.email;
      if (req.body.phone) student.phone = req.body.phone;
      if (req.body.address) student.address = req.body.address;
      if (req.body.photo !== undefined) student.photo = req.body.photo;
      if (req.body.isActive !== undefined) student.isActive = req.body.isActive;
      
      // New Profile Fields
      if (req.body.fatherName !== undefined) student.fatherName = req.body.fatherName;
      if (req.body.motherName !== undefined) student.motherName = req.body.motherName;
      if (req.body.dob !== undefined) student.dob = req.body.dob;
      if (req.body.college !== undefined) student.college = req.body.college;
      if (req.body.specialization !== undefined) student.specialization = req.body.specialization;
      if (req.body.classRollNo !== undefined) student.classRollNo = req.body.classRollNo;
      if (req.body.enrollmentNo !== undefined) student.enrollmentNo = req.body.enrollmentNo;
      if (req.body.universityRollNo !== undefined) student.universityRollNo = req.body.universityRollNo;
      if (req.body.highSchoolPercent !== undefined) student.highSchoolPercent = req.body.highSchoolPercent;
      if (req.body.intermediatePercent !== undefined) student.intermediatePercent = req.body.intermediatePercent;

      // NCrF & APAAR / ABC / DPDP Child Safety updates
      if (req.body.apaarId !== undefined) student.apaarId = req.body.apaarId;
      if (req.body.abcAccountId !== undefined) student.abcAccountId = req.body.abcAccountId;
      if (req.body.digilockerVerified !== undefined) student.digilockerVerified = req.body.digilockerVerified;
      if (req.body.ncrfCredits !== undefined) student.ncrfCredits = { ...(student.ncrfCredits || {}), ...req.body.ncrfCredits };
      if (req.body.parentalConsent !== undefined) student.parentalConsent = { ...(student.parentalConsent || {}), ...req.body.parentalConsent };

      // Update nested objects
      if (req.body.currentClass) {
        if (req.body.currentClass.marks && req.body.currentClass.marks.length > 0) {
          // If marks are updated, consider it a report card update
          if (JSON.stringify(student.currentClass.marks) !== JSON.stringify(req.body.currentClass.marks)) {
             reportCardUpdated = true;
          }
        }
        student.currentClass = req.body.currentClass;
      }
      if (req.body.attendance !== undefined) {
        student.attendance = req.body.attendance;
      }
      if (req.body.feeDetails) {
        student.feeDetails = req.body.feeDetails;
      }
      if (req.body.semesters !== undefined) {
        if (JSON.stringify(student.semesters) !== JSON.stringify(req.body.semesters)) {
           reportCardUpdated = true;
        }
        student.semesters = req.body.semesters;
      }
      if (req.body.admitCardUrl !== undefined) {
        if (student.admitCardUrl !== req.body.admitCardUrl && req.body.admitCardUrl !== '') {
           admitCardUpdated = true;
        }
        student.admitCardUrl = req.body.admitCardUrl;
      }

      // Allow password update if provided
      if (req.body.password) {
        student.password = req.body.password;
        const linkedUser = await User.findOne({ studentProfile: student._id }).select('+password');
        if (linkedUser) {
          linkedUser.password = req.body.password;
          await linkedUser.save();
        }
      }

      const updatedStudent = await student.save();

      // Notifications
      if (admitCardUpdated) {
        await Notification.create({
          title: `Admit Card Available`,
          message: `Your admit card has been generated. Please download it from the portal.`,
          targetType: 'student',
          targetId: updatedStudent.studentId,
          actionTab: 'overview'
        });
      }

      if (reportCardUpdated) {
        await Notification.create({
          title: `Report Card Updated`,
          message: `Your report card / marks have been updated. Check your profile.`,
          targetType: 'student',
          targetId: updatedStudent.studentId,
          actionTab: 'reportCard'
        });
      }

      res.json({
        _id: updatedStudent._id,
        studentId: updatedStudent.studentId,
        name: updatedStudent.name,
        currentClass: updatedStudent.currentClass
      });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin: Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      const { deleteMediaByUrl } = require('./mediaController');
      if (student.photo) await deleteMediaByUrl(student.photo);
      if (student.admitCardUrl) await deleteMediaByUrl(student.admitCardUrl);
      
      await student.deleteOne();
      res.json({ message: 'Student removed' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================================
// STUDENT FACING ROUTES
// ==========================================

// @desc    Student Auth & get token
// @route   POST /api/students/login
// @access  Public
const authStudent = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    const student = await Student.findOne({ studentId }).select('+password');

    if (student && (await student.matchPassword(password))) {
      if (!student.isActive) {
        return res.status(401).json({ message: 'Account disabled. Contact administration.' });
      }

      res.json({
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        photo: student.photo,
        token: generateToken(student._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid Student ID or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get logged in student profile
// @route   GET /api/students/me
// @access  Private/Student
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id)
      .populate('institutionId', 'name type')
      .populate('programId', 'name code')
      .populate('levelId', 'name order')
      .populate('sessionId', 'name')
      .select('-password');

    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update logged in student profile
// @route   PUT /api/students/me
// @access  Private/Student
const updateStudentProfileSelf = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id);

    if (student) {
      student.name = req.body.name !== undefined ? req.body.name : student.name;
      student.email = req.body.email !== undefined ? req.body.email : student.email;
      student.phone = req.body.phone !== undefined ? req.body.phone : student.phone;
      student.address = req.body.address !== undefined ? req.body.address : student.address;
      if (req.body.photo !== undefined) student.photo = req.body.photo;
      if (req.body.password) {
        student.password = req.body.password;
        const linkedUser = await User.findOne({ studentProfile: student._id }).select('+password');
        if (linkedUser) {
          linkedUser.password = req.body.password;
          await linkedUser.save();
        }
      }

      // New Profile Fields
      if (req.body.fatherName !== undefined) student.fatherName = req.body.fatherName;
      if (req.body.motherName !== undefined) student.motherName = req.body.motherName;
      if (req.body.dob !== undefined) student.dob = req.body.dob;
      if (req.body.college !== undefined) student.college = req.body.college;
      if (req.body.specialization !== undefined) student.specialization = req.body.specialization;
      if (req.body.classRollNo !== undefined) student.classRollNo = req.body.classRollNo;
      if (req.body.enrollmentNo !== undefined) student.enrollmentNo = req.body.enrollmentNo;
      if (req.body.universityRollNo !== undefined) student.universityRollNo = req.body.universityRollNo;
      if (req.body.highSchoolPercent !== undefined) student.highSchoolPercent = req.body.highSchoolPercent;
      if (req.body.intermediatePercent !== undefined) student.intermediatePercent = req.body.intermediatePercent;

      const updatedStudent = await student.save();

      // Log the activity for admin notifications
      try {
        await Activity.create({
          action: 'Updated',
          entity: 'Student Profile',
          details: `Student ${updatedStudent.name} (${updatedStudent.studentId}) updated their profile.`,
          user: `Student ${updatedStudent.studentId}`
        });
      } catch (err) {
        console.error('Failed to log activity:', err);
      }

      const populatedStudent = await Student.findById(updatedStudent._id)
        .populate('institutionId', 'name type')
        .populate('programId', 'name code')
        .populate('levelId', 'name order')
        .populate('sessionId', 'name')
        .select('-password');

      const studentObj = populatedStudent ? populatedStudent.toObject() : updatedStudent.toObject();
      studentObj.token = generateToken(updatedStudent._id);

      res.json(studentObj);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin: Decrypt and reveal unmasked APAAR ID (Audit Logged)
// @route   POST /api/v1/students/:id/reveal-apaar
// @access  Private/Admin
const revealApaarId = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // High severity audit log for APAAR decryption
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        actor: {
          userId: req.user?._id,
          username: req.user?.username || 'Admin',
          role: req.user?.role?.name || 'Admin'
        },
        institutionId: student.institutionId || req.user?.institutionId,
        action: 'SECURITY_ALERT',
        resource: 'Student_APAAR_Decryption',
        resourceId: student._id.toString(),
        details: `Decrypted and accessed unmasked APAAR ID for student ${student.name} (${student.studentId}) under regulatory oversight`,
        metadata: {
          ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
          userAgent: req.get('user-agent') || 'Browser',
          route: req.originalUrl,
          studentName: student.name,
          studentId: student.studentId
        },
        riskLevel: 'HIGH',
        timestamp: new Date()
      });
    } catch (auditErr) {
      console.error('Failed to log APAAR decryption audit:', auditErr);
    }

    res.json({
      success: true,
      studentId: student.studentId,
      name: student.name,
      apaarId: student.apaarId || 'Not Registered',
      abcAccountId: student.abcAccountId || 'Not Registered',
      digilockerVerified: student.digilockerVerified || false,
      ncrfCredits: student.ncrfCredits || { earnedCredits: 0, ncrfLevel: 'Level 5.5' }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin/Student: Sync ABC credits with Academic Bank of Credits & DigiLocker
// @route   POST /api/v1/students/:id/sync-abc
// @access  Private
const syncAbcCredits = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const currentCredits = student.ncrfCredits?.earnedCredits || 20;
    const additionalCredits = Number(req.body.additionalCredits) || 4;

    student.digilockerVerified = true;
    student.ncrfCredits = {
      earnedCredits: currentCredits + additionalCredits,
      transferredCredits: student.ncrfCredits?.transferredCredits || 0,
      ncrfLevel: req.body.ncrfLevel || student.ncrfCredits?.ncrfLevel || 'Level 6.0',
      abcLastSynced: new Date()
    };

    await student.save();

    res.json({
      success: true,
      message: 'Academic Bank of Credits (ABC) & DigiLocker synced successfully',
      ncrfCredits: student.ncrfCredits,
      digilockerVerified: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin: Batch promote students across semester/session
// @route   POST /api/students/batch-promote
// @access  Private/Admin
const batchPromoteStudents = async (req, res) => {
  try {
    const { department, course, branch, session, fromSemester, toSemester, toSection, newSession } = req.body;

    if (!session || !toSemester) {
      return res.status(400).json({ message: 'Session and target semester are required for batch promotion' });
    }

    const filter = {
      'currentClass.session': session
    };

    if (department) filter['currentClass.department'] = department;
    if (course) filter['currentClass.course'] = course;
    if (branch) filter['currentClass.branch'] = branch;
    if (fromSemester) filter['currentClass.semester'] = fromSemester;

    const students = await Student.find(filter);

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found matching the specified batch criteria', promotedCount: 0 });
    }

    let promotedCount = 0;
    const targetSession = newSession || session;

    for (const student of students) {
      // Archive current class to history
      const oldClass = {
        department: student.currentClass?.department || department || '',
        course: student.currentClass?.course || course || '',
        branch: student.currentClass?.branch || branch || '',
        session: student.currentClass?.session || session,
        semester: student.currentClass?.semester || fromSemester || '',
        section: student.currentClass?.section || '',
        marks: student.currentClass?.marks || []
      };

      if (!student.semesters) student.semesters = [];
      student.semesters.push(oldClass);

      // Promote to new semester
      student.currentClass = {
        department: student.currentClass?.department || department || '',
        course: student.currentClass?.course || course || '',
        branch: student.currentClass?.branch || branch || '',
        session: targetSession,
        semester: toSemester,
        section: toSection || student.currentClass?.section || 'Section A',
        marks: []
      };

      // Reset semester attendance for new semester
      student.attendance = 0;

      await student.save();
      promotedCount++;
    }

    // Log Activity safely if institution is set
    if (req.user?.institutionId) {
      try {
        await Activity.create({
          institutionId: req.user.institutionId,
          action: 'Updated',
          entity: 'Student',
          details: `Batch promoted ${promotedCount} students of batch ${session} (${fromSemester || 'All'} -> ${toSemester})`,
          user: req.user?.username || 'Admin'
        });
      } catch (actErr) {
        console.warn('Activity log skipped:', actErr.message);
      }
    }

    res.json({
      success: true,
      message: `Successfully promoted ${promotedCount} students to ${toSemester} (${targetSession})`,
      promotedCount
    });
  } catch (error) {
    console.error('Batch promote error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  authStudent,
  getStudentProfile,
  updateStudentProfileSelf,
  registerStudent,
  createBulkStudents,
  revealApaarId,
  syncAbcCredits,
  batchPromoteStudents
};
