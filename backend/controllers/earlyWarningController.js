const Student = require('../models/Student');
const StudentRisk = require('../models/StudentRisk');
const Intervention = require('../models/Intervention');
const Assignment = require('../models/Assignment');
require('../models/Institution');
require('../models/Program');
require('../models/Level');
require('../models/AcademicSession');

/**
 * Core Mathematical Risk Scoring Algorithm
 * Calculates multi-factor risk score for a student document
 */
const calculateRiskForStudent = async (student) => {
  // 1. Attendance Component (35% Weight)
  const attendance = typeof student.attendance === 'number' ? student.attendance : 80;
  let attendanceRisk = 0;
  if (attendance >= 85) {
    attendanceRisk = 0;
  } else if (attendance >= 75) {
    attendanceRisk = 30; // Borderline safe
  } else if (attendance >= 65) {
    attendanceRisk = 75; // Imminent detention risk (< 75% UGC limit)
  } else {
    attendanceRisk = 100; // Severe debarment threshold
  }

  // 2. Academic Performance Component (30% Weight)
  let academicAvg = 75;
  if (student.marks && student.marks.length > 0) {
    const totalPercentage = student.marks.reduce((acc, m) => {
      const denom = m.totalMarks || 100;
      return acc + ((m.obtainedMarks || 0) / denom) * 100;
    }, 0);
    academicAvg = totalPercentage / student.marks.length;
  } else if (student.intermediatePercent || student.highSchoolPercent) {
    academicAvg = student.intermediatePercent || student.highSchoolPercent;
  }

  let academicRisk = 0;
  if (academicAvg >= 75) {
    academicRisk = 0;
  } else if (academicAvg >= 60) {
    academicRisk = 25;
  } else if (academicAvg >= 45) {
    academicRisk = 65; // High risk of course backlog
  } else {
    academicRisk = 100; // Critical failure probability
  }

  // 3. Financial / Fee Default Component (20% Weight)
  const totalFee = student.feeDetails?.totalAmount || 0;
  const paidFee = student.feeDetails?.paidAmount || 0;
  const dues = Math.max(0, totalFee - paidFee);

  let financialRisk = 0;
  let duesRatio = 0;
  if (totalFee > 0 && dues > 0) {
    duesRatio = (dues / totalFee) * 100;
    if (duesRatio <= 20) {
      financialRisk = 15;
    } else if (duesRatio <= 50) {
      financialRisk = 50;
    } else if (duesRatio <= 80) {
      financialRisk = 80;
    } else {
      financialRisk = 100;
    }
  }

  // 4. Engagement & Behavioral Risk Component (15% Weight)
  let engagementRisk = 15;
  if (attendance < 75) engagementRisk += 30;
  if (duesRatio > 50) engagementRisk += 25;
  if (student.parentalConsent?.consentStatus === 'PENDING') engagementRisk += 15;
  engagementRisk = Math.min(100, engagementRisk);

  // Weighted Composite Risk Score (0-100)
  const compositeScore = Math.round(
    (0.35 * attendanceRisk) +
    (0.30 * academicRisk) +
    (0.20 * financialRisk) +
    (0.15 * engagementRisk)
  );

  const overallRiskScore = Math.min(100, Math.max(0, compositeScore));

  // Determine Risk Tier
  let riskTier = 'LOW';
  if (overallRiskScore >= 70) {
    riskTier = 'HIGH';
  } else if (overallRiskScore >= 40) {
    riskTier = 'MODERATE';
  }

  // Explainable AI: Detect Primary Drivers
  const primaryDrivers = [];
  if (attendance < 75) {
    primaryDrivers.push(`Detention Alert: Attendance at ${attendance}% is below statutory 75% UGC exam limit`);
  }
  if (academicAvg < 50) {
    primaryDrivers.push(`Academic Backlog: Internal average at ${Math.round(academicAvg)}% threatens semester promotion`);
  }
  if (duesRatio > 50) {
    primaryDrivers.push(`Fee Default: ₹${dues.toLocaleString('en-IN')} pending balance (${Math.round(duesRatio)}% unpaid tuition)`);
  }
  if (attendanceRisk >= 75 && academicRisk >= 65) {
    primaryDrivers.push(`Severe Chronic Disengagement: Dual attendance & academic decline trajectory`);
  }
  if (primaryDrivers.length === 0) {
    primaryDrivers.push('Consistent academic progression; on-track for semester clearance');
  }

  // Prescriptive Interventions Generator
  const recommendedInterventions = [];
  if (attendance < 75) {
    recommendedInterventions.push({
      category: 'PARENT_COMMUNICATION',
      title: 'Send Urgent Parent Attendance Notice via WhatsApp',
      urgency: 'CRITICAL',
      actionSummary: `Mandatory statutory alert to guardian (${student.parentalConsent?.guardianName || student.fatherName || 'Parent'}) regarding debarment threshold.`
    });
    recommendedInterventions.push({
      category: 'ATTENDANCE_WARNING',
      title: 'Formal Attendance Undertaking & HOD Counseling',
      urgency: 'HIGH',
      actionSummary: 'Execute biometric attendance pledge and assign mentor monitoring.'
    });
  }

  if (academicRisk >= 65) {
    recommendedInterventions.push({
      category: 'REMEDIAL_COACHING',
      title: 'Enroll in Post-Class Remedial Study Vault',
      urgency: 'HIGH',
      actionSummary: 'Pair with department peer-tutor and schedule 2 weekly practice lab reviews.'
    });
  }

  if (financialRisk >= 60) {
    recommendedInterventions.push({
      category: 'FEE_RESTRUCTURING',
      title: 'Campus Treasury Emergency Installment Plan',
      urgency: 'MODERATE',
      actionSummary: `Offer 3-installment split on ₹${dues.toLocaleString('en-IN')} outstanding balance to avoid administrative dropout.`
    });
  }

  if (recommendedInterventions.length === 0) {
    recommendedInterventions.push({
      category: 'STUDENT_COUNSELING',
      title: 'Routine Academic Mentorship Check-in',
      urgency: 'LOW',
      actionSummary: 'Monthly feedback session with faculty mentor to sustain performance.'
    });
  }

  const detentionAlert = attendance < 75;
  const dropoutProbability = Math.min(95, Math.round(overallRiskScore * 0.88));

  return {
    overallRiskScore,
    riskTier,
    factorBreakdown: {
      attendanceRisk,
      academicRisk,
      financialRisk,
      engagementRisk
    },
    detentionAlert,
    dropoutProbability,
    primaryDrivers,
    recommendedInterventions,
    riskTrend: overallRiskScore >= 70 ? 'RISING' : (overallRiskScore >= 40 ? 'STABLE' : 'IMPROVING')
  };
};

/**
 * @desc    Get High-Level Executive Dashboard Metrics for Principal/Admin
 * @route   GET /api/v1/early-warning/summary
 * @access  Private/Admin
 */
const getEarlyWarningSummary = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .populate('programId', 'name')
      .populate('levelId', 'name');

    // Make sure all students have up-to-date risk records
    let highRiskCount = 0;
    let moderateRiskCount = 0;
    let lowRiskCount = 0;
    let detentionAlertCount = 0;
    let feeAtRiskCount = 0;
    let totalRiskScoreSum = 0;

    const departmentStats = {};

    for (const student of students) {
      const riskData = await calculateRiskForStudent(student);

      // Upsert into StudentRisk collection
      await StudentRisk.findOneAndUpdate(
        { student: student._id },
        {
          student: student._id,
          studentId: student.studentId,
          ...riskData,
          lastCalculatedAt: new Date(),
          $push: {
            scoreHistory: {
              $each: [{ score: riskData.overallRiskScore, tier: riskData.riskTier }],
              $slice: -10 // Keep last 10 calculations
            }
          }
        },
        { upsert: true, new: true }
      );

      totalRiskScoreSum += riskData.overallRiskScore;

      if (riskData.riskTier === 'HIGH') highRiskCount++;
      else if (riskData.riskTier === 'MODERATE') moderateRiskCount++;
      else lowRiskCount++;

      if (riskData.detentionAlert) detentionAlertCount++;
      if (riskData.factorBreakdown.financialRisk >= 60) feeAtRiskCount++;

      const deptName = student.programId?.name || student.specialization || 'B.Tech General';
      if (!departmentStats[deptName]) {
        departmentStats[deptName] = { total: 0, high: 0, moderate: 0, low: 0, totalScore: 0 };
      }
      departmentStats[deptName].total += 1;
      departmentStats[deptName].totalScore += riskData.overallRiskScore;
      if (riskData.riskTier === 'HIGH') departmentStats[deptName].high += 1;
      else if (riskData.riskTier === 'MODERATE') departmentStats[deptName].moderate += 1;
      else departmentStats[deptName].low += 1;
    }

    const totalStudents = students.length || 1;
    const averageCampusRiskScore = Math.round(totalRiskScoreSum / totalStudents);

    const pendingInterventionsCount = await Intervention.countDocuments({ status: { $in: ['PENDING', 'IN_PROGRESS'] } });
    const resolvedInterventionsCount = await Intervention.countDocuments({ status: 'RESOLVED' });

    const departmentBreakdown = Object.entries(departmentStats).map(([name, stat]) => ({
      department: name,
      totalStudents: stat.total,
      highRisk: stat.high,
      moderateRisk: stat.moderate,
      lowRisk: stat.low,
      averageRiskScore: Math.round(stat.totalScore / stat.total)
    })).sort((a, b) => b.averageRiskScore - a.averageRiskScore);

    res.json({
      success: true,
      data: {
        totalStudents: students.length,
        highRiskCount,
        moderateRiskCount,
        lowRiskCount,
        detentionAlertCount,
        feeAtRiskCount,
        averageCampusRiskScore,
        pendingInterventionsCount,
        resolvedInterventionsCount,
        riskDistribution: [
          { tier: 'HIGH', label: 'Critical Risk', count: highRiskCount, color: '#EF4444' },
          { tier: 'MODERATE', label: 'Watchlist', count: moderateRiskCount, color: '#F59E0B' },
          { tier: 'LOW', label: 'Safe / On-Track', count: lowRiskCount, color: '#10B981' }
        ],
        departmentBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching early warning summary:', error);
    res.status(500).json({ success: false, message: 'Server Error in early warning engine' });
  }
};

/**
 * @desc    Get Paginated / Filtered List of Students with Risk Metrics
 * @route   GET /api/v1/early-warning/students
 * @access  Private/Admin
 */
const getAtRiskStudents = async (req, res) => {
  try {
    const { tier, department, search, sort = 'riskScore_desc', page = 1, limit = 20 } = req.query;

    const filter = {};
    if (tier && tier !== 'ALL') {
      filter.riskTier = tier.toUpperCase();
    }

    let studentRisks = await StudentRisk.find(filter)
      .populate({
        path: 'student',
        populate: [
          { path: 'programId', select: 'name code' },
          { path: 'levelId', select: 'name' }
        ]
      })
      .sort(sort === 'riskScore_asc' ? { overallRiskScore: 1 } : { overallRiskScore: -1 });

    // Client-side filtering by student name/id or department if requested
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      studentRisks = studentRisks.filter(sr => 
        sr.student?.name?.toLowerCase().includes(q) || 
        sr.studentId?.toLowerCase().includes(q) ||
        sr.student?.email?.toLowerCase().includes(q)
      );
    }

    if (department && department !== 'ALL') {
      studentRisks = studentRisks.filter(sr => {
        const d = sr.student?.programId?.name || sr.student?.specialization;
        return d && d.toLowerCase().includes(department.toLowerCase());
      });
    }

    // Attach active interventions count
    const studentIds = studentRisks.map(sr => sr.studentId);
    const activeInterventions = await Intervention.find({
      studentId: { $in: studentIds },
      status: { $in: ['PENDING', 'IN_PROGRESS'] }
    });

    const activeInterventionsMap = {};
    activeInterventions.forEach(item => {
      activeInterventionsMap[item.studentId] = (activeInterventionsMap[item.studentId] || 0) + 1;
    });

    const totalResults = studentRisks.length;
    const startIndex = (page - 1) * limit;
    const paginatedRisks = studentRisks.slice(startIndex, startIndex + Number(limit)).map(sr => {
      const srObj = sr.toObject();
      srObj.activeInterventionsCount = activeInterventionsMap[sr.studentId] || 0;
      return srObj;
    });

    res.json({
      success: true,
      total: totalResults,
      page: Number(page),
      pages: Math.ceil(totalResults / limit),
      data: paginatedRisks
    });
  } catch (error) {
    console.error('Error fetching at-risk students:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching at-risk students' });
  }
};

/**
 * @desc    Get Detailed Diagnostic File for a Single Student
 * @route   GET /api/v1/early-warning/students/:id
 * @access  Private/Admin
 */
const getStudentRiskDiagnosis = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('programId', 'name')
      .populate('levelId', 'name')
      .populate('institutionId', 'name');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    let studentRisk = await StudentRisk.findOne({ student: student._id });
    if (!studentRisk) {
      const computed = await calculateRiskForStudent(student);
      studentRisk = await StudentRisk.create({
        student: student._id,
        studentId: student.studentId,
        ...computed
      });
    }

    const interventions = await Intervention.find({ studentId: student.studentId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        student,
        risk: studentRisk,
        interventions
      }
    });
  } catch (error) {
    console.error('Error fetching student diagnosis:', error);
    res.status(500).json({ success: false, message: 'Server Error fetching student risk diagnosis' });
  }
};

/**
 * @desc    Create a New Intervention Record for a Student
 * @route   POST /api/v1/early-warning/interventions
 * @access  Private/Admin
 */
const createIntervention = async (req, res) => {
  try {
    const { studentId, title, category, channel, urgency, assignedTo, notes } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found for studentId: ' + studentId });
    }

    const intervention = await Intervention.create({
      student: student._id,
      studentId,
      title: title || 'Academic Intervention Action',
      category: category || 'STUDENT_COUNSELING',
      channel: channel || 'WHATSAPP',
      urgency: urgency || 'HIGH',
      assignedTo: assignedTo || 'Mentor / Academic Advisor',
      createdBy: req.user?.username || 'Principal Desk',
      notes: notes || '',
      status: 'PENDING'
    });

    res.status(201).json({
      success: true,
      message: 'Intervention successfully registered and assigned',
      data: intervention
    });
  } catch (error) {
    console.error('Error creating intervention:', error);
    res.status(500).json({ success: false, message: 'Server Error creating intervention' });
  }
};

/**
 * @desc    Update Intervention Status (Mark in-progress or resolved)
 * @route   PATCH /api/v1/early-warning/interventions/:id
 * @access  Private/Admin
 */
const updateInterventionStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    if (status === 'RESOLVED') updateData.resolvedAt = new Date();

    const intervention = await Intervention.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!intervention) {
      return res.status(404).json({ success: false, message: 'Intervention not found' });
    }

    res.json({
      success: true,
      message: 'Intervention status updated successfully',
      data: intervention
    });
  } catch (error) {
    console.error('Error updating intervention:', error);
    res.status(500).json({ success: false, message: 'Server Error updating intervention' });
  }
};

/**
 * @desc    Batch Recalculate Risk Scores for All Students
 * @route   POST /api/v1/early-warning/recalculate
 * @access  Private/Admin
 */
const recalculateRiskScores = async (req, res) => {
  try {
    const students = await Student.find({ isActive: true });
    let updatedCount = 0;

    for (const student of students) {
      const riskData = await calculateRiskForStudent(student);
      await StudentRisk.findOneAndUpdate(
        { student: student._id },
        {
          student: student._id,
          studentId: student.studentId,
          ...riskData,
          lastCalculatedAt: new Date()
        },
        { upsert: true }
      );
      updatedCount++;
    }

    res.json({
      success: true,
      message: `Successfully refreshed AI Early-Warning risk scores for ${updatedCount} students.`,
      updatedCount
    });
  } catch (error) {
    console.error('Error recalculating scores:', error);
    res.status(500).json({ success: false, message: 'Server Error recalculating risk scores' });
  }
};

module.exports = {
  getEarlyWarningSummary,
  getAtRiskStudents,
  getStudentRiskDiagnosis,
  createIntervention,
  updateInterventionStatus,
  recalculateRiskScores
};
