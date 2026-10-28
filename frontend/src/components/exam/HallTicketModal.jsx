import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const HallTicketModal = ({ isOpen, onClose, hallTicket }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !hallTicket) return null;

  const handlePrint = () => {
    window.print();
  };

  const student = hallTicket.student || {};
  const schedule = hallTicket.schedule || {};
  const eligibility = hallTicket.eligibility || {};
  const subjects = schedule.subjects || [];

  const formattedDate = hallTicket.generatedDate 
    ? new Date(hallTicket.generatedDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-IN');

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 md:p-6 backdrop-blur-sm overflow-y-auto animate-[fadeIn_0.15s_ease-out]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[88vh] my-auto flex flex-col overflow-hidden border border-slate-200/90 animate-[modalFadeIn_0.2s_ease]">
        {/* Pinned Screen Controls Header (hidden during print) */}
        <div className="no-print shrink-0 bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-white/10 shadow-sm z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 text-base shrink-0 shadow-inner">
              <i className="fas fa-id-card"></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm sm:text-base text-white truncate">Official Examination Admit Card</span>
                <span className="text-[10px] font-mono bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30 shrink-0">
                  {hallTicket.hallTicketNumber}
                </span>
              </div>
              <span className="text-xs text-slate-300 block truncate">Office of the Controller of Examinations</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <i className="fas fa-print"></i>
              <span className="hidden sm:inline">Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Close (Esc)"
            >
              <i className="fas fa-times text-base"></i>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Formal Institutional Document Area */}
        <div className="printable-receipt-area flex-1 overflow-y-auto style-scrollbar p-4 sm:p-8 text-gray-900 bg-white">
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-[#6D4C9C]/10 border border-[#6D4C9C]/20 flex items-center justify-center text-[#6D4C9C] text-2xl font-black shrink-0">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                  {student.college || 'Shyvora Institute of Higher Education & Technology'}
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Office of the Controller of Examinations • Autonomous Institution
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Knowledge City Campus, Tech Corridor • AICTE & UGC Recognized
                </p>
              </div>
              <div className="w-16 h-16 border-2 border-indigo-600 rounded-lg p-1 flex flex-col items-center justify-center shrink-0">
                <i className="fas fa-qrcode text-indigo-800 text-2xl"></i>
                <span className="text-[8px] font-bold text-indigo-700 tracking-tighter uppercase mt-0.5">Exam Pass</span>
              </div>
            </div>

            <div className="pt-2 border-t border-dashed border-gray-300 flex items-center justify-between">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
                Official Examination Admit Card (Hall Ticket)
              </span>
              <span className="text-xs font-mono text-slate-600">
                {schedule.academicSession || '2026-27'} • {schedule.examTerm || 'End-Semester'}
              </span>
            </div>
          </div>

          {/* Student Dossier Information Grid */}
          <div className="border border-slate-300 rounded-lg p-4 mb-4 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Photo Box Placeholder */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg h-32 bg-white text-slate-400">
                {student.avatar ? (
                  <img src={student.avatar} alt={student.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <i className="fas fa-user text-2xl mb-1 text-slate-300"></i>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Photo Verified</span>
                  </>
                )}
                <span className="text-[9px] font-mono text-slate-400 mt-1">Roll: {student.classRollNo || student.rollNo || 'N/A'}</span>
              </div>

              {/* Identity Details */}
              <div className="md:col-span-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Candidate Name:</span>
                  <span className="font-black text-slate-900 text-sm">{student.name || 'Student Candidate'}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Student ID / Enrollment:</span>
                  <span className="font-bold text-slate-900 font-mono">{student.studentId || 'N/A'} &nbsp;/&nbsp; {student.enrollmentNo || student.classRollNo || 'ENR-2026'}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Degree & Branch:</span>
                  <span className="font-semibold text-slate-800">{student.college || student.currentClass?.course || 'Undergraduate Degree'}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Semester / Term:</span>
                  <span className="font-semibold text-slate-800">{student.currentClass?.semester || schedule.semester || '1st Sem'}</span>
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">Allotted Examination Center:</span>
                    <span className="font-bold text-slate-900">
                      {schedule.centerName || 'Shyvora University Central Examination Complex (Main Block)'} (Center Code: CTR-DEL-042)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      eligibility.status === 'ELIGIBLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <i className={`fas ${eligibility.status === 'ELIGIBLE' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                      {eligibility.status === 'ELIGIBLE' ? 'ELIGIBLE TO APPEAR' : 'DEBARRED (LOW ATTENDANCE)'}
                    </span>
                    <span className="text-[10px] text-slate-500">Attendance: <strong>{eligibility.attendancePercent || 85}%</strong> (Threshold: ≥ 75%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timetable / Paper Schedule Matrix */}
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center justify-between">
              <span>Allotted Examination Timetable</span>
              <span className="text-[10px] font-normal text-slate-500">Candidate must report 20 minutes prior to paper start</span>
            </h3>

            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-700 w-10 text-center">#</th>
                    <th className="py-2.5 px-3 border-r border-slate-700">Date & Time Slot</th>
                    <th className="py-2.5 px-3 border-r border-slate-700 w-24">Course Code</th>
                    <th className="py-2.5 px-3 border-r border-slate-700">Subject / Paper Title</th>
                    <th className="py-2.5 px-3 border-r border-slate-700 w-32">Hall / Room</th>
                    <th className="py-2.5 px-3 text-center w-28">Invigilator Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {subjects.length > 0 ? (
                    subjects.map((sub, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-600">{idx + 1}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-medium">
                          <span className="font-bold text-slate-900 block">{sub.examDate ? new Date(sub.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{sub.timeSlot || '09:30 AM - 12:30 PM'}</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-mono font-bold text-indigo-700">{sub.subjectCode || 'SUB101'}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <span className="font-bold text-slate-900 block">{sub.subjectName}</span>
                          <span className="text-[10px] text-slate-500">Max Marks: {sub.maxMarks || 100} • Credits: {sub.credits || 4}</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 font-medium text-slate-700">{sub.roomNumber || 'Examination Hall 1'}</td>
                        <td className="py-2.5 px-3 border-slate-200 text-center">
                          <div className="h-7 border border-dashed border-slate-300 rounded bg-slate-50/50"></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-slate-500 italic">No scheduled subjects attached to this admit card.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Instructions & Disciplinary Clauses */}
          <div className="border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 mb-6 bg-slate-50/30">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-[10px]">
              <i className="fas fa-triangle-exclamation text-amber-600"></i>
              Statutory Examination Instructions for Candidate:
            </h4>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600 leading-relaxed">
              <li>Possession of mobile phones, smartwatches, programmable calculators, or any electronic gadget is strictly prohibited inside the hall.</li>
              <li>Candidate must produce this original printed Admit Card along with their Institutional Student ID card at the verification gate.</li>
              <li>Candidates arriving more than 15 minutes after paper commencement will not be admitted under any circumstance.</li>
              <li>Disciplinary action under UGC / Institutional Code of Conduct will be instituted if any candidate indulges in unfair means (UFM).</li>
            </ol>
          </div>

          {/* Signatures Footer Block */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
              <span className="font-bold text-slate-800 block">Candidate Signature</span>
              <span className="text-[10px] text-slate-500">(Sign in presence of Invigilator)</span>
            </div>

            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-center justify-center">
                <span className="text-[10px] font-mono text-slate-400 italic">Institutional Seal Verified</span>
              </div>
              <span className="font-bold text-slate-800 block">Dean / HOD Signature</span>
              <span className="text-[10px] text-slate-500">Department of Academics</span>
            </div>

            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-center justify-center">
                <span className="font-serif italic font-bold text-indigo-900 text-sm">Controller of Examinations</span>
              </div>
              <span className="font-bold text-slate-800 block">Controller of Examinations</span>
              <span className="text-[10px] text-slate-500 font-mono">Issued: {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Modal Screen Footer (no-print) */}
        <div className="no-print shrink-0 bg-slate-50/90 px-5 sm:px-6 py-3.5 border-t border-slate-100 flex justify-between items-center text-xs z-10">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <i className="fas fa-circle-check text-emerald-600"></i>
            <span className="hidden sm:inline">Statutory Admit Card • Valid across all allotted examination halls.</span>
            <span className="sm:hidden">Statutory Admit Card</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 border border-indigo-200"
            >
              <i className="fas fa-print text-indigo-600"></i> Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HallTicketModal;
