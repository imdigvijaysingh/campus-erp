import BtechCS from "../assets/courses_images/courses/undergraduate/btech/computer_science.webp";
import BtechCivil from "../assets/courses_images/courses/undergraduate/btech/civil.webp";
import BtechElectrical from "../assets/courses_images/courses/undergraduate/btech/electrical.webp";
import BtechEC from "../assets/courses_images/courses/undergraduate/btech/electronics_and_comm.webp";
import BtechMechanicalCourse from "../assets/courses_images/courses/undergraduate/btech/mechanical_course.webp";

import BcaImg from "../assets/courses_images/courses/undergraduate/bca/bca.webp";
import McaImg from "../assets/courses_images/courses/postgraduate/mca.webp";

import DiplomaCivil from "../assets/courses_images/courses/diploma/civil/civil.webp";
import DiplomaElectricalElectronics from "../assets/courses_images/courses/diploma/electrical_electronics/electrical_electronics.webp";
import DiplomaMechAutomobile from "../assets/courses_images/courses/diploma/mechanical/automobile.webp";
import DiplomaMechProduction from "../assets/courses_images/courses/diploma/mechanical/production.webp";
import DiplomaCS from "../assets/courses_images/courses/diploma/cs/cs.webp";

import BbaImg from "../assets/courses_images/courses/undergraduate/bba/bba.webp";
import MbaImg from "../assets/courses_images/courses/postgraduate/mba.webp";
import BcomImg from "../assets/courses_images/courses/undergraduate/bcom/bcom.png";

import DpharmImg from "../assets/courses_images/courses/diploma/pharmacy/dpharm.webp";
import BpharmImg from "../assets/courses_images/courses/undergraduate/pharmacy/bpharm.webp";

export const engineeringCourses = [
  {
    id: 1,
    slug: "btech-cse",
    title: "B.Tech - Computer Science & Engineering",
    duration: "4 Years",
    image: BtechCS,
    description: "Comprehensive program covering programming, algorithms, databases, and software engineering.",
    aboutDescription: "The B.Tech in <strong>Computer Science and Engineering</strong> at Shyvora is a comprehensive, <strong>industry-driven program</strong> designed to transform students into elite tech professionals. This intensive four-year curriculum goes far beyond the basics, diving deep into <strong>advanced programming</strong>, complex <strong>algorithm design</strong>, distributed databases, and robust <strong>software engineering principles</strong>. Students will gain unparalleled hands-on experience mastering the latest technologies, ranging from fundamental data structures to cutting-edge <strong>artificial intelligence</strong>, <strong>machine learning</strong>, and <strong>cloud computing ecosystems</strong>. Through our unique blend of rigorous theoretical foundations, collaborative project-based learning, and state-of-the-art laboratory sessions, graduates are thoroughly equipped with the critical thinking and practical skills necessary to solve complex problems and thrive in the fast-paced global technology industry.",
    features: [
      "Data Structures & Algorithms",
      "Artificial Intelligence & ML",
      "Cloud Computing",
      "Live Software Projects"
    ],
    eligibility: "10+2 with Physics, Mathematics, and Chemistry/Computer Science with a minimum of 45% aggregate (40% for reserved categories).",
    approach: "Our teaching methodology focuses heavily on practical coding, lab sessions, and project-based learning. Students are encouraged to participate in hackathons and open-source contributions from their first year.",
    documentsRequired: ["10th Marksheet & Certificate", "12th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Engineering Mathematics", "Engineering Physics", "Basic Electrical Engineering", "Programming for Problem Solving"] },
      { year: "Year 2", subjects: ["Data Structures", "Computer Organization & Architecture", "Object Oriented Programming", "Discrete Mathematics"] },
      { year: "Year 3", subjects: ["Database Management Systems", "Operating Systems", "Design & Analysis of Algorithms", "Computer Networks"] },
      { year: "Year 4", subjects: ["Artificial Intelligence", "Cloud Computing", "Major Project", "Industrial Training"] }
    ]
  },
  {
    id: 2,
    slug: "btech-civil",
    title: "B.Tech - Civil Engineering",
    duration: "4 Years",
    image: BtechCivil,
    description: "Comprehensive program covering structural design, construction management, and environmental engineering.",
    features: ["Structural Analysis & Design", "Construction Technology", "Environmental Engineering", "Geotechnical Engineering"],
    eligibility: "10+2 with Physics, Mathematics, and Chemistry with a minimum of 45% aggregate (40% for reserved categories).",
    approach: "We emphasize field visits, surveying camps, and hands-on software training (AutoCAD, STAAD Pro). Real-world case studies form the core of the advanced semesters.",
    documentsRequired: ["10th Marksheet & Certificate", "12th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Engineering Mathematics", "Engineering Physics", "Basic Mechanical Engineering", "Engineering Graphics"] },
      { year: "Year 2", subjects: ["Mechanics of Solids", "Fluid Mechanics", "Surveying", "Building Materials"] },
      { year: "Year 3", subjects: ["Structural Analysis", "Geotechnical Engineering", "Environmental Engineering", "Transportation Engineering"] },
      { year: "Year 4", subjects: ["Design of Steel Structures", "Construction Management", "Major Project", "Industrial Training"] }
    ]
  },
  {
    id: 3,
    slug: "btech-eee",
    title: "B.Tech - Electrical & Electronics Engineering",
    duration: "4 Years",
    image: BtechElectrical,
    description: "Focuses on power systems, electronics, control systems, and electrical machines.",
    features: ["Power Systems", "Control Systems", "Electrical Machines", "Power Electronics"],
    eligibility: "10+2 with Physics, Mathematics, and Chemistry with a minimum of 45% aggregate (40% for reserved categories).",
    approach: "A blend of hardware labs and simulation software (MATLAB, Simulink). Students work on live models of electrical machines and power grids.",
    documentsRequired: ["10th Marksheet & Certificate", "12th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Engineering Mathematics", "Engineering Physics", "Basic Electrical Engineering", "Programming Concepts"] },
      { year: "Year 2", subjects: ["Network Analysis", "Electrical Machines I", "Analog Electronics", "Electromagnetic Fields"] },
      { year: "Year 3", subjects: ["Power Systems", "Control Systems", "Power Electronics", "Microprocessors"] },
      { year: "Year 4", subjects: ["Electric Drives", "Renewable Energy Systems", "Major Project", "Industrial Training"] }
    ]
  },
  {
    id: 4,
    slug: "btech-ece",
    title: "B.Tech - Electronics & Communication Engineering",
    duration: "4 Years",
    image: BtechEC,
    description: "Covers analog and digital electronics, communication systems, and signal processing.",
    features: ["Digital Electronics", "Communication Systems", "Microprocessors", "VLSI Design"],
    eligibility: "10+2 with Physics, Mathematics, and Chemistry with a minimum of 45% aggregate (40% for reserved categories).",
    approach: "Strong focus on embedded systems, IoT, and VLSI design labs. We collaborate with industry partners to provide state-of-the-art equipment training.",
    documentsRequired: ["10th Marksheet & Certificate", "12th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Engineering Mathematics", "Engineering Physics", "Basic Electrical Engineering", "Engineering Graphics"] },
      { year: "Year 2", subjects: ["Digital Logic Design", "Signals and Systems", "Electronic Devices", "Network Theory"] },
      { year: "Year 3", subjects: ["Analog Communication", "Digital Communication", "Microcontrollers", "Antenna and Wave Propagation"] },
      { year: "Year 4", subjects: ["VLSI Design", "Optical Communication", "Major Project", "Industrial Training"] }
    ]
  },
  {
    id: 5,
    slug: "btech-mechanical",
    title: "B.Tech - Mechanical Engineering",
    duration: "4 Years",
    image: BtechMechanicalCourse,
    description: "Focuses on design, thermal sciences, manufacturing, and automation.",
    features: ["Thermodynamics", "Machine Design", "Manufacturing Processes", "Automation & Robotics"],
    eligibility: "10+2 with Physics, Mathematics, and Chemistry with a minimum of 45% aggregate (40% for reserved categories).",
    approach: "Heavy emphasis on CAD/CAM labs, workshops, and thermal engine testing. Students regularly participate in automotive design competitions.",
    documentsRequired: ["10th Marksheet & Certificate", "12th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Engineering Mathematics", "Engineering Physics", "Basic Mechanical Engineering", "Engineering Graphics"] },
      { year: "Year 2", subjects: ["Thermodynamics", "Mechanics of Materials", "Kinematics of Machines", "Fluid Mechanics"] },
      { year: "Year 3", subjects: ["Heat Transfer", "Machine Design", "Manufacturing Technology", "Dynamics of Machines"] },
      { year: "Year 4", subjects: ["CAD/CAM", "Automobile Engineering", "Major Project", "Industrial Training"] }
    ]
  }
];

export const computerApplicationCourses = [
  {
    id: 6,
    slug: "bca",
    title: "Bachelor of Computer Applications (BCA)",
    duration: "3 Years",
    image: BcaImg,
    description: "Comprehensive program in computer applications and software development.",
    features: ["Programming Languages", "Database Systems", "Web Technologies", "Software Engineering"],
    eligibility: "10+2 in any stream with Mathematics as a subject, securing a minimum of 45% marks.",
    approach: "Practical-oriented learning with frequent coding assignments, software development lifecycles, and a capstone project in the final year.",
    documentsRequired: ["10th Marksheet & Certificate", "12th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Computer Fundamentals", "Programming in C", "Mathematics", "Digital Logic"] },
      { year: "Year 2", subjects: ["Data Structures using C++", "Database Management Systems", "Web Development", "Operating Systems"] },
      { year: "Year 3", subjects: ["Java Programming", "Software Engineering", "Python Programming", "Major Project"] }
    ]
  },
  {
    id: 7,
    slug: "mca",
    title: "Master of Computer Applications (MCA)",
    duration: "2 Years",
    image: McaImg,
    description: "Advanced program in computer applications and software development.",
    features: ["Advanced Programming", "Web Technologies", "Database Systems", "Software Project Management"],
    eligibility: "BCA/B.Sc (Computer Science/IT) or any graduation with Mathematics at 10+2 level, securing a minimum of 50% marks.",
    approach: "Industry-aligned curriculum with focus on emerging technologies like AI, Cloud Computing, and Big Data. Includes a mandatory 6-month industry internship.",
    documentsRequired: ["Graduation Marksheets", "10th & 12th Marksheets", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Advanced Data Structures", "Advanced Database Systems", "Java & J2EE", "Software Engineering"] },
      { year: "Year 2", subjects: ["Cloud Computing", "Artificial Intelligence", "Machine Learning", "Industrial Internship & Major Project"] }
    ]
  }
];

export const polytechnicCourses = [
  {
    id: 8,
    slug: "diploma-civil",
    title: "Diploma in Civil Engineering",
    duration: "3 Years",
    image: DiplomaCivil,
    description: "Practical training in construction techniques, surveying, and building design.",
    features: ["Building Construction", "Surveying", "Construction Materials", "Estimating & Costing"],
    eligibility: "10th pass with minimum 35% marks in Science and Mathematics.",
    approach: "Highly practical approach with extensive field work, surveying camps, and material testing labs.",
    documentsRequired: ["10th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Applied Mathematics", "Applied Physics", "Applied Chemistry", "Engineering Drawing"] },
      { year: "Year 2", subjects: ["Building Materials", "Surveying", "Mechanics of Solids", "Concrete Technology"] },
      { year: "Year 3", subjects: ["Design of Steel Structures", "Highway Engineering", "Estimating & Costing", "Major Project"] }
    ]
  },
  {
    id: 9,
    slug: "diploma-electrical",
    title: "Diploma in Electrical Engineering",
    duration: "3 Years",
    image: DiplomaElectricalElectronics,
    description: "Focuses on electrical systems, machines, and power distribution.",
    features: ["Electrical Circuits", "Power Systems", "Electrical Machines", "Installation & Maintenance"],
    eligibility: "10th pass with minimum 35% marks in Science and Mathematics.",
    approach: "Hands-on experience in electrical workshops, motor winding, and wiring installations.",
    documentsRequired: ["10th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Applied Mathematics", "Applied Physics", "Applied Chemistry", "Engineering Drawing"] },
      { year: "Year 2", subjects: ["Basic Electrical Engineering", "Electrical Machines I", "Electrical Measurements", "Electronics"] },
      { year: "Year 3", subjects: ["Electrical Machines II", "Power Systems", "Industrial Management", "Major Project"] }
    ]
  },
  {
    id: 10,
    slug: "diploma-automobile",
    title: "Diploma in Mechanical Engineering (Automobile)",
    duration: "3 Years",
    image: DiplomaMechAutomobile,
    description: "Specialized program focusing on automobile technology and maintenance.",
    features: ["Automobile Engineering", "Engine Technology", "Vehicle Maintenance", "Automotive Electronics"],
    eligibility: "10th pass with minimum 35% marks in Science and Mathematics.",
    approach: "Practical training in automobile workshops, engine assembly/disassembly, and vehicle diagnostics.",
    documentsRequired: ["10th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Applied Mathematics", "Applied Physics", "Applied Chemistry", "Engineering Drawing"] },
      { year: "Year 2", subjects: ["Thermodynamics", "Automobile Engines", "Chassis & Body Engineering", "Workshop Technology"] },
      { year: "Year 3", subjects: ["Motor Vehicle Act", "Vehicle Maintenance", "Auto Electrical & Electronics", "Major Project"] }
    ]
  },
  {
    id: 11,
    slug: "diploma-production",
    title: "Diploma in Mechanical Engineering (Production)",
    duration: "3 Years",
    image: DiplomaMechProduction,
    description: "Focuses on manufacturing processes, production planning, and quality control.",
    features: ["Production Technology", "Quality Control", "Industrial Engineering", "Manufacturing Processes"],
    eligibility: "10th pass with minimum 35% marks in Science and Mathematics.",
    approach: "Intensive training in machine shops, CNC programming, and manufacturing labs.",
    documentsRequired: ["10th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Applied Mathematics", "Applied Physics", "Applied Chemistry", "Engineering Drawing"] },
      { year: "Year 2", subjects: ["Thermodynamics", "Manufacturing Processes", "Machine Drawing", "Strength of Materials"] },
      { year: "Year 3", subjects: ["Production Management", "CNC Machines", "Metrology & Quality Control", "Major Project"] }
    ]
  },
  {
    id: 12,
    slug: "diploma-cs",
    title: "Diploma in Computer Science",
    duration: "3 Years",
    image: DiplomaCS,
    description: "Practical training in programming, networking, and software development.",
    features: ["Programming Fundamentals", "Database Management", "Web Development", "Computer Networks"],
    eligibility: "10th pass with minimum 35% marks in Science and Mathematics.",
    approach: "Lab-centric approach focusing on coding proficiency and system administration.",
    documentsRequired: ["10th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Applied Mathematics", "Applied Physics", "Computer Fundamentals", "C Programming"] },
      { year: "Year 2", subjects: ["Data Structures", "Database Management", "Web Technologies", "Operating Systems"] },
      { year: "Year 3", subjects: ["Java Programming", "Computer Networks", "Software Engineering", "Major Project"] }
    ]
  }
];

export const managementCourses = [
  {
    id: 13,
    slug: "bba",
    title: "Bachelor of Business Administration (BBA)",
    duration: "3 Years",
    image: BbaImg,
    description: "Develops foundational business knowledge and managerial skills.",
    features: ["Principles of Management", "Business Economics", "Financial Accounting", "Marketing Management"],
    eligibility: "10+2 in any stream with a minimum of 45% aggregate.",
    approach: "Case-study driven methodology, management games, and frequent corporate interactions to build leadership skills.",
    documentsRequired: ["10th Marksheet & Certificate", "12th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Principles of Management", "Business Communication", "Financial Accounting", "Business Economics"] },
      { year: "Year 2", subjects: ["Marketing Management", "Human Resource Management", "Financial Management", "Business Law"] },
      { year: "Year 3", subjects: ["Entrepreneurship", "Strategic Management", "Elective (Marketing/Finance/HR)", "Research Project"] }
    ]
  },
  {
    id: 14,
    slug: "mba",
    title: "Master of Business Administration (MBA)",
    duration: "2 Years",
    image: MbaImg,
    description: "Develops managerial skills and business acumen for leadership positions.",
    features: ["Marketing Management", "Financial Management", "Human Resource Management", "Operations Management"],
    eligibility: "Graduation in any discipline with a minimum of 50% aggregate (45% for reserved categories).",
    approach: "Harvard-style case studies, industry internships, and leadership seminars by corporate veterans.",
    documentsRequired: ["Graduation Marksheets", "10th & 12th Marksheets", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Managerial Economics", "Organizational Behavior", "Accounting for Managers", "Marketing Management"] },
      { year: "Year 2", subjects: ["Strategic Management", "Dual Specialization Subjects", "Business Ethics", "Summer Internship Project"] }
    ]
  },
  {
    id: 15,
    slug: "bcom",
    title: "Bachelor of Commerce (B.Com)",
    duration: "3 Years",
    image: BcomImg,
    description: "Comprehensive understanding of commerce, accounting, and business laws.",
    features: ["Financial Accounting", "Business Law", "Economics", "Taxation"],
    eligibility: "10+2 (Commerce/Science) with a minimum of 45% aggregate.",
    approach: "Focus on practical accounting software (Tally), tax filings, and understanding financial markets.",
    documentsRequired: ["10th Marksheet & Certificate", "12th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Financial Accounting", "Business Organization", "Business Economics", "Business Communication"] },
      { year: "Year 2", subjects: ["Corporate Accounting", "Cost Accounting", "Income Tax Law", "Company Law"] },
      { year: "Year 3", subjects: ["Auditing", "Management Accounting", "Financial Management", "E-Commerce"] }
    ]
  }
];

export const pharmacyCourses = [
  {
    id: 16,
    slug: "dpharm",
    title: "Diploma in Pharmacy (D.Pharm)",
    duration: "2 Years",
    image: DpharmImg,
    description: "Foundation program in pharmaceutical sciences and pharmacy practice.",
    features: ["Pharmaceutics", "Pharmacology", "Pharmaceutical Chemistry", "Hospital Pharmacy"],
    eligibility: "10+2 with Physics, Chemistry, and Biology/Mathematics with minimum 45% marks.",
    approach: "Intensive laboratory practice and a mandatory 500-hour hospital training program.",
    documentsRequired: ["10th Marksheet & Certificate", "12th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Pharmaceutics I", "Pharmaceutical Chemistry I", "Pharmacognosy", "Human Anatomy & Physiology"] },
      { year: "Year 2", subjects: ["Pharmaceutics II", "Pharmaceutical Chemistry II", "Pharmacology & Toxicology", "Hospital & Clinical Pharmacy"] }
    ]
  },
  {
    id: 17,
    slug: "bpharm",
    title: "Bachelor of Pharmacy (B.Pharm)",
    duration: "4 Years",
    image: BpharmImg,
    description: "Comprehensive program in pharmaceutical sciences, drug formulation, and pharmacology.",
    features: ["Medicinal Chemistry", "Pharmacology", "Pharmaceutical Analysis", "Biopharmaceutics"],
    eligibility: "10+2 with Physics, Chemistry, and Biology/Mathematics with minimum 45% marks.",
    approach: "Research-driven methodology with advanced laboratory research, industrial training, and pharmaceutical formulation projects.",
    documentsRequired: ["10th Marksheet & Certificate", "12th Marksheet & Certificate", "Transfer Certificate (TC)", "Migration Certificate", "Aadhar Card Copy", "Passport Size Photographs (4)"],
    syllabus: [
      { year: "Year 1", subjects: ["Human Anatomy and Physiology", "Pharmaceutical Analysis", "Pharmaceutics I", "Pharmaceutical Inorganic Chemistry"] },
      { year: "Year 2", subjects: ["Physical Pharmaceutics", "Pharmaceutical Microbiology", "Pharmaceutical Engineering", "Organic Chemistry"] },
      { year: "Year 3", subjects: ["Medicinal Chemistry", "Pharmacology", "Pharmacognosy", "Pharmaceutical Jurisprudence"] },
      { year: "Year 4", subjects: ["Instrumental Methods of Analysis", "Industrial Pharmacy", "Pharmacy Practice", "Project Work"] }
    ]
  }
];

export const allCourses = [
  ...engineeringCourses,
  ...computerApplicationCourses,
  ...polytechnicCourses,
  ...managementCourses,
  ...pharmacyCourses
];
