import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import InfoTooltip from '../../components/common/InfoTooltip';

const PLAYBOOKS = [
  {
    id: 'add-student',
    category: 'students',
    icon: 'fa-user-plus',
    color: 'from-blue-600 to-indigo-600',
    title: 'How to Add a New Student',
    summary: 'Register an individual student or upload hundreds of students simultaneously using an Excel/CSV file.',
    link: '/admin/students',
    buttonText: 'Open Students Directory',
    time: '2 mins',
    steps: [
      {
        step: 1,
        title: 'Open Students Directory',
        desc: 'Click on "Academics" in the left sidebar and select "Students Directory", or click the button below.'
      },
      {
        step: 2,
        title: 'Click "Add New Student"',
        desc: 'Look for the green or purple "Add Student" button at the top-right of the page.'
      },
      {
        step: 3,
        title: 'Fill Basic Information',
        desc: 'Enter the student’s Full Name, Date of Birth, Contact Number, Email, and assign their Degree & Semester.'
      },
      {
        step: 4,
        title: 'Save & Issue Credentials',
        desc: 'Click "Save Student". A unique Student ID will be generated automatically, allowing the student to log into their portal.'
      }
    ]
  },
  {
    id: 'mark-attendance',
    category: 'attendance',
    icon: 'fa-clipboard-user',
    color: 'from-emerald-600 to-teal-600',
    title: 'How to Mark Daily Attendance',
    summary: 'Quickly record morning roll-calls for any class or section with 1-click "Mark All Present".',
    link: '/admin/erp-attendance',
    buttonText: 'Open Daily Attendance',
    time: '1 min',
    steps: [
      {
        step: 1,
        title: 'Go to Attendance Portal',
        desc: 'In the sidebar, navigate to "Academics" and choose "Daily Attendance".'
      },
      {
        step: 2,
        title: 'Select Class, Section & Date',
        desc: 'Choose the Department, Course, Semester, and Section from the dropdown menus.'
      },
      {
        step: 3,
        title: 'Mark Present or Absent',
        desc: 'Use the quick "Mark All Present" toggle, then simply click on the few students who are absent to toggle them to "Absent".'
      },
      {
        step: 4,
        title: 'Submit Daily Register',
        desc: 'Click the green "Save Attendance" button. The attendance percentage will update instantly across student profiles.'
      }
    ]
  },
  {
    id: 'collect-fees',
    category: 'finance',
    icon: 'fa-indian-rupee-sign',
    color: 'from-amber-600 to-orange-600',
    title: 'How to Collect Fees & Print Receipts',
    summary: 'Accept cash, UPI, or cheque fee payments, apply merit scholarships, and generate official printable receipts.',
    link: '/admin/fee-portal',
    buttonText: 'Open Fee Cashier Portal',
    time: '2 mins',
    steps: [
      {
        step: 1,
        title: 'Open Fee Cashier Portal',
        desc: 'Click on "Campus Operations" in the left menu and select "Fee & Cashier".'
      },
      {
        step: 2,
        title: 'Search Student Account',
        desc: 'Type the student’s Name, Student ID, or Mobile number in the search box and select them from the list.'
      },
      {
        step: 3,
        title: 'Enter Amount & Select Payment Mode',
        desc: 'Enter the amount being collected. You can click "Fill Full Due" or enter a partial installment. Choose Cash, Online (UPI), or Cheque.'
      },
      {
        step: 4,
        title: 'Collect & Print Official Receipt',
        desc: 'Click "Collect Payment & Generate Receipt". A formal printable receipt with a QR code and college seal will pop up ready to print or save as PDF.'
      }
    ]
  },
  {
    id: 'exam-halltickets',
    category: 'exams',
    icon: 'fa-id-card',
    color: 'from-purple-600 to-violet-600',
    title: 'How to Issue Exam Hall Tickets & Mark Grades',
    summary: 'Publish exam timetables, enforce 75% attendance eligibility, and issue verified admit cards with QR codes.',
    link: '/admin/exam-controller',
    buttonText: 'Open Exam Controller',
    time: '3 mins',
    steps: [
      {
        step: 1,
        title: 'Open Exam & OBE Controller',
        desc: 'Under "Academics" in the sidebar, click on "Exam & OBE Controller".'
      },
      {
        step: 2,
        title: 'Create or View Timetable',
        desc: 'Set the exam title, starting date, and subject slots (Date, Time, Room, and Course Outcomes).'
      },
      {
        step: 3,
        title: 'Review Hall Ticket Eligibility',
        desc: 'Go to the "Hall Tickets & Eligibility Gate" tab. Students with attendance ≥ 75% are automatically cleared.'
      },
      {
        step: 4,
        title: 'Print Hall Tickets or Record Marks',
        desc: 'Click "Print Hall Ticket" to give the student their admit card. After exams, use the "Marks Entry" tab to enter scores and compute SGPA.'
      }
    ]
  },
  {
    id: 'announcements',
    category: 'communication',
    icon: 'fa-bullhorn',
    color: 'from-pink-600 to-rose-600',
    title: 'How to Broadcast Announcements',
    summary: 'Send instant campus notices, holiday alerts, or exam circulars to all students and teachers.',
    link: '/admin/erp-notifications',
    buttonText: 'Open Announcements Manager',
    time: '1 min',
    steps: [
      {
        step: 1,
        title: 'Open Announcements',
        desc: 'Navigate to "Academics" → "Announcements" in the sidebar.'
      },
      {
        step: 2,
        title: 'Type Notice Title & Message',
        desc: 'Enter a clear title (e.g. "Campus Holiday Announcement") and the detailed notice text.'
      },
      {
        step: 3,
        title: 'Select Target Audience',
        desc: 'Choose whether this announcement is for All Campus, Students Only, or Staff Members.'
      },
      {
        step: 4,
        title: 'Publish Notice',
        desc: 'Click "Publish Notice". It will immediately appear on all student dashboards and campus notification feeds.'
      }
    ]
  },
  {
    id: 'safety-privacy',
    category: 'safety',
    icon: 'fa-shield-heart',
    color: 'from-emerald-600 to-cyan-600',
    title: 'How to Handle Safety & Privacy Requests',
    summary: 'Investigate student welfare grievances, UGC anti-ragging complaints, and DPDP data privacy requests.',
    link: '/admin/safety',
    buttonText: 'Open Safety Center',
    time: '2 mins',
    steps: [
      {
        step: 1,
        title: 'Open Safety & Welfare Center',
        desc: 'Click on "Safety & Compliance" in the sidebar and choose "Safety & Welfare (UGC)".'
      },
      {
        step: 2,
        title: 'Check Pending Incident Queue',
        desc: 'Review submitted grievances, anonymous bullying reports, or POSH Internal Complaints Committee alerts.'
      },
      {
        step: 3,
        title: 'Update Investigation Status',
        desc: 'Assign an investigator, record notes, and update status to "Under Review" or "Resolved".'
      },
      {
        step: 4,
        title: 'Close & Dispatch Resolution',
        desc: 'Once resolved, mark as completed. An audit timestamp is recorded automatically for statutory compliance.'
      }
    ]
  }
];

const FAQS = [
  {
    q: 'How do I print an official fee receipt for a student?',
    a: 'Go to "Fee & Cashier" in the sidebar. Search for the student by their name or ID. In their transaction history table, click the "Print Receipt" icon on any completed payment. A formal institutional receipt formatted for A4 printing will open immediately with a 1-click print button.'
  },
  {
    q: 'What happens if a student’s attendance falls below 75%?',
    a: 'The system highlights their account in amber or red on your dashboard under "Items That Need Attention". On the Exam Hall Tickets page, their status will show as "Conditional" until approved by the Dean or Administrator.'
  },
  {
    q: 'Can students pay their fees online from their own phones?',
    a: 'Yes! When students log into their Student Dashboard and click on the "Fees" tab, they have a "Pay Remaining Dues Online" button. They can choose UPI/QR Code, Cards, or Net Banking, complete payment, and download their official receipt instantly.'
  },
  {
    q: 'How do I add a merit scholarship or fee discount for a student?',
    a: 'In the Fee Cashier Portal, select the student. In the payment collection form, use the "Scholarship / Concession" dropdown. You can select pre-set concessions like Merit Scholarship (₹5,000), Sports Quota (₹7,500), Staff Ward Subsidy, or type in a custom concession amount.'
  },
  {
    q: 'How do teachers mark roll call on their phones or tablets?',
    a: 'Instructors can log in and click "Teacher Roll Call" in the sidebar. The page is fully responsive for tablets and mobile devices with big touch-friendly buttons for marking students Present or Absent.'
  },
  {
    q: 'What is the Academic Bank of Credits (ABC) & DigiLocker sync?',
    a: 'Under the National Education Policy (NEP 2020), every student earns digital credit points for passing courses. Shyvora automatically tracks NCrF credit points and lets students sync their credits with DigiLocker with one click.'
  },
  {
    q: 'Can parents submit anonymous complaints or anti-ragging concerns?',
    a: 'Yes! Our public `/safety` portal requires zero login. Anyone can visit the campus website and submit a confidential or anonymous report, which immediately alerts the administration.'
  }
];

const HelpSupport = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeStepByPlaybook, setActiveStepByPlaybook] = useState({});

  const handleStepClick = (playbookId, stepIndex) => {
    setActiveStepByPlaybook(prev => ({
      ...prev,
      [playbookId]: stepIndex
    }));
  };

  const filteredPlaybooks = PLAYBOOKS.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      p.title.toLowerCase().includes(q) || 
      p.summary.toLowerCase().includes(q) ||
      p.steps.some(s => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index) => {
    setOpenFaqIndex(prev => prev === index ? null : index);
  };

  return (
    <div className="space-y-8 animate-[modalFadeIn_0.3s_ease] pb-16 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-8 md:p-12 shadow-2xl border border-indigo-800/40">
        <div className="absolute -right-12 -bottom-12 text-white/5 text-9xl pointer-events-none">
          <i className="fas fa-book-open-reader"></i>
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-purple-200 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Administrator Help Center & Playbooks
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            How Can We Help You Today?
          </h1>
          <p className="text-sm md:text-base text-purple-200/90 mt-2 leading-relaxed">
            Simple, step-by-step interactive instructions on how to use every feature in your school & college software. Zero complicated jargon.
          </p>

          {/* Search Box */}
          <div className="mt-6 relative max-w-xl">
            <input
              type="text"
              placeholder="Search guides: how to add student, mark attendance, print fee receipt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/95 text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm font-medium shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-400/30 transition"
            />
            <i className="fas fa-search absolute left-4 top-4 text-slate-400 text-base"></i>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', name: 'All Guides', icon: 'fa-border-all' },
          { id: 'students', name: 'Students & Admissions', icon: 'fa-user-graduate' },
          { id: 'attendance', name: 'Daily Attendance', icon: 'fa-clipboard-user' },
          { id: 'finance', name: 'Fee Collection & Receipts', icon: 'fa-indian-rupee-sign' },
          { id: 'exams', name: 'Exams & Hall Tickets', icon: 'fa-award' },
          { id: 'communication', name: 'Announcements', icon: 'fa-bullhorn' },
          { id: 'safety', name: 'Campus Safety & Privacy', icon: 'fa-shield-heart' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#6D4C9C] text-white shadow-md shadow-purple-500/20'
                : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-xs'
            }`}
          >
            <i className={`fas ${cat.icon}`}></i>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Step-by-Step Interactive Playbook Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Interactive Step-by-Step Playbooks
            </h2>
            <InfoTooltip
              title="Interactive Playbooks"
              text="Click on any step dot (1, 2, 3, 4) to preview exactly what to do. Click 'Open This Tool Now' to jump straight into that screen."
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredPlaybooks.length} walkthroughs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPlaybooks.map((playbook) => {
            const currentStepIdx = activeStepByPlaybook[playbook.id] || 0;
            const currentStep = playbook.steps[currentStepIdx] || playbook.steps[0];

            return (
              <div
                key={playbook.id}
                className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 p-6 md:p-8 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${playbook.color} text-white flex items-center justify-center text-lg shadow-md shrink-0`}>
                        <i className={`fas ${playbook.icon}`}></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-snug">
                          {playbook.title}
                        </h3>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <i className="fas fa-clock mr-1 text-slate-400"></i> Takes {playbook.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
                    {playbook.summary}
                  </p>

                  {/* Interactive Step Navigator */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Step {currentStep.step} of {playbook.steps.length}
                      </span>
                      {/* Step Dots */}
                      <div className="flex items-center gap-1.5">
                        {playbook.steps.map((_, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleStepClick(playbook.id, sIdx)}
                            className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition cursor-pointer ${
                              currentStepIdx === sIdx
                                ? 'bg-[#6D4C9C] text-white shadow-xs scale-105'
                                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {sIdx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="min-h-[70px]">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-md bg-[#6D4C9C]/10 text-[#6D4C9C] text-xs flex items-center justify-center font-bold">
                          {currentStep.step}
                        </span>
                        {currentStep.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed pl-7">
                        {currentStep.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <i className="fas fa-arrow-pointer text-[#6D4C9C]"></i>
                    <span>Ready to perform this task?</span>
                  </div>

                  <Link
                    to={playbook.link}
                    className="px-4 py-2 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <span>{playbook.buttonText}</span>
                    <i className="fas fa-arrow-right text-[10px]"></i>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) Section */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10">
        <div className="max-w-2xl mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#6D4C9C] text-xs font-bold">
              Got Questions?
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quick, plain-English answers to the most common questions asked by school & college administrators.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {FAQS.map((faq, fIdx) => (
            <div key={fIdx} className="py-4">
              <button
                onClick={() => toggleFaq(fIdx)}
                className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-slate-800 hover:text-[#6D4C9C] transition cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <i className="fas fa-circle-question text-[#6D4C9C] text-base shrink-0"></i>
                  {faq.q}
                </span>
                <i className={`fas fa-chevron-down text-xs text-slate-400 transition-transform ${openFaqIndex === fIdx ? 'rotate-180 text-[#6D4C9C]' : ''}`}></i>
              </button>

              {openFaqIndex === fIdx && (
                <div className="mt-3 pl-7 pr-4 text-xs text-slate-600 leading-relaxed font-normal animate-[modalFadeIn_0.2s_ease]">
                  <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100/60 text-slate-700">
                    {faq.a}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support Helpline & Technical Assistance Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 rounded-3xl p-6 md:p-8 border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#6D4C9C] text-white flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20 shrink-0">
            <i className="fas fa-headset"></i>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Need Live Personal Assistance?</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Our campus onboarding specialists are available 24/7 to help you configure courses, import student spreadsheets, or set up fee ledgers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/admin/helpdesk"
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 transition"
          >
            <i className="fas fa-ticket"></i> Open Support Ticket
          </Link>
          <a
            href="mailto:support@shyvora.com"
            className="px-5 py-2.5 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-2 transition"
          >
            <i className="fas fa-envelope"></i> Email Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
