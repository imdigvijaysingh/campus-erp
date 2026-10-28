import React, { useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import CascadingDropdown from './components/CascadingDropdown';
import InfoTooltip from '../../components/common/InfoTooltip';

const TeacherAttendancePortal = () => {
  const { showToast, showLoading, hideLoading } = useOutletContext();
  const [hierarchy, setHierarchy] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [viewMode, setViewMode] = useState('Month-wise'); // Class-wise, Subject-wise, Month-wise, Annual-wise
  
  // Pagination State for clean, uncluttered roster view
  const [attPage, setAttPage] = useState(1);
  const [attPageSize, setAttPageSize] = useState(15);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleFetchStudents = async () => {
    if (!hierarchy) {
      showToast('Please complete Hierarchy selection', 'error');
      return;
    }

    try {
      showLoading('Fetching students...');
      const token = localStorage.getItem('cms_token');
      
      const queryParams = new URLSearchParams(hierarchy).toString();
      
      const { data } = await axios.get(`/api/v1/attendance/students?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStudents(data);
      
      const currentSession = hierarchy.session;
      const initialData = {};
      data.forEach(student => {
        initialData[student._id] = {};
        months.forEach(m => {
          const monthStr = `${m} ${currentSession}`;
          const existingRecord = student.attendanceRecords?.find(
            r => r.month === monthStr
          );
          initialData[student._id][m] = {
            totalClasses: existingRecord ? existingRecord.totalClasses : 0,
            attendedClasses: existingRecord ? existingRecord.attendedClasses : 0
          };
        });
      });
      setAttendanceData(initialData);
      
      if (data.length === 0) {
        showToast('No students found in this section.', 'error');
      }
    } catch (error) {
      showToast('Failed to fetch students', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleInputChange = (studentId, month, field, value) => {
    const val = value === '' ? '' : (parseInt(value) || 0);
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [month]: {
          ...prev[studentId]?.[month],
          [field]: val
        }
      }
    }));
  };

  const handleSubmit = async () => {
    if (students.length === 0) return;
    
    const records = [];
    const currentSession = hierarchy?.session;
    
    for (const student of students) {
      const studentData = attendanceData[student._id];
      if (!studentData) continue;
      
      const monthsToProcess = selectedMonth ? [selectedMonth] : months;
      
      for (const m of monthsToProcess) {
        const total = parseInt(studentData[m]?.totalClasses) || 0;
        const attended = parseInt(studentData[m]?.attendedClasses) || 0;
        
        if (attended > total) {
          showToast(`Attended classes cannot be greater than Total classes for ${student.name} in ${m}`, 'error');
          return;
        }
        
        records.push({
          studentId: student._id,
          subject: 'Overall',
          month: `${m} ${currentSession}`,
          totalClasses: total,
          attendedClasses: attended
        });
      }
    }

    try {
      showLoading('Saving Attendance...');
      const token = localStorage.getItem('cms_token');

      await axios.put('/api/v1/attendance/bulk', { records }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast('Attendance saved successfully');
    } catch (error) {
      showToast('Failed to save attendance', 'error');
    } finally {
      hideLoading();
    }
  };

  const totalAttPages = Math.ceil(students.length / attPageSize) || 1;
  const startAttIndex = (attPage - 1) * attPageSize;
  const paginatedStudents = students.slice(startAttIndex, startAttIndex + attPageSize);

  return (
    <div className="space-y-6 animate-[modalFadeIn_0.3s_ease]">
      {/* Teacher's Personal Daily Lecture Schedule Across Classes & Semesters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-calendar-check text-[#8B5CF6]"></i> My Assigned Teaching Schedule for Today
              </h2>
              <InfoTooltip
                title="Faculty Period Schedule"
                text="Your scheduled lectures across different programs, semesters, and classes for today. Allows quick review of room allocations."
                tip="Check your room number and lecture timing before heading to class."
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              4 lectures scheduled across B.Tech 6th Sem, BCA 4th Sem, and Class 8th
            </p>
          </div>
          <span className="whitespace-nowrap text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg self-start sm:self-center">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { period: 'Period 1', time: '09:00 - 09:50 AM', subject: 'Data Structures', classGroup: 'B.Tech CSE (6th Sem)', room: 'Room A-101', isLive: true },
            { period: 'Period 2', time: '10:00 - 10:50 AM', subject: 'Database Systems', classGroup: 'B.Tech CSE (6th Sem)', room: 'Room A-203', isLive: false },
            { period: 'Period 3', time: '11:30 - 01:00 PM', subject: 'Java Lab', classGroup: 'BCA (4th Sem)', room: 'Lab 1', isLive: false },
            { period: 'Period 5', time: '02:00 - 02:45 PM', subject: 'Computer Science', classGroup: 'Class 8th (Section A)', room: 'Room 12', isLive: false },
          ].map((item, idx) => (
            <div 
              key={idx}
              className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                item.isLive 
                  ? 'bg-purple-50/70 border-purple-200 ring-1 ring-purple-300' 
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-purple-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                    {item.period}
                  </span>
                  {item.isLive ? (
                    <span className="whitespace-nowrap text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.2 rounded-full uppercase tracking-wider">
                      Live Now
                    </span>
                  ) : (
                    <span className="whitespace-nowrap text-[10px] font-mono text-slate-400">
                      {item.time}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-xs mb-1 truncate">{item.subject}</h4>
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="whitespace-nowrap font-medium flex items-center gap-1.5 text-purple-800">
                    <i className="fas fa-graduation-cap text-[10px] text-purple-500"></i>
                    <span className="truncate">{item.classGroup}</span>
                  </div>
                  <div className="whitespace-nowrap font-medium flex items-center gap-1.5 text-slate-700">
                    <i className="fas fa-location-dot text-[10px] text-slate-400"></i>
                    <span>{item.room}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-chalkboard-user text-[#8B5CF6] mr-2"></i> Teacher Portal - Attendance
          </h2>
          <InfoTooltip
            title="Faculty Attendance Register"
            text="Allows professors to grade student classroom attendance, calculate semester attendance percentages, and flag low-attendance candidates (<75%) before exams."
            tip="Select your course and section below, then click Fetch Students."
          />
        </div>
        
        <CascadingDropdown onSelectionComplete={setHierarchy} />

        <div className="mt-4 mb-6">
          <div className="max-w-md">
            <div className="flex items-center gap-1.5 mb-1">
              <label className="block text-sm font-medium text-gray-700">Month</label>
              <InfoTooltip title="Monthly Attendance Filtering" text="Select a specific month to grade single-month attendance or leave unselected to view all 12 academic months." />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5CF6]"
            >
              <option value="">Select Month (Or leave empty for Full Year)</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={handleFetchStudents} className="px-6 py-2.5 bg-[#6D4C9C] text-white font-bold rounded-lg hover:bg-[#5B21B6] transition shadow-sm cursor-pointer">
            <i className="fas fa-users-viewfinder mr-2"></i> Fetch Students
          </button>
        </div>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-800">Fill Attendance ({viewMode})</h2>
                <InfoTooltip title="Attendance Roster" text="Percentages below 75% are highlighted automatically in purple/red to help identify students needing remedial warning letters." />
              </div>
              <p className="text-xs text-gray-500 mt-1">{students.length} students enrolled in this section</p>
            </div>
            <div className="flex items-center gap-2">
              <select className="border border-slate-200 p-2 rounded-lg text-sm bg-white" value={viewMode} onChange={e => setViewMode(e.target.value)}>
                <option>Class-wise</option>
                <option>Subject-wise</option>
                <option>Month-wise</option>
                <option>Annual-wise</option>
              </select>
              <button onClick={handleSubmit} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-sm transition cursor-pointer">
                <i className="fas fa-check mr-1.5"></i> Save
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto p-4 max-w-full">
            <table className="w-full text-left border-collapse border border-gray-200">
              {selectedMonth ? (
                <>
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="p-3 font-semibold text-gray-600">Roll No</th>
                      <th className="p-3 font-semibold text-gray-600">Student Name</th>
                      <th className="p-3 font-semibold text-gray-600 w-32">Total Classes</th>
                      <th className="p-3 font-semibold text-gray-600 w-32">Attended Classes</th>
                      <th className="p-3 font-semibold text-gray-600 w-24 text-center">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedStudents.map(s => {
                      const total = attendanceData[s._id]?.[selectedMonth]?.totalClasses || 0;
                      const attended = attendanceData[s._id]?.[selectedMonth]?.attendedClasses || 0;
                      const percentage = total > 0 ? ((attended / total) * 100).toFixed(1) : 0;
                      
                      return (
                        <tr key={s._id} className="hover:bg-gray-50 transition">
                          <td className="p-3 border-r text-sm font-medium">{s.studentId}</td>
                          <td className="p-3 border-r text-sm font-medium text-slate-800">{s.name}</td>
                          <td className="p-3 border-r">
                            <input type="number" min="0" value={total === 0 && attended === 0 ? '' : total} onChange={e => handleInputChange(s._id, selectedMonth, 'totalClasses', e.target.value)} placeholder="Total" className="w-full border border-slate-200 rounded text-center p-1.5 text-sm" />
                          </td>
                          <td className="p-3 border-r">
                            <input type="number" min="0" value={attended === 0 && total === 0 ? '' : attended} onChange={e => handleInputChange(s._id, selectedMonth, 'attendedClasses', e.target.value)} placeholder="Att" className={`w-full border border-slate-200 rounded text-center p-1.5 text-sm ${attended > total ? 'bg-purple-100' : ''}`} />
                          </td>
                          <td className="p-3 text-center font-bold text-sm">
                            <span className={`${percentage < 75 ? 'text-[#6D4C9C]' : 'text-emerald-600'}`}>{percentage}%</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </>
              ) : (
                <>
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="p-3 font-semibold text-gray-600 sticky left-0 z-10 bg-gray-100 shadow-[1px_0_0_0_#e5e7eb]">Roll No</th>
                      <th className="p-3 font-semibold text-gray-600 sticky left-[80px] md:left-[100px] z-10 bg-gray-100 shadow-[1px_0_0_0_#e5e7eb] min-w-[150px]">Student Name</th>
                      {months.map(m => (
                        <th key={m} className="p-3 font-semibold text-gray-600 text-center border-r">{m.substring(0,3)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedStudents.map(s => (
                      <tr key={s._id} className="hover:bg-gray-50 transition">
                        <td className="p-3 border-r text-sm font-medium sticky left-0 z-10 bg-white shadow-[1px_0_0_0_#e5e7eb]">{s.studentId}</td>
                        <td className="p-3 border-r text-sm font-medium text-slate-800 sticky left-[80px] md:left-[100px] z-10 bg-white shadow-[1px_0_0_0_#e5e7eb] whitespace-nowrap">{s.name}</td>
                        {months.map(m => {
                          const total = attendanceData[s._id]?.[m]?.totalClasses || 0;
                          const attended = attendanceData[s._id]?.[m]?.attendedClasses || 0;
                          return (
                            <td key={m} className="p-2 border-r min-w-[120px]">
                              <div className="flex items-center gap-1 justify-center">
                                <input type="number" min="0" placeholder="Att" value={attended === 0 && total === 0 ? '' : attended} onChange={e => handleInputChange(s._id, m, 'attendedClasses', e.target.value)} className={`w-[45px] border border-slate-200 rounded p-1 text-xs text-center ${attended > total ? 'bg-purple-100' : ''}`} />
                                <span className="text-gray-400">/</span>
                                <input type="number" min="0" placeholder="Tot" value={total === 0 && attended === 0 ? '' : total} onChange={e => handleInputChange(s._id, m, 'totalClasses', e.target.value)} className="w-[45px] border border-slate-200 rounded p-1 text-xs text-center" />
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>

            {/* Attendance Roster Pagination */}
            {students.length > 0 && (
              <div className="px-4 py-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 mt-2">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select
                    value={attPageSize}
                    onChange={(e) => {
                      setAttPageSize(Number(e.target.value));
                      setAttPage(1);
                    }}
                    className="border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>per page • Showing <strong>{startAttIndex + 1}</strong> to <strong>{Math.min(startAttIndex + attPageSize, students.length)}</strong> of <strong>{students.length}</strong> students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setAttPage(p => Math.max(p - 1, 1))}
                    disabled={attPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1.5 font-bold text-[#6D4C9C] bg-purple-50 border border-purple-200 rounded-lg">
                    Page {attPage} of {totalAttPages}
                  </span>
                  <button
                    onClick={() => setAttPage(p => Math.min(p + 1, totalAttPages))}
                    disabled={attPage === totalAttPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendancePortal;
