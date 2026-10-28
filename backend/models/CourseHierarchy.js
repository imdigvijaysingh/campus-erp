const mongoose = require('mongoose');

const subjectItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    trim: true,
    default: ''
  },
  creditPoints: {
    type: Number,
    default: 4,
    min: 1,
    max: 12
  },
  creditHours: {
    theory: { type: Number, default: 3 },
    tutorial: { type: Number, default: 1 },
    practical: { type: Number, default: 0 }
  },
  courseType: {
    type: String,
    enum: ['Major', 'Minor', 'Multidisciplinary', 'AEC', 'SEC', 'VAC'],
    default: 'Major'
  },
  ncrfLevel: {
    type: String,
    default: 'Level 5.5'
  },
  learningOutcomes: [{
    type: String,
    trim: true
  }]
}, { _id: true });

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  subjects: [subjectItemSchema]
}, { _id: true });

const semesterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sections: [sectionSchema],
  subjects: [subjectItemSchema]
}, { _id: true });

const yearSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  semesters: [semesterSchema],
  subjects: [subjectItemSchema]
}, { _id: true });

const sessionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  durationYears: { type: Number, default: 4 },
  totalSemesters: { type: Number, default: 8 },
  years: [yearSchema],
  semesters: [semesterSchema],
  subjects: [subjectItemSchema]
}, { _id: true });

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sessions: [sessionSchema]
}, { _id: true });

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true, default: '' },
  durationYears: { type: Number, default: 4 },
  totalSemesters: { type: Number, default: 8 },
  ncrfLevel: {
    type: String,
    enum: [
      'Level 4.0 (Higher Secondary)',
      'Level 4.5 (UG Certificate)',
      'Level 5.0 (UG Diploma)',
      'Level 5.5 (Bachelor Degree 3-Yr)',
      'Level 6.0 (Bachelor Hons/Research 4-Yr)',
      'Level 6.5 (PG Diploma)',
      'Level 7.0 (Master Degree)',
      'Level 8.0 (Doctoral Degree)'
    ],
    default: 'Level 5.5 (Bachelor Degree 3-Yr)'
  },
  totalCreditsRequired: {
    type: Number,
    default: 120
  },
  branches: [branchSchema]
}, { _id: true });

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a department name'],
    trim: true
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution'
  },
  code: {
    type: String,
    trim: true,
    default: ''
  },
  courses: [courseSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('CourseHierarchy', departmentSchema);
