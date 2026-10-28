import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import InfoTooltip from '../../components/common/InfoTooltip';

const ErpAttendanceManager = () => {
  const { showToast, showLoading, hideLoading } = useOutletContext();
  const [classesList, setClassesList] = useState([]);
  
  // Selection states
  const [selectedClass, setSelectedClass] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const sessions = [`${currentYear-1}-${currentYear}`, `${currentYear}-${currentYear+1}`, `${currentYear+1}-${currentYear+2}`];

  const selectedClassObj = classesList.find(c => `${c.courseName} - ${c.semester}` === selectedClass);
  const subjectsList = selectedClassObj?.subjects || [];

  useEffect(() => {
    fetchClasses();
    // Default to current month and current session
    const curMonthIdx = new Date().getMonth();
    setSelectedMonth(months[curMonthIdx]);
    setSelectedSession(`${currentYear}-${currentYear+1}`);
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('cms_token');
      const { data } = await axios.get('/api/v1/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClassesList(data.data.filter(c => c.isActive));
    } catch (error) {
      console.error('Failed to fetch classes');
    }
  };

  const handleFetchStudents = async () => {
    const currentMonthStr = `${selectedMonth} ${selectedSession}`;
    if (!selectedClass || !subject || !selectedMonth || !selectedSession) {
      showToast('Please select Class, Subject, Month and Session first.', 'error');
      return;
    }

    try {
      showLoading('Fetching class register...');
      const token = localStorage.getItem('cms_token');
      const { data } = await axios.get(`/api/v1/attendance/students?classString=${encodeURIComponent(selectedClass)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStudents(data);
      
      // Initialize attendance data from existing records if any
      const initialData = {};
      data.forEach(student => {
        const existingRecord = student.attendanceRecords?.find(
          r => r.subject === subject && r.month === currentMonthStr
        );
        initialData[student._id] = {
          totalClasses: existingRecord ? existingRecord.totalClasses : 30,
          attendedClasses: existingRecord ? existingRecord.attendedClasses : 26
        };
      });
      setAttendanceData(initialData);
      
      if (data.length === 0) {
        showToast('No students enrolled in this class yet.', 'error');
      } else {
        showToast(`Loaded ${data.length} students successfully`, 'success');
      }
    } catch (error) {
      showToast('Failed to fetch students', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleInputChange = (studentId, field, value) => {
    const val = Math.max(0, parseInt(value) || 0);
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: val
      }
    }));
  };

  const handleStep = (studentId, delta) => {
    setAttendanceData(prev => {
      const current = prev[studentId] || { totalClasses: 30, attendedClasses: 0 };
      const newAttended = Math.min(current.totalClasses, Math.max(0, current.attendedClasses + delta));
      return {
        ...prev,
        [studentId]: {
          ...current,
          attendedClasses: newAttended
        }
      };
    });
  };

  const handleApplyToAll = (field, value) => {
    const val = Math.max(0, parseInt(value) || 0);
    setAttendanceData(prev => {
      const newData = { ...prev };
      Object.keys(newData).forEach(id => {
        newData[id] = { ...newData[id], [field]: val };
      });
      return newData;
    });
    showToast(`Updated ${field === 'totalClasses' ? 'Total Classes' : 'Attended'} for all students`, 'success');
  };

  const handleMarkAllFull = () => {
    setAttendanceData(prev => {
      const newData = { ...prev };
      Object.keys(newData).forEach(id => {
        newData[id] = {
          ...newData[id],
          attendedClasses: newData[id].totalClasses || 30
        };
      });
      return newData;
    });
    showToast('Marked all students as 100% Present', 'success');
  };

  const handleSubmit = async () => {
    if (students.length === 0) return;
    
    // Validate
    for (const id in attendanceData) {
      if (attendanceData[id].attendedClasses > attendanceData[id].totalClasses) {
        showToast('Attended classes cannot be greater than Total classes held.', 'error');
        return;
      }
    }

    try {
      showLoading('Saving Attendance...');
      const token = localStorage.getItem('cms_token');
      
      const currentMonthStr = `${selectedMonth} ${selectedSession}`;
      const records = students.map(student => ({
        studentId: student._id,
        subject,
        month: currentMonthStr,
        totalClasses: attendanceData[student._id].totalClasses,
        attendedClasses: attendanceData[student._id].attendedClasses
      }));

      await axios.put('/api/v1/attendance/bulk', { records }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('Attendance register saved successfully!');
    } catch (error) {
      showToast('Failed to save attendance', 'error');
    } finally {
      hideLoading();
    }
  };

  // Compute live aggregates
  const totalStudentsCount = students.length;
  let eligibleCount = 0;
  let shortageCount = 0;
  let totalPercentSum = 0;

  students.forEach(s => {
    const total = attendanceData[s._id]?.totalClasses || 0;
    const attended = attendanceData[s._id]?.attendedClasses || 0;
    const pct = total > 0 ? (attended / total) * 100 : 0;
    totalPercentSum += pct;
    if (pct >= 75) eligibleCount++;
    else shortageCount++;
  });

  const avgAttendance = totalStudentsCount > 0 ? (totalPercentSum / totalStudentsCount).toFixed(1) : 0;

  return (
    <div className="space-y-8 animate-[modalFadeIn_0.3s_ease] pb-16 max-w-7xl mx-auto">
      {/* Header Banner with Rich Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-6 md:p-10 shadow-2xl border border-indigo-800/40">
        <div className="absolute -right-8 -bottom-8 text-white/5 text-9xl pointer-events-none select-none">
          <i className="fas fa-clipboard-user"></i>
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-purple-200 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Academics & Daily Roll Call</span>
            <InfoTooltip
              title="Attendance Portal"
              text="Track daily or monthly attendance. Records automatically determine exam hall ticket eligibility (minimum 75% required)."
              tip="Use the 1-click 'Mark All Present' to save time during morning roll call."
            />
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-snug">
            Student Attendance Register
          </h1>
          <p className="text-sm md:text-base text-purple-200/90 mt-2 font-normal leading-relaxed">
            Select your class batch, subject, and month below to view or update attendance numbers. Big buttons make it comfortable on laptops, tablets, or phones.
          </p>
        </div>
      </div>

      {/* Class Selection & Filter Card (Large, Breathable Controls) */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6D4C9C] flex items-center justify-center text-sm font-bold shadow-2xs">
            <i className="fas fa-filter"></i>
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Select Class & Subject Details
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Choose the program batch and subject you want to record attendance for
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Target Class */}
          <div>
            <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Target Class</span>
              <InfoTooltip
                title="Target Class"
                text="The degree and semester batch you want to take attendance for (e.g. B.Tech Computer Science - Semester 3)."
              />
            </label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSubject('');
              }}
              className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-purple-400/20 focus:outline-none transition shadow-2xs"
            >
              <option value="">Select a class...</option>
              {classesList.map(c => (
                <option key={c._id} value={`${c.courseName} - ${c.semester}`}>
                  {c.courseName} - {c.semester}
                </option>
              ))}
            </select>
          </div>
          
          {/* Subject */}
          <div>
            <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Subject / Course</span>
              <InfoTooltip
                title="Subject Course"
                text="The specific theory or practical subject taught in this session."
              />
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!selectedClass}
              className={`w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-purple-400/20 focus:outline-none transition shadow-2xs ${
                !selectedClass ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">{selectedClass ? 'Select a subject...' : 'Choose class first...'}</option>
              {subjectsList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Month</span>
              <InfoTooltip
                title="Month"
                text="The calendar month for recording this attendance period."
              />
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-purple-400/20 focus:outline-none transition shadow-2xs"
            >
              <option value="">Choose month...</option>
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div>
            <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Academic Year / Session</span>
              <InfoTooltip
                title="Academic Session"
                text="The academic calendar year (e.g. 2025-2026)."
              />
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-purple-400/20 focus:outline-none transition shadow-2xs"
            >
              <option value="">Choose session...</option>
              {sessions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Ready to record attendance? Click below to load all enrolled students in this batch.
          </p>

          <button 
            onClick={handleFetchStudents}
            className="px-6 py-3.5 bg-gradient-to-r from-[#6D4C9C] via-[#7C3AED] to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-purple-500/25 flex items-center gap-2.5 transition active:scale-95 cursor-pointer"
          >
            <i className="fas fa-search text-xs"></i>
            <span>Load Class Register</span>
          </button>
        </div>
      </div>

      {/* Attendance Register & Table Section */}
      {students.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          {/* Header & Quick Aggregates */}
          <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-purple-50/50 via-slate-50/50 to-indigo-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#6D4C9C] text-xs font-bold uppercase tracking-wider">
                  Live Class Register
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedMonth} {selectedSession}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {selectedClass} &bull; {subject}
              </h2>
            </div>

            {/* Stats Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Students:</span>
                <span className="font-black text-slate-900 text-sm">{totalStudentsCount}</span>
              </div>

              <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs flex items-center gap-2 text-xs">
                <i className="fas fa-circle-check text-emerald-600"></i>
                <span className="font-bold">≥75% Clear: {eligibleCount}</span>
              </div>

              {shortageCount > 0 && (
                <div className="px-3.5 py-2 rounded-2xl bg-red-50 border border-red-200 text-red-800 shadow-2xs flex items-center gap-2 text-xs">
                  <i className="fas fa-triangle-exclamation text-red-600"></i>
                  <span className="font-bold">Shortage: {shortageCount}</span>
                </div>
              )}

              <button 
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition active:scale-95 cursor-pointer ml-auto md:ml-0"
              >
                <i className="fas fa-save text-xs"></i>
                <span>Save All Records</span>
              </button>
            </div>
          </div>
          
          {/* Quick Bulk Actions Toolbar */}
          <div className="p-4 md:p-5 bg-purple-50/60 border-b border-purple-100/70 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
              <i className="fas fa-bolt text-[#6D4C9C] text-sm"></i>
              <span>Quick Shortcuts:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs">
                <span className="text-xs text-slate-600 font-medium">Set Total Classes Held:</span>
                <input 
                  type="number" 
                  id="bulkTotal"
                  defaultValue="30"
                  min="1"
                  className="w-16 px-2 py-0.5 border border-slate-200 rounded-lg text-xs font-bold text-center focus:ring-2 focus:ring-purple-400 outline-none"
                />
                <button 
                  onClick={() => handleApplyToAll('totalClasses', document.getElementById('bulkTotal').value)}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-[#6D4C9C] rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Apply to All
                </button>
              </div>

              <button 
                onClick={handleMarkAllFull}
                className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <i className="fas fa-check-double text-[11px]"></i>
                <span>Mark Everyone 100% Present</span>
              </button>
            </div>
          </div>

          {/* Interactive Student Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Roll / Student ID</th>
                  <th className="py-4 px-6">Student Full Name</th>
                  <th className="py-4 px-6 text-center w-48">Total Classes Held</th>
                  <th className="py-4 px-6 text-center w-56">Classes Attended</th>
                  <th className="py-4 px-6 text-center w-48">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, idx) => {
                  const total = attendanceData[s._id]?.totalClasses || 0;
                  const attended = attendanceData[s._id]?.attendedClasses || 0;
                  const percentage = total > 0 ? ((attended / total) * 100).toFixed(1) : 0;
                  const isEligible = percentage >= 75;
                  
                  return (
                    <tr key={s._id} className="hover:bg-purple-50/30 transition-colors">
                      {/* Roll Number */}
                      <td className="py-4 px-6 text-sm font-bold text-slate-800 font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
                          {s.studentId}
                        </span>
                      </td>

                      {/* Name with Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D4C9C] to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                            {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 block leading-tight">
                              {s.name}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {s.email || 'Enrolled Student'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total Classes */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center justify-center">
                          <input 
                            type="number"
                            min="0"
                            value={total}
                            onChange={(e) => handleInputChange(s._id, 'totalClasses', e.target.value)}
                            className="w-20 px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8B5CF6] outline-none text-center text-sm font-bold bg-white shadow-2xs"
                          />
                        </div>
                      </td>

                      {/* Attended Classes with Big Stepper Buttons */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleStep(s._id, -1)}
                            title="Decrease attendance"
                            className="w-8 h-8 rounded-xl bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 font-black text-sm flex items-center justify-center border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
                          >
                            -
                          </button>
                          
                          <input 
                            type="number"
                            min="0"
                            max={total}
                            value={attended}
                            onChange={(e) => handleInputChange(s._id, 'attendedClasses', e.target.value)}
                            className={`w-16 px-2 py-1 text-center font-black text-sm rounded-lg outline-none bg-white ${
                              attended > total ? 'text-red-600 ring-2 ring-red-400' : 'text-slate-900'
                            }`}
                          />

                          <button
                            type="button"
                            onClick={() => handleStep(s._id, 1)}
                            title="Increase attendance"
                            className="w-8 h-8 rounded-xl bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 font-black text-sm flex items-center justify-center border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Percentage & Progress Bar */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center justify-between w-full max-w-[130px] text-xs font-bold">
                            <span className={isEligible ? 'text-emerald-700' : 'text-red-700'}>
                              {percentage}%
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                              isEligible 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {isEligible ? 'Eligible' : 'Shortage'}
                            </span>
                          </div>

                          <div className="w-full max-w-[130px] h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                isEligible 
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                  : 'bg-gradient-to-r from-red-500 to-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Save Action */}
          <div className="p-6 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
              <i className="fas fa-shield-check text-emerald-600 text-sm"></i>
              <span>All records automatically link with the Examination Hall Ticket eligibility engine.</span>
            </div>

            <button 
              onClick={handleSubmit}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center gap-2.5 transition active:scale-95 cursor-pointer"
            >
              <i className="fas fa-check-circle text-base"></i>
              <span>Submit & Save Attendance</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErpAttendanceManager;
