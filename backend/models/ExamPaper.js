const mongoose = require('mongoose');

const ExamPaperSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: false
  },
  category: {
    type: String,
    enum: ['college', 'school'],
    default: 'college'
  },
  institutionType: {
    type: String,
    enum: ['college', 'university', 'school', 'tuition_center'],
    default: 'college'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  paperType: {
    type: String,
    enum: ['Previous Year Exam Paper', 'Sample / Model Paper', 'Pre-Board Exam Paper', 'Mid-Term Paper', 'Unit Test'],
    default: 'Previous Year Exam Paper'
  },
  examTerm: {
    type: String,
    enum: ['End-Semester', 'Mid-Term / Sessional', 'Pre-Board', 'Annual Final', 'Unit Test', 'Model Practice'],
    default: 'End-Semester'
  },
  academicYear: {
    type: String, // e.g., '2025-26', '2024-25', '2023-24'
    required: true,
    default: '2024-25'
  },
  // College-specific fields
  department: {
    type: String, // e.g., 'Engineering & Technology', 'Management Studies', 'Applied Sciences'
    default: 'General'
  },
  course: {
    type: String, // e.g., 'B.Tech CSE', 'BBA', 'BCA', 'MBA'
    default: ''
  },
  semester: {
    type: String, // e.g., '1st Sem', '2nd Sem', '5th Sem'
    default: ''
  },
  // School-specific fields
  targetClass: {
    type: String, // e.g., 'Class 9', 'Class 10', 'Class 11', 'Class 12'
    default: ''
  },
  stream: {
    type: String, // e.g., 'Science (PCM)', 'Commerce', 'Humanities', 'General'
    default: 'General'
  },
  // Subject metadata
  subject: {
    type: String,
    required: true,
    trim: true
  },
  subjectCode: {
    type: String,
    trim: true,
    default: ''
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  durationMinutes: {
    type: Number,
    default: 180
  },
  pdfUrls: [{
    type: String, // URLs to exam paper PDF
  }],
  solutionUrl: {
    type: String, // URL to answer key / solution / marking scheme
    default: ''
  },
  fileSize: {
    type: String,
    default: '1.5 MB'
  },
  uploadedBy: {
    type: String,
    default: 'Exam Cell / Faculty'
  },
  downloadsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// High-performance compound indexes for fast search and filtering
ExamPaperSchema.index({ category: 1, course: 1, semester: 1 });
ExamPaperSchema.index({ category: 1, targetClass: 1 });
ExamPaperSchema.index({ paperType: 1, academicYear: -1 });
ExamPaperSchema.index({ subject: 1, subjectCode: 1 });

module.exports = mongoose.model('ExamPaper', ExamPaperSchema);
