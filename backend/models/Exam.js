const mongoose = require('mongoose');

// Individual Subject Schedule in an Exam Timetable
const ExamSubjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  credits: {
    type: Number,
    default: 4,
    min: 1
  },
  examDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    default: '10:00 AM - 01:00 PM'
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  roomNumber: {
    type: String,
    default: 'Examination Hall 1'
  },
  courseOutcomes: [{
    type: String
  }]
}, { _id: true });

// Master Exam Schedule Model
const ExamScheduleSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: false
  },
  examTitle: {
    type: String,
    required: true,
    trim: true
  },
  examType: {
    type: String,
    enum: ['End-Semester', 'Mid-Term', 'Unit Assessment', 'Practical / Lab Viva', 'Backlog / Supplementary'],
    default: 'End-Semester'
  },
  academicSession: {
    type: String,
    required: true,
    default: '2026-27'
  },
  department: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    default: 'Core'
  },
  semester: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'In-Progress', 'Completed', 'Results Published'],
    default: 'Published'
  },
  subjects: [ExamSubjectSchema],
  instructions: [{
    type: String
  }],
  createdBy: {
    type: String,
    default: 'Controller of Examinations'
  }
}, {
  timestamps: true
});

// Subject Score with OBE Attainment
const SubjectScoreSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  credits: {
    type: Number,
    default: 4
  },
  courseCategory: {
    type: String,
    enum: ['Major', 'Minor', 'Multidisciplinary', 'AEC', 'SEC', 'VAC', 'Core'],
    default: 'Major'
  },
  internalMarks: {
    type: Number,
    default: 0,
    min: 0
  },
  theoryMarks: {
    type: Number,
    default: 0,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  letterGrade: {
    type: String,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F', 'AB'],
    default: 'P'
  },
  gradePoint: {
    type: Number,
    default: 4,
    min: 0,
    max: 10
  },
  creditPointsEarned: {
    type: Number,
    default: 0
  },
  outcomeAttainment: [{
    outcome: String,
    scorePercent: Number
  }]
}, { _id: true });

// Student Assessment / Marksheet Record
const StudentAssessmentSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: false
  },
  studentId: {
    type: String,
    required: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  examScheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamSchedule',
    required: false
  },
  examTitle: {
    type: String,
    default: 'End-Semester Examination'
  },
  academicSession: {
    type: String,
    default: '2026-27'
  },
  department: {
    type: String,
    default: ''
  },
  course: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  subjectScores: [SubjectScoreSchema],
  totalCredits: {
    type: Number,
    default: 0
  },
  earnedCredits: {
    type: Number,
    default: 0
  },
  totalMarksObtained: {
    type: Number,
    default: 0
  },
  grandMaxMarks: {
    type: Number,
    default: 0
  },
  sgpa: {
    type: Number,
    default: 0
  },
  cgpa: {
    type: Number,
    default: 0
  },
  resultStatus: {
    type: String,
    enum: ['PASS', 'PROMOTED', 'SUPPLEMENTARY', 'FAIL', 'WITHHELD'],
    default: 'PASS'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedDate: {
    type: Date,
    default: Date.now
  },
  evaluatorRemarks: {
    type: String,
    default: 'Qualifies under UGC CBCS / NCrF regulations.'
  }
}, {
  timestamps: true
});

StudentAssessmentSchema.index({ studentId: 1, semester: 1 });
ExamScheduleSchema.index({ department: 1, course: 1, semester: 1 });

const ExamSchedule = mongoose.model('ExamSchedule', ExamScheduleSchema);
const StudentAssessment = mongoose.model('StudentAssessment', StudentAssessmentSchema);

module.exports = {
  ExamSchedule,
  StudentAssessment
};
