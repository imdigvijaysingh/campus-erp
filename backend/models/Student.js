const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const markSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true,
    default: 100
  },
  obtainedMarks: {
    type: Number,
    required: true,
    default: 0
  }
});

const attendanceRecordSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  month: {
    type: String, // e.g., 'August 2026'
    required: true
  },
  totalClasses: {
    type: Number,
    required: true,
    default: 0
  },
  attendedClasses: {
    type: Number,
    required: true,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  }
});

// Note: Class schema is replaced by the generic academic structure. 
// Academic history will be maintained by linking Student to Enrollment models (to be created later) or directly maintaining references.
// For now, we will add the core references.

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    trim: true
  },
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: false
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  },
  password: {
    type: String,
    required: true,
    select: false // Don't return password by default
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    sparse: true,
    unique: true
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String
  },
  fatherName: { type: String, default: '' },
  motherName: { type: String, default: '' },
  dob: { type: Date },
  college: { type: String, default: 'Quantum School of Technology' },
  specialization: { type: String, default: '' },
  classRollNo: { type: String, default: '' },
  enrollmentNo: { type: String, default: '' },
  universityRollNo: { type: String, default: '' },
  highSchoolPercent: { type: Number },
  intermediatePercent: { type: Number },
  photo: {
    type: String // URL or path to photo
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicSession'
  },
  programId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program'
  },
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level'
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  currentClass: {
    department: { type: String, default: '' },
    course: { type: String, default: '' },
    branch: { type: String, default: '' },
    session: { type: String, default: '' },
    semester: { type: String, default: '1st Semester' },
    section: { type: String, default: '' },
    marks: [markSchema]
  },
  semesters: [{
    department: { type: String, default: '' },
    course: { type: String, default: '' },
    branch: { type: String, default: '' },
    session: { type: String, default: '' },
    semester: { type: String, default: '' },
    section: { type: String, default: '' },
    marks: [markSchema]
  }],
  admitCardUrl: {
    type: String // URL or path to admit card PDF
  },
  feeDetails: {
    totalAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    lastPaymentDate: { type: Date },
    lastPaymentAmount: { type: Number, default: 0 }
  },
  attendance: {
    type: Number,
    default: 0 // Percentage
  },
  attendanceRecords: [attendanceRecordSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  // NCrF & Academic Bank of Credits (ABC)
  apaarId: {
    type: String,
    trim: true,
    default: ''
  },
  abcAccountId: {
    type: String,
    trim: true,
    default: ''
  },
  digilockerVerified: {
    type: Boolean,
    default: false
  },
  ncrfCredits: {
    earnedCredits: { type: Number, default: 0 },
    transferredCredits: { type: Number, default: 0 },
    ncrfLevel: { type: String, default: 'Level 5.5' },
    abcLastSynced: { type: Date }
  },
  // DPDP 2023 / 2025 Child Safety Mode (< 18)
  isMinor: {
    type: Boolean,
    default: false
  },
  parentalConsent: {
    guardianName: { type: String, default: '' },
    guardianRelation: { type: String, default: 'Guardian' },
    guardianEmail: { type: String, default: '' },
    guardianPhone: { type: String, default: '' },
    consentStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'EXEMPT_ADULT', 'REVOKED'],
      default: 'EXEMPT_ADULT'
    },
    consentVerifiedAt: { type: Date },
    verificationMethod: { type: String, default: '' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for secure masked APAAR ID (•••• •••• 1234)
studentSchema.virtual('maskedApaarId').get(function () {
  if (!this.apaarId) return null;
  const clean = this.apaarId.replace(/\D/g, '');
  if (clean.length < 4) return '•••• ' + clean;
  return '•••• •••• ' + clean.slice(-4);
});

// Hash password and calculate minor status before saving
studentSchema.pre('save', async function () {
  // DOB age check for DPDP Child Safety Mode
  if (this.dob) {
    const ageDiffMs = Date.now() - new Date(this.dob).getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    this.isMinor = age < 18;
    if (this.isMinor) {
      if (!this.parentalConsent) this.parentalConsent = {};
      if (!this.parentalConsent.consentStatus || this.parentalConsent.consentStatus === 'EXEMPT_ADULT') {
        this.parentalConsent.consentStatus = 'PENDING';
      }
    } else {
      if (!this.parentalConsent || !this.parentalConsent.consentStatus) {
        this.parentalConsent = { ...(this.parentalConsent || {}), consentStatus: 'EXEMPT_ADULT' };
      }
    }
  }

  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// High-performance compound indexes for scaling to 100k+ students
studentSchema.index({ studentId: 1 }, { unique: true });
studentSchema.index({ email: 1 });
studentSchema.index({ institutionId: 1, isActive: 1 });
studentSchema.index({ institutionId: 1, session: 1, semester: 1 });
studentSchema.index({ 'currentClass.session': 1, 'currentClass.semester': 1 });
studentSchema.index({ 'currentClass.department': 1, 'currentClass.course': 1, 'currentClass.branch': 1 });
studentSchema.index({ apaarId: 1 });

module.exports = mongoose.model('Student', studentSchema);
