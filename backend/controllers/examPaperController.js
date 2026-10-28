const ExamPaper = require('../models/ExamPaper');

// @desc    Get filtered exam papers with search & pagination
// @route   GET /api/v1/exam-papers
// @access  Public / Authenticated
exports.getExamPapers = async (req, res) => {
  try {
    const { 
      category, 
      course, 
      semester, 
      targetClass, 
      stream, 
      paperType, 
      academicYear, 
      department,
      subject,
      search,
      page = 1,
      limit = 25
    } = req.query;

    let query = { isActive: true };

    if (category && category !== 'all') {
      query.category = category;
    }
    if (course && course !== 'all') {
      query.course = course;
    }
    if (semester && semester !== 'all') {
      query.semester = semester;
    }
    if (targetClass && targetClass !== 'all') {
      query.targetClass = targetClass;
    }
    if (stream && stream !== 'all') {
      query.stream = stream;
    }
    if (paperType && paperType !== 'all') {
      query.paperType = paperType;
    }
    if (academicYear && academicYear !== 'all') {
      query.academicYear = academicYear;
    }
    if (department && department !== 'all') {
      query.department = department;
    }
    if (subject && subject !== 'all') {
      query.subject = subject;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { subject: searchRegex },
        { subjectCode: searchRegex },
        { course: searchRegex },
        { targetClass: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const total = await ExamPaper.countDocuments(query);
    const papers = await ExamPaper.find(query)
      .sort({ academicYear: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({ 
      success: true, 
      count: papers.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      },
      data: papers 
    });
  } catch (error) {
    console.error('Error in getExamPapers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dynamic filters for schools & colleges
// @route   GET /api/v1/exam-papers/filters
// @access  Public / Authenticated
exports.getExamPaperFilters = async (req, res) => {
  try {
    // College specific distincts
    const collegeCourses = await ExamPaper.distinct('course', { category: 'college', isActive: true });
    const collegeSemesters = await ExamPaper.distinct('semester', { category: 'college', isActive: true });
    const collegeDepartments = await ExamPaper.distinct('department', { category: 'college', isActive: true });

    // School specific distincts
    const schoolClasses = await ExamPaper.distinct('targetClass', { category: 'school', isActive: true });
    const schoolStreams = await ExamPaper.distinct('stream', { category: 'school', isActive: true });

    // Shared distincts
    const subjects = await ExamPaper.distinct('subject', { isActive: true });
    const paperTypes = await ExamPaper.distinct('paperType', { isActive: true });
    const academicYears = await ExamPaper.distinct('academicYear', { isActive: true });

    // Hierarchical grouping for college cascaded selection
    const collegeHierarchy = await ExamPaper.aggregate([
      { $match: { category: 'college', isActive: true } },
      {
        $group: {
          _id: { course: "$course", semester: "$semester" },
          subjects: { $addToSet: "$subject" }
        }
      },
      {
        $group: {
          _id: "$_id.course",
          semesters: {
            $push: {
              semester: "$_id.semester",
              subjects: "$subjects"
            }
          }
        }
      }
    ]);

    // Hierarchical grouping for school cascaded selection
    const schoolHierarchy = await ExamPaper.aggregate([
      { $match: { category: 'school', isActive: true } },
      {
        $group: {
          _id: { targetClass: "$targetClass", stream: "$stream" },
          subjects: { $addToSet: "$subject" }
        }
      },
      {
        $group: {
          _id: "$_id.targetClass",
          streams: {
            $push: {
              stream: "$_id.stream",
              subjects: "$subjects"
            }
          }
        }
      }
    ]);

    res.status(200).json({ 
      success: true, 
      data: {
        college: {
          courses: collegeCourses.filter(Boolean),
          semesters: collegeSemesters.filter(Boolean),
          departments: collegeDepartments.filter(Boolean),
          hierarchy: collegeHierarchy
        },
        school: {
          classes: schoolClasses.filter(Boolean),
          streams: schoolStreams.filter(Boolean),
          hierarchy: schoolHierarchy
        },
        subjects: subjects.filter(Boolean),
        paperTypes: paperTypes.length ? paperTypes : ['Previous Year Exam Paper', 'Sample / Model Paper', 'Pre-Board Exam Paper', 'Mid-Term Paper'],
        academicYears: academicYears.length ? academicYears.sort().reverse() : ['2025-26', '2024-25', '2023-24', '2022-23']
      }
    });
  } catch (error) {
    console.error('Error in getExamPaperFilters:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new exam paper or sample paper
// @route   POST /api/v1/exam-papers
// @access  Private (Admin / Faculty)
exports.createExamPaper = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Auto-detect category if not explicitly specified
    if (!payload.category) {
      if (payload.targetClass || (payload.institutionType && payload.institutionType === 'school')) {
        payload.category = 'school';
      } else {
        payload.category = 'college';
      }
    }

    // Default title if omitted
    if (!payload.title) {
      const scopeLabel = payload.category === 'school' ? payload.targetClass : `${payload.course} ${payload.semester}`;
      payload.title = `${payload.subject} (${scopeLabel}) - ${payload.academicYear} [${payload.paperType || 'Paper'}]`;
    }

    if (req.user) {
      if (req.user.institutionId && !payload.institutionId) {
        payload.institutionId = req.user.institutionId;
      }
      payload.uploadedBy = req.user.name || req.user.username || 'Exam Controller';
    }

    const newPaper = await ExamPaper.create(payload);
    res.status(201).json({ success: true, data: newPaper });
  } catch (error) {
    console.error('Error creating exam paper:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an exam paper
// @route   DELETE /api/v1/exam-papers/:id
// @access  Private (Admin / Faculty)
exports.deleteExamPaper = async (req, res) => {
  try {
    const paper = await ExamPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Exam paper not found' });
    }

    await ExamPaper.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Exam paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment downloads counter
// @route   PATCH /api/v1/exam-papers/:id/download
// @access  Public / Authenticated
exports.incrementDownload = async (req, res) => {
  try {
    const paper = await ExamPaper.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadsCount: 1 } },
      { new: true }
    );
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Exam paper not found' });
    }
    res.status(200).json({ success: true, downloadsCount: paper.downloadsCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
