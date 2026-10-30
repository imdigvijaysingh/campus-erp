import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import InfoTooltip from '../../components/common/InfoTooltip';

const scheduleData = [
  { id: 1, classId: 'btech-6', program: 'B.Tech CSE', semester: '6th Sem', timeStart: '09:00 AM', timeEnd: '09:50 AM', subject: 'Data Structures', room: 'Room A-101', teacher: 'Dr. Sharma', color: 'bg-purple-600', isLive: true },
  { id: 2, classId: 'btech-6', program: 'B.Tech CSE', semester: '6th Sem', timeStart: '10:00 AM', timeEnd: '10:50 AM', subject: 'Database Management Systems', room: 'Room A-203', teacher: 'Prof. Mehta', color: 'bg-emerald-500' },
  { id: 3, classId: 'btech-6', program: 'B.Tech CSE', semester: '6th Sem', timeStart: '11:00 AM', timeEnd: '11:50 AM', subject: 'Computer Networks', room: 'Room B-104', teacher: 'Dr. Verma', color: 'bg-blue-500' },
  { id: 4, classId: 'class-8', program: 'Class 8th', semester: 'Sec A', timeStart: '09:00 AM', timeEnd: '09:45 AM', subject: 'Mathematics', room: 'Room 12', teacher: 'Mrs. Neha Gupta', color: 'bg-amber-500', isLive: true },
  { id: 5, classId: 'class-8', program: 'Class 8th', semester: 'Sec A', timeStart: '09:45 AM', timeEnd: '10:30 AM', subject: 'General Science', room: 'Room 12', teacher: 'Mr. Rajesh Khanna', color: 'bg-emerald-500' },
  { id: 6, classId: 'class-8', program: 'Class 8th', semester: 'Sec A', timeStart: '10:45 AM', timeEnd: '11:30 AM', subject: 'English Literature', room: 'Room 12', teacher: 'Ms. Ananya Sen', color: 'bg-indigo-500' },
  { id: 7, classId: 'bca-4', program: 'BCA', semester: '4th Sem', timeStart: '11:30 AM', timeEnd: '01:00 PM', subject: 'Java Programming Lab', room: 'Lab 1', teacher: 'Dr. Sharma', color: 'bg-rose-500' },
];

/**
 * Custom Tooltip breaking down attendance across Students, Faculty, and Staff
 */
const CustomAttendanceTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 text-xs min-w-60 z-[9999]">
        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-purple-300 font-mono">Daily Roll Call</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="font-medium">Students:</span>
            </span>
            <div className="text-right">
              <span className="font-bold text-white font-mono">{data.students}%</span>
              <span className="text-[10px] text-slate-400 block font-mono">({data.studentsHeadcount})</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium">Teaching Faculty:</span>
            </span>
            <div className="text-right">
              <span className="font-bold text-white font-mono">{data.faculty}%</span>
              <span className="text-[10px] text-slate-400 block font-mono">({data.facultyHeadcount})</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-medium">Support Staff:</span>
            </span>
            <div className="text-right">
              <span className="font-bold text-white font-mono">{data.staff}%</span>
              <span className="text-[10px] text-slate-400 block font-mono">({data.staffHeadcount})</span>
            </div>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-amber-300 font-medium flex items-center justify-between">
          <span>75% Exam Threshold:</span>
          <span className="text-emerald-400 font-bold">Compliant ✓</span>
        </div>
      </div>
    );
  }
  return null;
};

const DashboardOverview = () => {
  const [earlyWarningStats, setEarlyWarningStats] = useState(null);
  const [stats, setStats] = useState({
    students: 1284,
    faculty: 86,
    attendanceToday: 92.4,
    feesCollected: '18.6L'
  });
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'admission', title: 'New student admitted', desc: 'Riya Sharma (B.Tech CSE)', time: '12 minutes ago', icon: 'fa-user-plus', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
    { id: 2, type: 'fee', title: 'Fee payment received', desc: '₹25,000 from Arjun Kumar (BBA)', time: '2 hours ago', icon: 'fa-indian-rupee-sign', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { id: 3, type: 'attendance', title: 'Attendance marked', desc: 'CSE 3rd Year (Section A)', time: '4 hours ago', icon: 'fa-calendar-check', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  ]);

  // Aggregate daily attendance with distinct institutional cohorts
  const [attendanceData] = useState([
    { name: 'Mon 6 Oct', students: 91.2, faculty: 96.5, staff: 94.1, studentsHeadcount: '1,171 / 1,284', facultyHeadcount: '83 / 86', staffHeadcount: '32 / 34' },
    { name: 'Tue 7 Oct', students: 93.4, faculty: 97.6, staff: 95.0, studentsHeadcount: '1,199 / 1,284', facultyHeadcount: '84 / 86', staffHeadcount: '32 / 34' },
    { name: 'Wed 8 Oct', students: 92.4, faculty: 96.5, staff: 94.1, studentsHeadcount: '1,186 / 1,284', facultyHeadcount: '83 / 86', staffHeadcount: '32 / 34' },
    { name: 'Thu 9 Oct', students: 89.8, faculty: 95.3, staff: 92.6, studentsHeadcount: '1,153 / 1,284', facultyHeadcount: '82 / 86', staffHeadcount: '31 / 34' },
    { name: 'Fri 10 Oct', students: 90.5, faculty: 96.5, staff: 93.5, studentsHeadcount: '1,162 / 1,284', facultyHeadcount: '83 / 86', staffHeadcount: '32 / 34' },
    { name: 'Sat 11 Oct', students: 86.2, faculty: 91.8, staff: 90.0, studentsHeadcount: '1,107 / 1,284', facultyHeadcount: '79 / 86', staffHeadcount: '30 / 34' },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [activitiesRes, usersRes, studentsRes] = await Promise.all([
        api.get('/activities').catch(() => ({ data: { data: [] } })),
        api.get('/auth/users/count').catch(() => ({ data: { count: 0 } })),
        api.get('/students').catch(() => ({ data: [] }))
      ]);

      const adminsCount = usersRes.data.count || 0;
      const studentsCount = studentsRes.data.length || 0;

      if (studentsCount > 0) {
        setStats(prev => ({
          ...prev,
          students: studentsCount >= 100 ? studentsCount : 1284,
          faculty: adminsCount >= 10 ? adminsCount : prev.faculty
        }));
      }

      const realActivities = activitiesRes.data?.data || [];
      if (realActivities.length > 0) {
        // activities available if seeded
      }

      // Fetch AI Early-Warning outcome stats
      try {
        const ewRes = await api.get('/early-warning/summary');
        if (ewRes.data?.success) {
          setEarlyWarningStats(ewRes.data.data);
        }
      } catch (ewErr) {
        // Fallback gracefully if offline
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const adminName = localStorage.getItem('adminUsername') || 'Administrator';

  // Dynamic time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [activeCohort, setActiveCohort] = useState('all'); // 'all' | 'students' | 'faculty' | 'staff'
  const [selectedScheduleFilter, setSelectedScheduleFilter] = useState('all'); // 'all' | classId | teacherId
  const [actionTab, setActionTab] = useState('actions'); // 'actions' | 'milestones'

  const pendingActions = [
    {
      id: 'act-1',
      type: 'statutory',
      title: 'Students Below 75% Attendance Gate',
      desc: 'At-risk of exam debarment & detention. Immediate AI diagnostic available.',
      badge: 'Detention Gate',
      badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
      actionText: 'AI Early Warning',
      link: '/admin/early-warning',
      icon: 'fa-brain',
      iconBg: 'bg-rose-100 text-rose-700'
    },
    {
      id: 'act-2',
      type: 'concession',
      title: '3 Fee Concession Applications Pending',
      desc: '₹45,000 total merit-cum-means assistance awaiting registrar sign-off',
      badge: 'Finance Sign-off',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      actionText: 'Authorize',
      link: '/admin/fee-portal',
      icon: 'fa-file-invoice-dollar',
      iconBg: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 'act-3',
      type: 'faculty',
      title: '3 Faculty On-Leave Today • Substitutes Assigned',
      desc: 'Dr. Verma covering Room A-101 (P3) • Mrs. Neha Gupta covering Room 12',
      badge: 'Roster Notice',
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
      actionText: 'View Roster',
      link: '/admin/teacher-portal',
      icon: 'fa-user-clock',
      iconBg: 'bg-purple-100 text-[#6D4C9C]'
    },
    {
      id: 'act-4',
      type: 'nep2020',
      title: '142 APAAR Student Credit Sheets Ready',
      desc: 'Academic Bank of Credits (ABC / DigiLocker NAD) batch push ready',
      badge: 'NEP 2020 Sync',
      badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
      actionText: 'Sync DigiLocker',
      link: '/admin/students',
      icon: 'fa-cloud-arrow-up',
      iconBg: 'bg-blue-100 text-blue-700'
    }
  ];

  const campusMilestones = [
    {
      id: 'ms-1',
      date: 'Oct 19, 2026',
      daysLeft: 'In 5 days',
      title: 'Odd Semester Mid-Term Examination Roster',
      desc: 'Phase 7 OBE question paper banks locked & hall tickets generated',
      badge: 'Examination',
      badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      link: '/admin/exam-controller',
      actionText: 'Exam Center'
    },
    {
      id: 'ms-2',
      date: 'Oct 25, 2026',
      daysLeft: 'In 11 days',
      title: 'Term Tuition Fee Final Installment Deadline',
      desc: 'Cashier counters & Razorpay gateway active; auto-SMS reminders dispatched',
      badge: 'Fee Collection',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      link: '/admin/fee-portal',
      actionText: 'Cashier Hub'
    },
    {
      id: 'ms-3',
      date: 'Nov 02, 2026',
      daysLeft: 'In 19 days',
      title: 'Statutory NAAC & UGC NEP-2020 Audit Review',
      desc: 'Self-Study Report (SSR) student attendance & OBE attainment at 94%',
      badge: 'Statutory Audit',
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
      link: '/admin/audit-logs',
      actionText: 'SOC Logs'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-[modalFadeIn_0.3s_ease] text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{formattedDate}</p>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {adminName} <span className="inline-block animate-[wave_2s_infinite]">👋</span>
            </h1>
            <InfoTooltip
              title="Admin Mission Control"
              text="Centralized executive overview displaying live student enrollment, campus attendance, fee cashier statistics, and real-time audit activity across all branches."
              tip="Hover on any 'i' icon across the portal to see how each tool empowers your institution."
            />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Here's your campus at a glance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Executive Quick Operations Hub */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              className="px-4 py-2.5 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white font-semibold text-sm rounded-xl transition-all flex items-center gap-2.5 shadow-sm cursor-pointer group"
            >
              <i className="fas fa-bolt-lightning text-xs text-amber-300 group-hover:scale-110 transition-transform"></i>
              <span>Quick Operations</span>
              <i className={`fas fa-chevron-down text-[10px] text-purple-200 transition-transform ${quickActionsOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {quickActionsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setQuickActionsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 p-2.5 z-50 animate-[modalFadeIn_0.15s_ease-out]">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Executive Dispatch</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                      6 Core Workflows
                    </span>
                  </div>

                  <div className="space-y-1">
                    <Link
                      to="/admin/fee-portal"
                      onClick={() => setQuickActionsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xs shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <i className="fas fa-indian-rupee-sign"></i>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#6D4C9C] transition-colors block">
                          Cashier & Fee Terminal
                        </span>
                        <span className="text-[11px] text-slate-400 block leading-tight">
                          Collect tuition, concessions & instant digital receipts
                        </span>
                      </div>
                      <i className="fas fa-chevron-right text-slate-300 group-hover:text-[#6D4C9C] text-xs transition-colors self-center"></i>
                    </Link>

                    <Link
                      to="/admin/erp-attendance"
                      onClick={() => setQuickActionsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#6D4C9C] border border-purple-100 flex items-center justify-center text-xs shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <i className="fas fa-clipboard-user"></i>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#6D4C9C] transition-colors block">
                          Daily Attendance & BioGate
                        </span>
                        <span className="text-[11px] text-slate-400 block leading-tight">
                          Biometric punch logs & low attendance advisory
                        </span>
                      </div>
                      <i className="fas fa-chevron-right text-slate-300 group-hover:text-[#6D4C9C] text-xs transition-colors self-center"></i>
                    </Link>

                    <Link
                      to="/admin/exam-controller"
                      onClick={() => setQuickActionsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <i className="fas fa-file-signature"></i>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#6D4C9C] transition-colors block">
                          Exam Controller & PYQ Bank
                        </span>
                        <span className="text-[11px] text-slate-400 block leading-tight">
                          Old papers, sample solutions & exam schedules
                        </span>
                      </div>
                      <i className="fas fa-chevron-right text-slate-300 group-hover:text-[#6D4C9C] text-xs transition-colors self-center"></i>
                    </Link>

                    <Link
                      to="/admin/erp-notifications"
                      onClick={() => setQuickActionsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-xs shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <i className="fas fa-bullhorn"></i>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#6D4C9C] transition-colors block">
                          Broadcast Campus Circular
                        </span>
                        <span className="text-[11px] text-slate-400 block leading-tight">
                          Publish urgent announcements & push alerts
                        </span>
                      </div>
                      <i className="fas fa-chevron-right text-slate-300 group-hover:text-[#6D4C9C] text-xs transition-colors self-center"></i>
                    </Link>

                    <Link
                      to="/admin/soc-security"
                      onClick={() => setQuickActionsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xs shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <i className="fas fa-shield-halved"></i>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#6D4C9C] transition-colors block">
                          SOC Security & CERT-In Logs
                        </span>
                        <span className="text-[11px] text-slate-400 block leading-tight">
                          Threat monitoring & concurrent device sessions
                        </span>
                      </div>
                      <i className="fas fa-chevron-right text-slate-300 group-hover:text-[#6D4C9C] text-xs transition-colors self-center"></i>
                    </Link>

                    <Link
                      to="/admin/students"
                      onClick={() => setQuickActionsOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-xs shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <i className="fas fa-users-gear"></i>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-[#6D4C9C] transition-colors block">
                          Student & Academic Registry
                        </span>
                        <span className="text-[11px] text-slate-400 block leading-tight">
                          Directory lookup, promotion & APAAR ID unmasking
                        </span>
                      </div>
                      <i className="fas fa-chevron-right text-slate-300 group-hover:text-[#6D4C9C] text-xs transition-colors self-center"></i>
                    </Link>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 px-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Quick Command:</span>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 rounded border border-slate-200">
                      Ctrl + K
                    </kbd>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Institutional Audit & Reports */}
          <Link 
            to="/admin/audit-logs" 
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-all flex items-center gap-2 shadow-2xs group"
          >
            <i className="fas fa-chart-column text-xs text-[#6D4C9C] group-hover:scale-110 transition-transform"></i>
            <span>Audit & Reports</span>
          </Link>
        </div>
      </div>

      {/* Top Row: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Students */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-[#6D4C9C] shrink-0">
                <i className="fas fa-user-graduate text-lg"></i>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-700">Enrolled Students</p>
                  <InfoTooltip 
                    title="Student Enrollment Roster"
                    text="Total active students enrolled across higher education programs (B.Tech, BCA, MBA, BBA) and K-12 school classes."
                    tip="All profiles are linked to 12-digit APAAR IDs."
                  />
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.students.toLocaleString()}</h3>
                  <span className="text-[11px] font-semibold text-slate-500 font-mono">
                    Learners
                  </span>
                </div>
              </div>
            </div>
            <Link to="/admin/students" className="text-slate-400 hover:text-[#6D4C9C] transition-colors p-1" title="View Student Directory">
              <i className="fas fa-arrow-up-right-from-square text-xs"></i>
            </Link>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
              <i className="fas fa-arrow-trend-up text-[10px]"></i>
              <span>+8.2% admissions</span>
            </div>
            <span className="text-[10px] text-purple-700 font-bold bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
              100% APAAR Seeded
            </span>
          </div>
        </div>

        {/* Card 2: AI Risk Radar & Outcome Engine */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <i className="fas fa-brain text-lg"></i>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-700">AI Risk Radar</p>
                  <InfoTooltip 
                    title="Student Attrition & Exam Debarment Radar"
                    text="Continuous 4-vector predictive intelligence: Attendance Deficit (35%) + Academic Backlog (30%) + Fee Default (20%) + LMS Disengagement (15%)."
                    tip="Flags students at-risk of exam debarment (<75% attendance) and academic dropouts."
                  />
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-black text-slate-900 font-mono">
                    {earlyWarningStats?.highRiskCount ?? 0}
                  </h3>
                  <span className="text-[11px] font-semibold text-rose-600 font-mono">
                    Critical Risk
                  </span>
                </div>
              </div>
            </div>
            <Link 
              to="/admin/early-warning" 
              className="text-slate-400 hover:text-[#6D4C9C] transition-colors p-1" 
              title="Launch AI Risk Engine"
            >
              <i className="fas fa-arrow-up-right-from-square text-xs"></i>
            </Link>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              {earlyWarningStats?.detentionAlertCount ?? 1} Debarment (&lt;75%)
            </span>
            <Link
              to="/admin/early-warning"
              className="text-[11px] font-bold text-[#6D4C9C] hover:text-purple-800 flex items-center gap-1 group"
            >
              <span>Launch</span>
              <i className="fas fa-arrow-right text-[9px] group-hover:translate-x-0.5 transition-transform"></i>
            </Link>
          </div>
        </div>

        {/* Card 2: Faculty & Staff */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <i className="fas fa-user-tie text-lg"></i>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-700">Faculty & Staff</p>
                  <InfoTooltip 
                    title="Staff & Faculty Roster"
                    text="Campus workforce comprising 86 Teaching Faculty across all academic departments and 34 Helping/Support Staff maintaining facilities."
                    tip="120 total employed campus personnel."
                  />
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-black text-slate-900 font-mono">120</h3>
                  <span className="text-[11px] font-semibold text-slate-500 font-mono">
                    Employees
                  </span>
                </div>
              </div>
            </div>
            <Link to="/admin/staff" className="text-slate-400 hover:text-emerald-600 transition-colors p-1" title="View Staff Directory">
              <i className="fas fa-arrow-up-right-from-square text-xs"></i>
            </Link>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
              86 Teaching
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
              34 Helping Staff
            </span>
          </div>
        </div>

        {/* Card 3: Institutional Campus Attendance */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <i className="fas fa-clipboard-user text-lg"></i>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-700">Campus Attendance</p>
                  <InfoTooltip 
                    title="Institutional Roll Call Breakdown"
                    text="Aggregated daily attendance across all 1,404 campus members: 1,284 Enrolled Students, 86 Teaching Faculty, and 34 Support/Helping Staff."
                    tip="1,301 total members present across lecture halls and campus offices today."
                  />
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-black text-slate-900 font-mono">92.4%</h3>
                  <span className="text-[11px] font-semibold text-slate-500 font-mono">
                    (1,301 / 1,404)
                  </span>
                </div>
              </div>
            </div>
            <Link to="/admin/erp-attendance" className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Open BioGate & Roll Call Portal">
              <i className="fas fa-arrow-up-right-from-square text-xs"></i>
            </Link>
          </div>

          {/* 3 Cohort Headcount Breakdown Pills */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-purple-50/70 border border-purple-100 rounded-lg py-1 px-1">
              <span className="text-[9px] font-bold text-purple-700 uppercase tracking-wider block">Students</span>
              <span className="text-[11px] font-extrabold text-slate-800 font-mono">1,186</span>
              <span className="text-[9px] text-slate-400 block font-mono">/ 1,284</span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg py-1 px-1">
              <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider block">Faculty</span>
              <span className="text-[11px] font-extrabold text-slate-800 font-mono">83</span>
              <span className="text-[9px] text-slate-400 block font-mono">/ 86</span>
            </div>
            <div className="bg-blue-50/70 border border-blue-100 rounded-lg py-1 px-1">
              <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider block">Staff</span>
              <span className="text-[11px] font-extrabold text-slate-800 font-mono">32</span>
              <span className="text-[9px] text-slate-400 block font-mono">/ 34</span>
            </div>
          </div>
        </div>

        {/* Card 4: Campus Treasury & Bank Accounts */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <i className="fas fa-vault text-lg"></i>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-700">Campus Treasury</p>
                  <InfoTooltip 
                    title="Institutional Treasury & Financial Control"
                    text="Live liquid reserves across 3 campus bank accounts (₹67.8L), pending student fee receivables (₹3.8L), department salary structures, and upcoming faculty payroll liability (₹6.6L)."
                    tip="Click to launch the dedicated Campus Treasury & Accounts Console."
                  />
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-black text-slate-900 font-mono">₹67.8L</h3>
                  <span className="text-[11px] font-semibold text-emerald-700 font-mono">
                    in Bank A/cs
                  </span>
                </div>
              </div>
            </div>
            <Link to="/admin/treasury" className="text-slate-400 hover:text-amber-600 transition-colors p-1" title="Open Treasury & Financial Accounts">
              <i className="fas fa-arrow-up-right-from-square text-xs"></i>
            </Link>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md" title="Pending student fee receivables">
              ₹3.8L Dues Pending
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md" title="Salaries needed to be paid">
              ₹6.6L Salaries Due
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance overview chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Attendance Analytics</h2>
                <InfoTooltip 
                  title="Institutional Attendance Intelligence"
                  text="Aggregated daily attendance comparing all 3 campus cohorts: 1,284 Enrolled Students across all branches, 86 Teaching Faculty conducting classes, and 34 Support/Helping Staff maintaining facilities."
                  tip="Click any cohort filter pill (Students, Faculty, Staff) to isolate trends, or click 'BioGate' to inspect roll calls."
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily biometric & classroom roll calls across Students, Faculty & Staff
              </p>
            </div>

            {/* Cohort Tabs & Deep Link */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex p-1 bg-slate-100/80 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveCohort('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeCohort === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Cohorts
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCohort('students')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeCohort === 'students'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-purple-700'
                  }`}
                >
                  Students
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCohort('faculty')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeCohort === 'faculty'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-emerald-700'
                  }`}
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCohort('staff')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeCohort === 'staff'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-blue-700'
                  }`}
                >
                  Support Staff
                </button>
              </div>

              <Link
                to="/admin/erp-attendance"
                title="Open Biometric Attendance Portal"
                className="text-xs text-[#6D4C9C] hover:text-purple-800 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <span>BioGate</span>
                <i className="fas fa-arrow-up-right-from-square text-[10px]"></i>
              </Link>
            </div>
          </div>

          {/* Live Cohort Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4 p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl text-xs">
            <div 
              className={`p-2.5 rounded-lg transition-all cursor-pointer ${activeCohort === 'students' ? 'bg-purple-50/90 ring-1 ring-purple-300 shadow-2xs' : 'bg-white border border-slate-100'}`} 
              onClick={() => setActiveCohort(activeCohort === 'students' ? 'all' : 'students')}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 text-purple-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  Students (Enrolled)
                </span>
                <span className="font-bold text-slate-900 font-mono">92.4%</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-mono font-medium">
                1,186 / 1,284 <span className="text-[10px] text-amber-600 font-sans ml-1">(14 at-risk &lt;75%)</span>
              </p>
            </div>

            <div 
              className={`p-2.5 rounded-lg transition-all cursor-pointer ${activeCohort === 'faculty' ? 'bg-emerald-50/90 ring-1 ring-emerald-300 shadow-2xs' : 'bg-white border border-slate-100'}`} 
              onClick={() => setActiveCohort(activeCohort === 'faculty' ? 'all' : 'faculty')}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Teaching Faculty
                </span>
                <span className="font-bold text-slate-900 font-mono">96.5%</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-mono font-medium">
                83 / 86 on-duty <span className="text-[10px] text-slate-400 font-sans ml-1">(3 on leave)</span>
              </p>
            </div>

            <div 
              className={`p-2.5 rounded-lg transition-all cursor-pointer ${activeCohort === 'staff' ? 'bg-blue-50/90 ring-1 ring-blue-300 shadow-2xs' : 'bg-white border border-slate-100'}`} 
              onClick={() => setActiveCohort(activeCohort === 'staff' ? 'all' : 'staff')}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Support & Helping Staff
                </span>
                <span className="font-bold text-slate-900 font-mono">94.1%</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-mono font-medium">
                32 / 34 on-shift <span className="text-[10px] text-slate-400 font-sans ml-1">(2 off-duty)</span>
              </p>
            </div>
          </div>

          {/* Multi-Cohort Chart Container */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6D4C9C" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6D4C9C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFaculty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStaff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  ticks={[50, 65, 75, 85, 100]}
                  tickFormatter={(val) => `${val}%`}
                  domain={[50, 100]}
                />
                <Tooltip content={<CustomAttendanceTooltip />} />
                
                {/* Statutory 75% Gate Line */}
                <ReferenceLine 
                  y={75} 
                  stroke="#f59e0b" 
                  strokeDasharray="4 4" 
                  label={{ value: '75% Mandatory Gate', fill: '#d97706', fontSize: 10, position: 'insideBottomRight' }} 
                />

                {/* Dynamic rendering based on active cohort */}
                {(activeCohort === 'all' || activeCohort === 'students') && (
                  <Area 
                    type="monotone" 
                    dataKey="students" 
                    name="Students"
                    stroke="#6D4C9C" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorStudents)" 
                    activeDot={{ r: 5, fill: '#6D4C9C', stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
                {(activeCohort === 'all' || activeCohort === 'faculty') && (
                  <Area 
                    type="monotone" 
                    dataKey="faculty" 
                    name="Teaching Faculty"
                    stroke="#10B981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorFaculty)" 
                    activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
                {(activeCohort === 'all' || activeCohort === 'staff') && (
                  <Area 
                    type="monotone" 
                    dataKey="staff" 
                    name="Support Staff"
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorStaff)" 
                    activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Today's Schedule</h2>
                <InfoTooltip 
                  title="Campus Timetable & Roster"
                  text="Live lecture schedule across classes and degree branches. Shows assigned professors, rooms, and active periods."
                  tip="Filter by class/semester (e.g., B.Tech 6th Sem, Class 8th) to see that cohort's exact timetable."
                />
              </div>
              <p className="text-xs text-slate-500">{formattedDate}</p>
            </div>
            
            {/* Class / Cohort Filter Selector */}
            <div className="flex items-center gap-1.5">
              <select
                value={selectedScheduleFilter}
                onChange={(e) => setSelectedScheduleFilter(e.target.value)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none transition-colors cursor-pointer"
              >
                <option value="all">All Classes & Faculty (7 Periods)</option>
                <optgroup label="Student Cohorts (By Class)">
                  <option value="btech-6">B.Tech CSE - 6th Sem</option>
                  <option value="class-8">Class 8th - Section A</option>
                  <option value="bca-4">BCA - 4th Sem</option>
                </optgroup>
                <optgroup label="Faculty Schedules (By Teacher)">
                  <option value="teacher-sharma">Dr. Sharma (2 Lectures)</option>
                  <option value="teacher-mehta">Prof. Mehta (1 Lecture)</option>
                  <option value="teacher-verma">Dr. Verma (1 Lecture)</option>
                  <option value="teacher-gupta">Mrs. Neha Gupta (1 Lecture)</option>
                </optgroup>
              </select>
            </div>
          </div>
          
          <div className="space-y-2.5 max-h-[330px] overflow-y-auto pr-0.5">
            {scheduleData.filter((item) => {
              if (selectedScheduleFilter === 'all') return true;
              if (selectedScheduleFilter === 'teacher-sharma') return item.teacher.includes('Sharma');
              if (selectedScheduleFilter === 'teacher-mehta') return item.teacher.includes('Mehta');
              if (selectedScheduleFilter === 'teacher-verma') return item.teacher.includes('Verma');
              if (selectedScheduleFilter === 'teacher-gupta') return item.teacher.includes('Gupta');
              return item.classId === selectedScheduleFilter;
            }).map((item) => (
              <div 
                key={item.id} 
                className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-purple-50/50 border border-slate-100 hover:border-purple-200 transition-all text-xs"
              >
                {/* Single Row: Period Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.color}`}></span>
                    <h4 className="font-bold text-slate-900 truncate">{item.subject}</h4>
                    {item.isLive && (
                      <span className="whitespace-nowrap text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0">
                        Live Now
                      </span>
                    )}
                  </div>
                  <span className="whitespace-nowrap shrink-0 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                    {item.program} • {item.semester}
                  </span>
                </div>

                {/* Single Row: Room, Teacher, Time */}
                <div className="flex items-center justify-between gap-2 mt-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="whitespace-nowrap shrink-0 flex items-center gap-1 font-semibold text-slate-700">
                      <i className="fas fa-location-dot text-[10px] text-slate-400"></i>
                      <span>{item.room}</span>
                    </span>
                    <span className="text-slate-300 shrink-0">•</span>
                    <span className="whitespace-nowrap shrink-0 flex items-center gap-1 text-slate-600 font-medium">
                      <i className="fas fa-user-tie text-[10px] text-slate-400"></i>
                      <span>{item.teacher}</span>
                    </span>
                  </div>
                  <span className="whitespace-nowrap shrink-0 font-mono text-[10px] font-semibold text-slate-500 bg-white border border-slate-200/80 px-1.5 py-0.5 rounded">
                    {item.timeStart} - {item.timeEnd}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              Showing {scheduleData.filter((item) => {
                if (selectedScheduleFilter === 'all') return true;
                if (selectedScheduleFilter === 'teacher-sharma') return item.teacher.includes('Sharma');
                if (selectedScheduleFilter === 'teacher-mehta') return item.teacher.includes('Mehta');
                if (selectedScheduleFilter === 'teacher-verma') return item.teacher.includes('Verma');
                if (selectedScheduleFilter === 'teacher-gupta') return item.teacher.includes('Gupta');
                return item.classId === selectedScheduleFilter;
              }).length} lecture periods
            </span>
            <Link to="/admin/timetable" className="text-xs font-semibold text-[#6D4C9C] hover:text-purple-800 flex items-center gap-1">
              <span>Full Timetable</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              <InfoTooltip 
                title="Real-Time Audit Trail"
                text="Tamper-evident system activity log recording student admissions, fee collections, marks entry, and administrative logins."
                tip="Click 'View all' to open the complete SOC Audit Logs console."
              />
            </div>
            <Link to="/admin/audit-logs" className="text-xs font-medium text-slate-600 hover:text-[#6D4C9C] flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1 hover:bg-slate-50">
              View all <i className="fas fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${activity.iconBg} ${activity.iconColor} flex items-center justify-center shrink-0`}>
                    <i className={`fas ${activity.icon}`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.desc}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Action Center & Statutory Radar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Executive Action Center</h2>
                <InfoTooltip 
                  title="Administrative Decision Radar"
                  text="Centralized institutional inbox highlighting items requiring executive sign-off, statutory attendance gates (<75%), fee concession approvals, and DigiLocker credit uploads."
                  tip="Click any action button to immediately review, authorize, or sync clearances."
                />
              </div>

              {/* Segmented Switcher */}
              <div className="inline-flex p-1 bg-slate-100/80 rounded-xl text-xs font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActionTab('actions')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    actionTab === 'actions'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span>Action Required</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActionTab('milestones')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    actionTab === 'milestones'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <i className="fas fa-calendar-check text-[10px] text-purple-600"></i>
                  <span>Milestones</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-bold">3</span>
                </button>
              </div>
            </div>

            {/* Content List */}
            {actionTab === 'actions' ? (
              <div className="space-y-2.5">
                {pendingActions.map((act) => (
                  <div 
                    key={act.id} 
                    className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-purple-50/40 border border-slate-100 hover:border-purple-200 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${act.iconBg}`}>
                        <i className={`fas ${act.icon} text-xs`}></i>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 truncate">{act.title}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border whitespace-nowrap shrink-0 ${act.badgeColor}`}>
                            {act.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.desc}</p>
                      </div>
                    </div>
                    <Link
                      to={act.link}
                      className="whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#6D4C9C] text-slate-700 hover:text-white border border-slate-200 hover:border-[#6D4C9C] text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 group"
                    >
                      <span>{act.actionText}</span>
                      <i className="fas fa-arrow-right text-[9px] group-hover:translate-x-0.5 transition-transform"></i>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {campusMilestones.map((ms) => (
                  <div 
                    key={ms.id} 
                    className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-indigo-50/40 border border-slate-100 hover:border-indigo-200 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                        <span className="text-[9px] font-black text-purple-700 uppercase leading-none">{ms.date.split(' ')[0]}</span>
                        <span className="text-xs font-black text-slate-900 leading-tight">{ms.date.split(' ')[1].replace(',', '')}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 truncate">{ms.title}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border whitespace-nowrap shrink-0 ${ms.badgeColor}`}>
                            {ms.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="font-semibold text-purple-700 whitespace-nowrap">{ms.daysLeft}</span>
                          <span className="text-slate-300">•</span>
                          <span className="truncate">{ms.desc}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={ms.link}
                      className="whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#6D4C9C] text-slate-700 hover:text-white border border-slate-200 hover:border-[#6D4C9C] text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 group"
                    >
                      <span>{ms.actionText}</span>
                      <i className="fas fa-arrow-right text-[9px] group-hover:translate-x-0.5 transition-transform"></i>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              {actionTab === 'actions' ? 'All statutory gates active & monitored' : 'Upcoming academic calendar events'}
            </span>
            <Link to="/admin/circulars" className="text-xs font-semibold text-[#6D4C9C] hover:text-purple-800 flex items-center gap-1">
              <span>Notice Center</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
