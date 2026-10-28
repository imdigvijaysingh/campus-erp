const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const ExamPaper = require('./models/ExamPaper');
const Institution = require('./models/Institution');

const samplePapers = [
  // ===================== COLLEGE: B.Tech CSE Semester 5 =====================
  {
    category: 'college',
    institutionType: 'college',
    title: 'Operating Systems & System Programming - End-Semester Exam Paper 2024',
    paperType: 'Previous Year Exam Paper',
    examTerm: 'End-Semester',
    academicYear: '2024-25',
    department: 'Engineering & Technology',
    course: 'B.Tech Computer Science & Engineering',
    semester: '5th Sem',
    subject: 'Operating Systems',
    subjectCode: 'CS502',
    maxMarks: 100,
    durationMinutes: 180,
    fileSize: '1.4 MB',
    downloadsCount: 142,
    uploadedBy: 'Prof. Arvind K. (Exam Cell)',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    category: 'college',
    institutionType: 'college',
    title: 'Database Management Systems - End-Semester Exam Paper 2024',
    paperType: 'Previous Year Exam Paper',
    examTerm: 'End-Semester',
    academicYear: '2024-25',
    department: 'Engineering & Technology',
    course: 'B.Tech Computer Science & Engineering',
    semester: '5th Sem',
    subject: 'Database Management Systems',
    subjectCode: 'CS501',
    maxMarks: 100,
    durationMinutes: 180,
    fileSize: '1.8 MB',
    downloadsCount: 189,
    uploadedBy: 'Exam Cell / Faculty',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    category: 'college',
    institutionType: 'college',
    title: 'Computer Networks & Network Security - Official Model Sample Paper 2025-26',
    paperType: 'Sample / Model Paper',
    examTerm: 'Model Practice',
    academicYear: '2025-26',
    department: 'Engineering & Technology',
    course: 'B.Tech Computer Science & Engineering',
    semester: '5th Sem',
    subject: 'Computer Networks',
    subjectCode: 'CS503',
    maxMarks: 100,
    durationMinutes: 180,
    fileSize: '2.1 MB',
    downloadsCount: 215,
    uploadedBy: 'Dept of Computer Science',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    category: 'college',
    institutionType: 'college',
    title: 'Operating Systems - Mid-Term Sessional Examination Paper 2024',
    paperType: 'Mid-Term Paper',
    examTerm: 'Mid-Term / Sessional',
    academicYear: '2024-25',
    department: 'Engineering & Technology',
    course: 'B.Tech Computer Science & Engineering',
    semester: '5th Sem',
    subject: 'Operating Systems',
    subjectCode: 'CS502',
    maxMarks: 50,
    durationMinutes: 90,
    fileSize: '890 KB',
    downloadsCount: 98,
    uploadedBy: 'Academic Exam Committee',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf']
  },

  // ===================== COLLEGE: B.Tech CSE Semester 3 =====================
  {
    category: 'college',
    institutionType: 'college',
    title: 'Data Structures & Algorithms - End-Semester Exam Paper 2024',
    paperType: 'Previous Year Exam Paper',
    examTerm: 'End-Semester',
    academicYear: '2024-25',
    department: 'Engineering & Technology',
    course: 'B.Tech Computer Science & Engineering',
    semester: '3rd Sem',
    subject: 'Data Structures & Algorithms',
    subjectCode: 'CS301',
    maxMarks: 100,
    durationMinutes: 180,
    fileSize: '2.3 MB',
    downloadsCount: 310,
    uploadedBy: 'Exam Cell / Faculty',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    category: 'college',
    institutionType: 'college',
    title: 'Discrete Mathematics & Graph Theory - End-Semester Exam Paper 2023',
    paperType: 'Previous Year Exam Paper',
    examTerm: 'End-Semester',
    academicYear: '2023-24',
    department: 'Engineering & Technology',
    course: 'B.Tech Computer Science & Engineering',
    semester: '3rd Sem',
    subject: 'Discrete Mathematics',
    subjectCode: 'MATH301',
    maxMarks: 100,
    durationMinutes: 180,
    fileSize: '1.2 MB',
    downloadsCount: 164,
    uploadedBy: 'Dept of Mathematics',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf']
  },
  {
    category: 'college',
    institutionType: 'college',
    title: 'Object Oriented Programming with Java - Sample Model Paper 2025',
    paperType: 'Sample / Model Paper',
    examTerm: 'Model Practice',
    academicYear: '2025-26',
    department: 'Engineering & Technology',
    course: 'B.Tech Computer Science & Engineering',
    semester: '3rd Sem',
    subject: 'Object Oriented Programming',
    subjectCode: 'CS302',
    maxMarks: 100,
    durationMinutes: 180,
    fileSize: '1.6 MB',
    downloadsCount: 178,
    uploadedBy: 'Prof. Sharma (CSE Faculty)',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },

  // ===================== COLLEGE: B.Tech CSE Semester 1 =====================
  {
    category: 'college',
    institutionType: 'college',
    title: 'Engineering Mathematics - I (Calculus & Linear Algebra) - End-Sem 2024',
    paperType: 'Previous Year Exam Paper',
    examTerm: 'End-Semester',
    academicYear: '2024-25',
    department: 'Applied Sciences',
    course: 'B.Tech Computer Science & Engineering',
    semester: '1st Sem',
    subject: 'Engineering Mathematics - I',
    subjectCode: 'MATH101',
    maxMarks: 100,
    durationMinutes: 180,
    fileSize: '1.7 MB',
    downloadsCount: 245,
    uploadedBy: 'Controller of Examinations',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    category: 'college',
    institutionType: 'college',
    title: 'Programming for Problem Solving (C / Python) - Sample Practice Paper 2025',
    paperType: 'Sample / Model Paper',
    examTerm: 'Model Practice',
    academicYear: '2025-26',
    department: 'Engineering & Technology',
    course: 'B.Tech Computer Science & Engineering',
    semester: '1st Sem',
    subject: 'Programming Fundamentals',
    subjectCode: 'CS101',
    maxMarks: 100,
    durationMinutes: 180,
    fileSize: '1.3 MB',
    downloadsCount: 192,
    uploadedBy: 'Dept of Computer Science',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf']
  },

  // ===================== COLLEGE: BBA Semester 2 =====================
  {
    category: 'college',
    institutionType: 'college',
    title: 'Principles of Marketing - End-Semester Exam Paper 2024',
    paperType: 'Previous Year Exam Paper',
    examTerm: 'End-Semester',
    academicYear: '2024-25',
    department: 'Management Studies',
    course: 'Bachelor of Business Administration (BBA)',
    semester: '2nd Sem',
    subject: 'Principles of Marketing',
    subjectCode: 'BBA201',
    maxMarks: 100,
    durationMinutes: 180,
    fileSize: '1.1 MB',
    downloadsCount: 130,
    uploadedBy: 'School of Management',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf']
  },
  {
    category: 'college',
    institutionType: 'college',
    title: 'Financial Accounting & Reporting - Model Test Paper with Balance Sheet Solutions',
    paperType: 'Sample / Model Paper',
    examTerm: 'Model Practice',
    academicYear: '2025-26',
    department: 'Management Studies',
    course: 'Bachelor of Business Administration (BBA)',
    semester: '2nd Sem',
    subject: 'Financial Accounting',
    subjectCode: 'BBA202',
    maxMarks: 100,
    durationMinutes: 180,
    fileSize: '1.9 MB',
    downloadsCount: 210,
    uploadedBy: 'School of Management',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },

  // ===================== SCHOOL: Class 10 (Secondary) =====================
  {
    category: 'school',
    institutionType: 'school',
    title: 'Class 10 CBSE Board - Mathematics Standard Official Board Paper 2024',
    paperType: 'Previous Year Exam Paper',
    examTerm: 'Annual Final',
    academicYear: '2024-25',
    targetClass: 'Class 10',
    stream: 'General',
    subject: 'Mathematics Standard',
    subjectCode: 'MATH-041',
    maxMarks: 80,
    durationMinutes: 180,
    fileSize: '2.4 MB',
    downloadsCount: 420,
    uploadedBy: 'Central Board Coordination Cell',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    category: 'school',
    institutionType: 'school',
    title: 'Class 10 CBSE - Mathematics Standard Official Sample Question Paper 2025-26',
    paperType: 'Sample / Model Paper',
    examTerm: 'Model Practice',
    academicYear: '2025-26',
    targetClass: 'Class 10',
    stream: 'General',
    subject: 'Mathematics Standard',
    subjectCode: 'MATH-041',
    maxMarks: 80,
    durationMinutes: 180,
    fileSize: '1.8 MB',
    downloadsCount: 388,
    uploadedBy: 'Academic Department',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    category: 'school',
    institutionType: 'school',
    title: 'Class 10 CBSE Board - Science (Physics, Chemistry & Biology) Board Paper 2024',
    paperType: 'Previous Year Exam Paper',
    examTerm: 'Annual Final',
    academicYear: '2024-25',
    targetClass: 'Class 10',
    stream: 'General',
    subject: 'Science',
    subjectCode: 'SCI-086',
    maxMarks: 80,
    durationMinutes: 180,
    fileSize: '2.1 MB',
    downloadsCount: 350,
    uploadedBy: 'Science Faculty Panel',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    category: 'school',
    institutionType: 'school',
    title: 'Class 10 CBSE - Social Science (History, Civics, Geography) Pre-Board Paper',
    paperType: 'Pre-Board Exam Paper',
    examTerm: 'Pre-Board',
    academicYear: '2024-25',
    targetClass: 'Class 10',
    stream: 'General',
    subject: 'Social Science',
    subjectCode: 'SST-087',
    maxMarks: 80,
    durationMinutes: 180,
    fileSize: '1.5 MB',
    downloadsCount: 220,
    uploadedBy: 'School Examination Committee',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf']
  },

  // ===================== SCHOOL: Class 12 Science Stream =====================
  {
    category: 'school',
    institutionType: 'school',
    title: 'Class 12 CBSE Board - Physics Theory Board Examination Paper 2024',
    paperType: 'Previous Year Exam Paper',
    examTerm: 'Annual Final',
    academicYear: '2024-25',
    targetClass: 'Class 12',
    stream: 'Science (PCM/PCB)',
    subject: 'Physics',
    subjectCode: 'PHY-042',
    maxMarks: 70,
    durationMinutes: 180,
    fileSize: '2.8 MB',
    downloadsCount: 512,
    uploadedBy: 'Senior Secondary Exam Board',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    category: 'school',
    institutionType: 'school',
    title: 'Class 12 CBSE - Chemistry Official Model Sample Paper 2025-26 with Mechanisms',
    paperType: 'Sample / Model Paper',
    examTerm: 'Model Practice',
    academicYear: '2025-26',
    targetClass: 'Class 12',
    stream: 'Science (PCM/PCB)',
    subject: 'Chemistry',
    subjectCode: 'CHEM-043',
    maxMarks: 70,
    durationMinutes: 180,
    fileSize: '2.2 MB',
    downloadsCount: 390,
    uploadedBy: 'Dept of Chemistry',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    category: 'school',
    institutionType: 'school',
    title: 'Class 12 CBSE - Mathematics Pre-Board Simulated Examination 2024-25',
    paperType: 'Pre-Board Exam Paper',
    examTerm: 'Pre-Board',
    academicYear: '2024-25',
    targetClass: 'Class 12',
    stream: 'Science (PCM)',
    subject: 'Mathematics',
    subjectCode: 'MATH-041',
    maxMarks: 80,
    durationMinutes: 180,
    fileSize: '1.9 MB',
    downloadsCount: 310,
    uploadedBy: 'Mathematics HOD',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },

  // ===================== SCHOOL: Class 12 Commerce Stream =====================
  {
    category: 'school',
    institutionType: 'school',
    title: 'Class 12 CBSE Board - Accountancy Official Board Question Paper 2024',
    paperType: 'Previous Year Exam Paper',
    examTerm: 'Annual Final',
    academicYear: '2024-25',
    targetClass: 'Class 12',
    stream: 'Commerce',
    subject: 'Accountancy',
    subjectCode: 'ACC-055',
    maxMarks: 80,
    durationMinutes: 180,
    fileSize: '2.5 MB',
    downloadsCount: 295,
    uploadedBy: 'Commerce Department',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'],
    solutionUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    category: 'school',
    institutionType: 'school',
    title: 'Class 12 CBSE - Business Studies Official Sample Practice Paper 2025-26',
    paperType: 'Sample / Model Paper',
    examTerm: 'Model Practice',
    academicYear: '2025-26',
    targetClass: 'Class 12',
    stream: 'Commerce',
    subject: 'Business Studies',
    subjectCode: 'BST-054',
    maxMarks: 80,
    durationMinutes: 180,
    fileSize: '1.7 MB',
    downloadsCount: 240,
    uploadedBy: 'Commerce Faculty Panel',
    pdfUrls: ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf']
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Exam Papers seeding...');

    // Fetch primary institution if available
    const inst = await Institution.findOne();
    const instId = inst ? inst._id : null;

    // Remove old demo papers
    await ExamPaper.deleteMany({});
    console.log('Cleared existing exam papers.');

    // Attach institutionId
    const papersToInsert = samplePapers.map(p => ({
      ...p,
      institutionId: instId
    }));

    const inserted = await ExamPaper.insertMany(papersToInsert);
    console.log(`Successfully seeded ${inserted.length} question papers & sample papers!`);
    console.log(`- College Papers: ${inserted.filter(p => p.category === 'college').length}`);
    console.log(`- School Papers: ${inserted.filter(p => p.category === 'school').length}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding exam papers:', err);
    process.exit(1);
  }
};

seedData();
