import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';
import HallTicketModal from '../../components/exam/HallTicketModal';
import ReportCardModal from '../../components/exam/ReportCardModal';
import InfoTooltip from '../../components/common/InfoTooltip';

const DEFAULT_SUBJECTS = [
  {
    subjectCode: 'CS501',
    subjectName: 'Design & Analysis of Algorithms',
    credits: 4,
    courseCategory: 'Major',
    maxMarks: 100,
    examDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timeSlot: '09:30 AM - 12:30 PM',
    roomNumber: 'Hall 101 - Block A',
    courseOutcomes: ['CO1: Complexity', 'CO2: Dynamic Prog', 'CO3: Graphs']
  },
  {
    subjectCode: 'CS502',
    subjectName: 'Database Management Systems',
    credits: 4,
    courseCategory: 'Major',
    maxMarks: 100,
    examDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timeSlot: '09:30 AM - 12:30 PM',
    roomNumber: 'Hall 102 - Block A',
    courseOutcomes: ['CO1: Relational Model', 'CO2: Normalization', 'CO3: ACID']
  },
  {
    subjectCode: 'CS503',
    subjectName: 'Computer Networks & Security',
    credits: 3,
    courseCategory: 'Major',
    maxMarks: 100,
    examDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timeSlot: '09:30 AM - 12:30 PM',
    roomNumber: 'Hall 103 - Block B',
    courseOutcomes: ['CO1: OSI Reference', 'CO2: Routing', 'CO3: Cryptography']
  }
];

const ExamControllerPortal = () => {
  const { showToast, showLoading, hideLoading } = useOutletContext();

  // Active View Tab
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' | 'marks' | 'halltickets'

  // Stats
  const [stats, setStats] = useState({
    totalSchedules: 0,
    totalCandidates: 0,
    eligibleHallTickets: 0,
    resultsPublishedCount: 0,
    averageSgpa: '8.25',
    passPercentage: '94.2'
  });

  // Schedules state
  const [schedules, setSchedules] = useState([]);
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    examTitle: 'Autumn End-Semester Examinations 2026-27',
    examType: 'End-Semester',
    academicSession: '2026-27',
    department: 'Engineering & Technology',
    course: 'B.Tech Computer Science & Engineering',
    branch: 'Computer Science',
    semester: '5th Sem',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subjects: DEFAULT_SUBJECTS
  });

  // Students & Assessment Marks state
  const [students, setStudents] = useState([]);
  const [selectedStudentForMarks, setSelectedStudentForMarks] = useState(null);
  const [marksEntryRows, setMarksEntryRows] = useState([]);
  const [marksSemester, setMarksSemester] = useState('5th Sem');

  // Hall Tickets state
  const [hallTicketStudent, setHallTicketStudent] = useState(null);
  const [activeHallTicket, setActiveHallTicket] = useState(null);
  const [isHallTicketModalOpen, setIsHallTicketModalOpen] = useState(false);

  // Report Card Modal state
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState(false);

  // Question Papers & Sample Papers Archive State (Admin)
  const [adminPapers, setAdminPapers] = useState([]);
  const [loadingAdminPapers, setLoadingAdminPapers] = useState(false);
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');
  const [adminTypeFilter, setAdminTypeFilter] = useState('all');
  const [adminSearch, setAdminSearch] = useState('');
  const [isUploadingPaper, setIsUploadingPaper] = useState(false);
  const [newPaperForm, setNewPaperForm] = useState({
    category: 'college',
    title: '',
    paperType: 'Previous Year Exam Paper',
    examTerm: 'End-Semester',
    academicYear: '2024-25',
    course: 'B.Tech Computer Science & Engineering',
    semester: '5th Sem',
    targetClass: 'Class 10',
    stream: 'General',
    department: 'Engineering & Technology',
    subject: '',
    subjectCode: '',
    maxMarks: 100,
    durationMinutes: 180,
    pdfUrl: '',
    solutionUrl: '',
  });

  useEffect(() => {
    if (!isUploadingPaper) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsUploadingPaper(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUploadingPaper]);

  const fetchAdminPapers = async () => {
    setLoadingAdminPapers(true);
    try {
      const params = new URLSearchParams();
      if (adminCategoryFilter !== 'all') params.append('category', adminCategoryFilter);
      if (adminTypeFilter !== 'all') params.append('paperType', adminTypeFilter);
      if (adminSearch.trim()) params.append('search', adminSearch.trim());
      params.append('limit', '50');

      const res = await api.get(`/exam-papers?${params.toString()}`);
      if (res.data?.success) {
        setAdminPapers(res.data.data || []);
      }
    } catch (e) {
      console.error('Failed to load admin papers:', e);
    } finally {
      setLoadingAdminPapers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'papers') {
      fetchAdminPapers();
    }
  }, [activeTab, adminCategoryFilter, adminTypeFilter, adminSearch]);

  const handleCreatePaper = async (e) => {
    e.preventDefault();
    if (!newPaperForm.subject || !newPaperForm.title) {
      showToast('Please provide subject and paper title', 'error');
      return;
    }
    if (!newPaperForm.pdfUrl) {
      showToast('Please upload or specify a question paper PDF document', 'error');
      return;
    }
    showLoading('Uploading Question Paper...');
    try {
      const payload = {
        ...newPaperForm,
        pdfUrls: [newPaperForm.pdfUrl]
      };
      const res = await api.post('/exam-papers', payload);
      if (res.data?.success) {
        showToast('Question / Sample Paper uploaded successfully!', 'success');
        setIsUploadingPaper(false);
        setNewPaperForm({
          category: 'college',
          title: '',
          paperType: 'Previous Year Exam Paper',
          examTerm: 'End-Semester',
          academicYear: '2024-25',
          course: 'B.Tech Computer Science & Engineering',
          semester: '5th Sem',
          targetClass: 'Class 10',
          stream: 'General',
          department: 'Engineering & Technology',
          subject: '',
          subjectCode: '',
          maxMarks: 100,
          durationMinutes: 180,
          pdfUrl: '',
          solutionUrl: '',
          fileSize: '1.5 MB'
        });
        fetchAdminPapers();
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to upload paper', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleDeletePaper = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/exam-papers/${id}`);
      showToast('Exam paper deleted successfully', 'success');
      fetchAdminPapers();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to delete paper', 'error');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchSchedules();
    fetchStudents();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/exams/stats');
      if (res.data?.stats) setStats(res.data.stats);
    } catch (e) {
      console.error('Failed to load exam stats:', e);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/exams/schedules');
      setSchedules(res.data?.data || []);
    } catch (e) {
      console.error('Failed to load schedules:', e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      const list = Array.isArray(res.data) ? res.data : (res.data?.students || []);
      setStudents(list);
    } catch (e) {
      console.error('Failed to load students:', e);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      showLoading('Publishing Examination Schedule...');
      const res = await api.post('/exams/schedules', newSchedule);
      showToast('Examination schedule published successfully!', 'success');
      setIsCreatingSchedule(false);
      fetchSchedules();
      fetchStats();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create schedule', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleSelectStudentForMarks = (student) => {
    setSelectedStudentForMarks(student);
    setMarksSemester(student.currentClass?.semester || '5th Sem');
    // Pre-populate marks rows
    setMarksEntryRows([
      {
        subjectCode: 'CS501',
        subjectName: 'Design & Analysis of Algorithms',
        credits: 4,
        internalMarks: 25,
        theoryMarks: 65,
        maxMarks: 100
      },
      {
        subjectCode: 'CS502',
        subjectName: 'Database Management Systems',
        credits: 4,
        internalMarks: 28,
        theoryMarks: 60,
        maxMarks: 100
      },
      {
        subjectCode: 'CS503',
        subjectName: 'Computer Networks & Security',
        credits: 3,
        internalMarks: 22,
        theoryMarks: 58,
        maxMarks: 100
      }
    ]);
  };

  const handleSaveMarks = async (e) => {
    e.preventDefault();
    if (!selectedStudentForMarks) return;

    try {
      showLoading('Computing UGC Grades & Publishing Result...');
      const payload = {
        studentId: selectedStudentForMarks.studentId,
        course: selectedStudentForMarks.currentClass?.course || selectedStudentForMarks.college || 'B.Tech',
        semester: marksSemester,
        subjectScores: marksEntryRows
      };

      const res = await api.post('/exams/assessments', payload);
      showToast('Assessment marks and UGC grades saved successfully!', 'success');
      fetchStats();

      // Open report card preview
      if (res.data?.assessment) {
        setActiveAssessment(res.data.assessment);
        setIsReportCardModalOpen(true);
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save assessment', 'error');
    } finally {
      hideLoading();
    }
  };

  const handlePreviewHallTicket = async (student) => {
    try {
      showLoading('Generating Dynamic Hall Ticket...');
      const res = await api.get(`/exams/hall-ticket?studentId=${student.studentId}`);
      if (res.data?.hallTicket) {
        setActiveHallTicket(res.data.hallTicket);
        setIsHallTicketModalOpen(true);
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to generate hall ticket', 'error');
    } finally {
      hideLoading();
    }
  };

  const handlePreviewTranscript = async (student) => {
    try {
      showLoading('Fetching Semester Transcript...');
      const res = await api.get(`/exams/assessments?studentId=${student.studentId}`);
      if (res.data?.data && res.data.data.length > 0) {
        setActiveAssessment(res.data.data[res.data.data.length - 1]);
        setIsReportCardModalOpen(true);
      } else {
        showToast('No finalized exam assessment found in database for ' + (student.name || student.studentId) + '. Use Grade Entry to record one.', 'info');
      }
    } catch (err) {
      showToast('Error retrieving transcript', 'error');
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="space-y-6 animate-[modalFadeIn_0.3s_ease] pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-6 shadow-lg border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 text-white/5 text-9xl pointer-events-none">
          <i className="fas fa-award"></i>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider border border-indigo-500/30">
                Phase 7 • Academic Assessment Engine
              </span>
              <span className="text-xs text-purple-200/80">
                <i className="fas fa-check-double text-emerald-400 mr-1"></i> Outcome-Based Education (OBE) & UGC CBCS
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Examination Controller & Evaluation Console
            </h1>
            <p className="text-xs md:text-sm text-purple-200/80 mt-1 max-w-2xl">
              End-to-end examination timetables, UGC 10-point scale marks entry, SGPA/CGPA computation, and dynamic QR hall tickets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreatingSchedule(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <i className="fas fa-plus-circle"></i> Create Exam Timetable
            </button>
          </div>
        </div>
      </div>

      {/* 4-Card Executive Examination KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Timetables</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {schedules.length > 0 ? schedules.length : 3}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
              <i className="fas fa-calendar-alt"></i>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Active Session 2026-27
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Candidates</span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {students.length}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#6D4C9C] flex items-center justify-center text-lg">
              <i className="fas fa-user-graduate"></i>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Hall Tickets Eligible:</span>
            <span className="font-bold text-emerald-600">{stats.eligibleHallTickets || students.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average SGPA</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {stats.averageSgpa}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <i className="fas fa-chart-line"></i>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            UGC 10.0 Scale • NCrF Level 6.0
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Pass Rate</span>
              <div className="text-2xl font-black text-blue-600 mt-1">
                {stats.passPercentage}%
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <i className="fas fa-trophy"></i>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.passPercentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'schedules', name: 'Exam Schedules & Timetables', icon: 'fa-calendar-check' },
          { id: 'marks', name: 'Marks Entry & OBE Evaluation', icon: 'fa-pen-to-square' },
          { id: 'halltickets', name: 'Hall Tickets & Eligibility Gate', icon: 'fa-id-card' },
          { id: 'papers', name: 'PYQ & Sample Papers Bank', icon: 'fa-file-invoice' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Schedules & Timetables */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          {/* Create Modal / Form if active */}
          {isCreatingSchedule && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-[modalFadeIn_0.2s_ease]">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h3 className="font-bold text-slate-900 text-base">New Examination Timetable</h3>
                <button onClick={() => setIsCreatingSchedule(false)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleCreateSchedule} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Exam Title *</label>
                    <input
                      type="text"
                      required
                      value={newSchedule.examTitle}
                      onChange={e => setNewSchedule({ ...newSchedule, examTitle: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Course / Degree *</label>
                    <input
                      type="text"
                      required
                      value={newSchedule.course}
                      onChange={e => setNewSchedule({ ...newSchedule, course: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Semester / Term *</label>
                    <input
                      type="text"
                      required
                      value={newSchedule.semester}
                      onChange={e => setNewSchedule({ ...newSchedule, semester: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={newSchedule.startDate}
                      onChange={e => setNewSchedule({ ...newSchedule, startDate: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={newSchedule.endDate}
                      onChange={e => setNewSchedule({ ...newSchedule, endDate: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingSchedule(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Publish Schedule
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Schedules Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(schedules.length > 0 ? schedules : [
              {
                _id: '1',
                examTitle: 'Autumn End-Semester Examinations 2026-27',
                course: 'B.Tech Computer Science & Engineering',
                semester: '5th Sem',
                examType: 'End-Semester',
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                subjects: DEFAULT_SUBJECTS
              }
            ]).map(sch => (
              <div key={sch._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-200">
                      {sch.examType || 'End-Semester'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(sch.startDate).toLocaleDateString()} - {new Date(sch.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{sch.examTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{sch.course} • {sch.semester}</p>

                  <div className="mt-4 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Timetable Matrix:</span>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                      {(sch.subjects || DEFAULT_SUBJECTS).map((sub, sIdx) => (
                        <div key={sIdx} className="p-2.5 bg-slate-50/50 flex items-center justify-between">
                          <div>
                            <span className="font-mono font-bold text-indigo-900 mr-2">{sub.subjectCode}</span>
                            <span className="font-medium text-slate-800">{sub.subjectName}</span>
                          </div>
                          <span className="text-[11px] text-slate-500">{sub.roomNumber || 'Hall 1'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-emerald-600 font-semibold">
                    <i className="fas fa-check-circle mr-1"></i> Published to Students
                  </span>
                  <button
                    onClick={() => {
                      if (students.length > 0) handlePreviewHallTicket(students[0]);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <i className="fas fa-id-card"></i> Preview Hall Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Marks Entry & OBE Evaluation */}
      {activeTab === 'marks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Student List (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <i className="fas fa-users text-indigo-600"></i> Select Candidate for Marks Entry
            </h3>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto border border-slate-200 rounded-xl">
              {students.map(s => (
                <div
                  key={s._id}
                  onClick={() => handleSelectStudentForMarks(s)}
                  className={`p-3 cursor-pointer transition flex items-center justify-between ${
                    selectedStudentForMarks?._id === s._id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{s.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">ID: {s.studentId}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-600">
                    {s.currentClass?.semester || 'Sem 5'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Marks Console (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {selectedStudentForMarks ? (
              <form onSubmit={handleSaveMarks} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedStudentForMarks.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      ID: {selectedStudentForMarks.studentId} • {selectedStudentForMarks.currentClass?.course || 'B.Tech'} ({marksSemester})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreviewTranscript(selectedStudentForMarks)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <i className="fas fa-file-invoice"></i> View Transcript
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">Course Code</th>
                        <th className="p-3">Course Name</th>
                        <th className="p-3 text-center">Internal (30)</th>
                        <th className="p-3 text-center">Theory (70)</th>
                        <th className="p-3 text-center">Total (100)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {marksEntryRows.map((row, idx) => {
                        const tot = (Number(row.internalMarks) || 0) + (Number(row.theoryMarks) || 0);
                        return (
                          <tr key={idx}>
                            <td className="p-3 font-mono font-bold text-slate-800">{row.subjectCode}</td>
                            <td className="p-3 font-medium text-slate-900">{row.subjectName}</td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max="30"
                                value={row.internalMarks}
                                onChange={e => {
                                  const updated = [...marksEntryRows];
                                  updated[idx].internalMarks = Number(e.target.value);
                                  setMarksEntryRows(updated);
                                }}
                                className="w-16 p-1 bg-slate-50 border rounded text-center font-bold"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max="70"
                                value={row.theoryMarks}
                                onChange={e => {
                                  const updated = [...marksEntryRows];
                                  updated[idx].theoryMarks = Number(e.target.value);
                                  setMarksEntryRows(updated);
                                }}
                                className="w-16 p-1 bg-slate-50 border rounded text-center font-bold"
                              />
                            </td>
                            <td className="p-3 text-center font-black text-slate-900">{tot}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-check-double"></i> Compute SGPA & Save Evaluation
                </button>
              </form>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <i className="fas fa-user-pen text-4xl mb-3 block text-slate-300"></i>
                Select a candidate from the left panel to record examination marks and compute Outcome-Based Education attainment.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Hall Tickets & Eligibility Gate */}
      {activeTab === 'halltickets' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <i className="fas fa-id-card text-indigo-600"></i> Candidate Hall Tickets & Eligibility Gatekeeper
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory attendance threshold (&ge; 75%) and financial clearance gate.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Course / Branch</th>
                  <th className="p-3 text-center">Attendance (%)</th>
                  <th className="p-3 text-center">Fee Status</th>
                  <th className="p-3 text-center">Gate Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(s => {
                  const att = Number(s.attendance) || 85;
                  const totalFee = Number(s.feeDetails?.totalAmount) || 0;
                  const paidFee = Number(s.feeDetails?.paidAmount) || 0;
                  const dues = Math.max(0, totalFee - paidFee);

                  const isEligible = att >= 75;

                  return (
                    <tr key={s._id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {s.studentId}</div>
                      </td>
                      <td className="p-3 font-medium text-slate-700">
                        {s.currentClass?.course || s.college || 'Higher Ed'}
                      </td>
                      <td className="p-3 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${att >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {att}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {dues === 0 ? (
                          <span className="text-emerald-700 font-bold text-[10px]">Cleared</span>
                        ) : (
                          <span className="text-amber-700 font-medium text-[10px]">Due: ₹{dues}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isEligible ? 'ADMITTED' : 'CONDITIONAL'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handlePreviewHallTicket(s)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer"
                        >
                          <i className="fas fa-print"></i> Print Hall Ticket
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Question Papers & Sample Papers Bank */}
      {activeTab === 'papers' && (
        <div className="space-y-6 animate-[modalFadeIn_0.2s_ease]">
          {/* Header & Controls */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[#5B21B6] text-xs font-bold border border-purple-200">
                  Examination & Practice Bank
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {adminPapers.length} Total Registered Papers
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <i className="fas fa-file-invoice text-[#6D4C9C]"></i> Question Papers & Sample Papers Archive
                <InfoTooltip 
                  title="Question Papers & Sample Papers Bank" 
                  text="Maintain official previous year examination papers (PYQs), sample model practice tests, and answer keys organized by course/semester for colleges and class-wise for schools." 
                  position="bottom" 
                />
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload and manage university/school question papers, model practice question sheets, and marking schemes.
              </p>
            </div>

            <button
              onClick={() => setIsUploadingPaper(true)}
              className="px-4 py-2.5 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer self-start md:self-center"
            >
              <i className="fas fa-plus"></i> Upload Question / Sample Paper
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Papers</span>
              <span className="text-2xl font-black text-slate-900">{adminPapers.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">College Papers</span>
              <span className="text-2xl font-black text-[#6D4C9C]">
                {adminPapers.filter(p => p.category === 'college').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">School Papers</span>
              <span className="text-2xl font-black text-emerald-600">
                {adminPapers.filter(p => p.category === 'school').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Student Downloads</span>
              <span className="text-2xl font-black text-blue-600">
                {adminPapers.reduce((sum, p) => sum + (p.downloadsCount || 0), 0)}
              </span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All Institutions' },
                  { id: 'college', label: 'College / Degree' },
                  { id: 'school', label: 'School / Classes' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setAdminCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      adminCategoryFilter === cat.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'Previous Year Exam Paper', label: 'PYQ' },
                  { id: 'Sample / Model Paper', label: 'Sample' },
                  { id: 'Pre-Board Exam Paper', label: 'Pre-Board' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setAdminTypeFilter(type.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      adminTypeFilter === type.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <i className="fas fa-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
              <input
                type="text"
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search subject or title..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4C9C]"
              />
            </div>
          </div>

          {/* Papers Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loadingAdminPapers ? (
              <div className="p-12 text-center text-slate-500">
                <i className="fas fa-spinner fa-spin text-2xl mb-2 text-[#6D4C9C]"></i>
                <p className="text-xs font-bold">Loading examination papers archive...</p>
              </div>
            ) : adminPapers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <i className="fas fa-folder-open text-3xl mb-2 text-slate-300"></i>
                <p className="text-sm font-bold text-slate-700">No question papers match current filters</p>
                <p className="text-xs text-slate-400 mt-1">Upload a new paper or adjust search filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Subject & Code</th>
                      <th className="py-3.5 px-4">Academic Scope</th>
                      <th className="py-3.5 px-4">Format & Term</th>
                      <th className="py-3.5 px-4">Year</th>
                      <th className="py-3.5 px-4">Downloads</th>
                      <th className="py-3.5 px-4">Solution Key</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminPapers.map(paper => (
                      <tr key={paper._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{paper.subject}</span>
                            {paper.subjectCode && (
                              <span className="font-mono text-[10px] bg-purple-50 text-[#6D4C9C] px-1.5 py-0.5 rounded border border-purple-200">
                                {paper.subjectCode}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-normal text-slate-500 truncate max-w-xs mt-0.5">
                            {paper.title}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-semibold block">
                            {paper.category === 'school' ? paper.targetClass : paper.course}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {paper.category === 'school' ? paper.stream : paper.semester}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 block">{paper.paperType}</span>
                          <span className="text-[11px] text-slate-500">{paper.examTerm}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                          {paper.academicYear}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">
                          <i className="fas fa-download mr-1 text-[10px]"></i>
                          {paper.downloadsCount || 0}
                        </td>
                        <td className="py-3.5 px-4">
                          {paper.solutionUrl ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                              <i className="fas fa-check"></i> Available
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              None
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {paper.pdfUrls && paper.pdfUrls[0] && (
                              <a
                                href={paper.pdfUrls[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
                                title="View Paper PDF"
                              >
                                <i className="fas fa-eye text-xs"></i>
                              </a>
                            )}
                            {paper.solutionUrl && (
                              <a
                                href={paper.solutionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition cursor-pointer"
                                title="View Solution PDF"
                              >
                                <i className="fas fa-key text-xs"></i>
                              </a>
                            )}
                            <button
                              onClick={() => handleDeletePaper(paper._id, paper.title)}
                              className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition cursor-pointer"
                              title="Delete Paper"
                            >
                              <i className="fas fa-trash text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Upload Paper Modal */}
          {isUploadingPaper && createPortal(
            <div 
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto"
              onClick={(e) => { if (e.target === e.currentTarget) setIsUploadingPaper(false); }}
            >
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[88vh] my-auto flex flex-col overflow-hidden border border-slate-200 animate-[modalFadeIn_0.2s_ease]">
                <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">Upload Examination / Sample Paper</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Attach question papers and model answer keys for students</p>
                  </div>
                  <button onClick={() => setIsUploadingPaper(false)} className="text-slate-400 hover:text-white">
                    <i className="fas fa-times text-lg"></i>
                  </button>
                </div>

                <form onSubmit={handleCreatePaper} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  {/* Category Radio (College vs School) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Institution Category *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition ${newPaperForm.category === 'college' ? 'bg-purple-50 border-[#6D4C9C] text-[#6D4C9C]' : 'border-slate-200 text-slate-700'}`}>
                        <input
                          type="radio"
                          name="category"
                          value="college"
                          checked={newPaperForm.category === 'college'}
                          onChange={() => setNewPaperForm({ ...newPaperForm, category: 'college' })}
                          className="text-[#6D4C9C]"
                        />
                        <i className="fas fa-graduation-cap"></i>
                        <span>College / Degree (Course & Sem)</span>
                      </label>
                      <label className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition ${newPaperForm.category === 'school' ? 'bg-purple-50 border-[#6D4C9C] text-[#6D4C9C]' : 'border-slate-200 text-slate-700'}`}>
                        <input
                          type="radio"
                          name="category"
                          value="school"
                          checked={newPaperForm.category === 'school'}
                          onChange={() => setNewPaperForm({ ...newPaperForm, category: 'school' })}
                          className="text-[#6D4C9C]"
                        />
                        <i className="fas fa-school"></i>
                        <span>School / K-12 (Class-wise)</span>
                      </label>
                    </div>
                  </div>

                  {/* College or School Specific Row */}
                  {newPaperForm.category === 'college' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Course *</label>
                        <input
                          type="text"
                          value={newPaperForm.course}
                          onChange={e => setNewPaperForm({ ...newPaperForm, course: e.target.value })}
                          placeholder="e.g. B.Tech Computer Science & Engineering"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6D4C9C]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Semester *</label>
                        <input
                          type="text"
                          value={newPaperForm.semester}
                          onChange={e => setNewPaperForm({ ...newPaperForm, semester: e.target.value })}
                          placeholder="e.g. 5th Sem, 1st Sem"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6D4C9C]"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Target Class *</label>
                        <input
                          type="text"
                          value={newPaperForm.targetClass}
                          onChange={e => setNewPaperForm({ ...newPaperForm, targetClass: e.target.value })}
                          placeholder="e.g. Class 10, Class 12"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6D4C9C]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Stream *</label>
                        <input
                          type="text"
                          value={newPaperForm.stream}
                          onChange={e => setNewPaperForm({ ...newPaperForm, stream: e.target.value })}
                          placeholder="e.g. Science (PCM), Commerce, General"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6D4C9C]"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Subject and Subject Code */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
                      <input
                        type="text"
                        value={newPaperForm.subject}
                        onChange={e => setNewPaperForm({ ...newPaperForm, subject: e.target.value })}
                        placeholder="e.g. Operating Systems, Mathematics Standard"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6D4C9C]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code</label>
                      <input
                        type="text"
                        value={newPaperForm.subjectCode}
                        onChange={e => setNewPaperForm({ ...newPaperForm, subjectCode: e.target.value })}
                        placeholder="e.g. CS502, MATH-041"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6D4C9C]"
                      />
                    </div>
                  </div>

                  {/* Paper Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Paper Descriptive Title *</label>
                    <input
                      type="text"
                      value={newPaperForm.title}
                      onChange={e => setNewPaperForm({ ...newPaperForm, title: e.target.value })}
                      placeholder="e.g. Operating Systems - End-Semester Exam Paper 2024"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6D4C9C]"
                      required
                    />
                  </div>

                  {/* Type, Term, Year */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Format Type *</label>
                      <select
                        value={newPaperForm.paperType}
                        onChange={e => setNewPaperForm({ ...newPaperForm, paperType: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      >
                        <option value="Previous Year Exam Paper">Previous Year (PYQ)</option>
                        <option value="Sample / Model Paper">Sample / Model Paper</option>
                        <option value="Pre-Board Exam Paper">Pre-Board Exam Paper</option>
                        <option value="Mid-Term Paper">Mid-Term Paper</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Exam Term</label>
                      <select
                        value={newPaperForm.examTerm}
                        onChange={e => setNewPaperForm({ ...newPaperForm, examTerm: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      >
                        <option value="End-Semester">End-Semester</option>
                        <option value="Annual Final">Annual Final</option>
                        <option value="Pre-Board">Pre-Board</option>
                        <option value="Mid-Term / Sessional">Mid-Term / Sessional</option>
                        <option value="Model Practice">Model Practice</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year *</label>
                      <input
                        type="text"
                        value={newPaperForm.academicYear}
                        onChange={e => setNewPaperForm({ ...newPaperForm, academicYear: e.target.value })}
                        placeholder="e.g. 2024-25"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Marks & Duration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Max Marks</label>
                      <input
                        type="number"
                        value={newPaperForm.maxMarks}
                        onChange={e => setNewPaperForm({ ...newPaperForm, maxMarks: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                      <input
                        type="number"
                        value={newPaperForm.durationMinutes}
                        onChange={e => setNewPaperForm({ ...newPaperForm, durationMinutes: Number(e.target.value) })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  {/* PDF URLs */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Question Paper PDF Link / URL</label>
                    <input
                      type="url"
                      value={newPaperForm.pdfUrl}
                      onChange={e => setNewPaperForm({ ...newPaperForm, pdfUrl: e.target.value })}
                      placeholder="https://.../question-paper.pdf (or leave blank for sample PDF)"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Answer Key / Solution PDF Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={newPaperForm.solutionUrl}
                      onChange={e => setNewPaperForm({ ...newPaperForm, solutionUrl: e.target.value })}
                      placeholder="https://.../marking-scheme.pdf"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsUploadingPaper(false)}
                      className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                    >
                      Save & Publish Paper
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}
        </div>
      )}

      {/* Hall Ticket Modal */}
      <HallTicketModal
        isOpen={isHallTicketModalOpen}
        onClose={() => setIsHallTicketModalOpen(false)}
        hallTicket={activeHallTicket}
      />

      {/* Report Card Modal */}
      <ReportCardModal
        isOpen={isReportCardModalOpen}
        onClose={() => setIsReportCardModalOpen(false)}
        assessment={activeAssessment}
        student={selectedStudentForMarks}
      />
    </div>
  );
};

export default ExamControllerPortal;
