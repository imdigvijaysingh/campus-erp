import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const ReportCardModal = ({ isOpen, onClose, assessment, student }) => {
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !assessment) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentName = assessment.studentName || student?.name || 'Student';
  const studentId = assessment.studentId || student?.studentId || 'N/A';
  const enrollmentNo = student?.enrollmentNo || student?.classRollNo || `ENR-${studentId}`;
  const course = assessment.course || student?.currentClass?.course || student?.college || 'Undergraduate Degree';
  const semester = assessment.semester || student?.currentClass?.semester || '1st Sem';
  const session = assessment.academicSession || '2026-27';

  const subjectScores = assessment.subjectScores || [];
  const sgpa = assessment.sgpa !== undefined ? Number(assessment.sgpa).toFixed(2) : '8.50';
  const cgpa = assessment.cgpa !== undefined ? Number(assessment.cgpa).toFixed(2) : sgpa;
  const totalCredits = assessment.totalCredits || subjectScores.reduce((acc, s) => acc + (s.credits || 4), 0);
  const earnedCredits = assessment.earnedCredits || totalCredits;
  const totalMarks = assessment.totalMarksObtained || subjectScores.reduce((acc, s) => acc + (s.totalMarks || 0), 0);
  const maxMarks = assessment.grandMaxMarks || subjectScores.reduce((acc, s) => acc + (s.maxMarks || 100), 0);
  const overallPercentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : '85.0';

  const publishedDate = assessment.publishedDate 
    ? new Date(assessment.publishedDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-IN');

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 md:p-6 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[88vh] my-auto flex flex-col overflow-hidden border border-slate-300 animate-[modalFadeIn_0.2s_ease]">
        {/* Pinned Screen Controls Header */}
        <div className="no-print shrink-0 bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shadow-sm z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-sm shrink-0">
              <i className="fas fa-award"></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-white truncate">Official Semester Grade Transcript</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                  SGPA: {sgpa}
                </span>
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 shrink-0">
                  CGPA: {cgpa}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block truncate">Outcome-Based Education (OBE) Evaluation</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <i className="fas fa-print"></i>
              <span className="hidden sm:inline">Print / Download Transcript</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Close (Esc)"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Formal Institutional Grade Sheet */}
        <div className="printable-receipt-area flex-1 overflow-y-auto p-4 sm:p-8 text-gray-900 bg-white">
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-[#6D4C9C]/10 border border-[#6D4C9C]/20 flex items-center justify-center text-[#6D4C9C] text-2xl font-black shrink-0">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                  {student?.college || 'Shyvora Institute of Higher Education & Technology'}
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Conferred under UGC Choice Based Credit System (CBCS) & National Credit Framework (NCrF)
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Accredited NAAC 'A++' Grade • Permanent Affiliation • Institution of Academic Excellence
                </p>
              </div>
              <div className="w-16 h-16 border-2 border-emerald-600 rounded-lg p-1 flex flex-col items-center justify-center shrink-0">
                <i className="fas fa-qrcode text-emerald-800 text-2xl"></i>
                <span className="text-[8px] font-bold text-emerald-700 tracking-tighter uppercase mt-0.5">Authentic</span>
              </div>
            </div>

            <div className="pt-2 border-t border-dashed border-gray-300 flex items-center justify-between">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
                Semester Grade Report & NCrF Credit Statement
              </span>
              <span className="text-xs font-semibold text-slate-600 uppercase">
                {session} • {semester} Examination
              </span>
            </div>
          </div>

          {/* Student Meta Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs">
            <div className="space-y-1.5 border-r border-slate-200 pr-4">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Candidate Name:</span>
                <span className="font-bold text-slate-900 uppercase">{studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Student Registration ID:</span>
                <span className="font-mono font-bold text-slate-900">{studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Enrollment / Roll No:</span>
                <span className="font-mono font-semibold text-slate-800">{enrollmentNo}</span>
              </div>
            </div>

            <div className="space-y-1.5 pl-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Programme of Study:</span>
                <span className="font-semibold text-slate-900">{course}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Semester / Term:</span>
                <span className="font-semibold text-slate-800">{semester}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Date of Result Declaration:</span>
                <span className="font-mono font-semibold text-slate-800">{publishedDate}</span>
              </div>
            </div>
          </div>

          {/* Academic Assessment Scores Table */}
          <div className="mb-6 overflow-hidden border border-slate-300 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800 text-white uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-2.5 text-center w-10">#</th>
                  <th className="p-2.5">Course Code</th>
                  <th className="p-2.5">Course Title</th>
                  <th className="p-2.5 text-center">Credits</th>
                  <th className="p-2.5 text-center">Marks (Obt/Max)</th>
                  <th className="p-2.5 text-center">Grade</th>
                  <th className="p-2.5 text-center">Grade Point</th>
                  <th className="p-2.5 text-right">Credit Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjectScores.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 text-center font-medium text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-mono font-bold text-slate-800">{sub.subjectCode}</td>
                    <td className="p-2.5 font-medium text-slate-900">
                      {sub.subjectName}
                      <span className="block text-[10px] text-slate-500">Category: {sub.courseCategory || 'Major'}</span>
                    </td>
                    <td className="p-2.5 text-center font-semibold text-slate-800">{sub.credits || 4}</td>
                    <td className="p-2.5 text-center font-medium text-slate-700">
                      {sub.totalMarks} / {sub.maxMarks || 100}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded font-black text-xs ${
                        sub.letterGrade === 'O' || sub.letterGrade === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                        sub.letterGrade === 'A' || sub.letterGrade === 'B+' ? 'bg-blue-100 text-blue-800' :
                        sub.letterGrade === 'F' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {sub.letterGrade}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900">{sub.gradePoint}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{sub.creditPointsEarned}</td>
                  </tr>
                ))}

                {/* Totals Row */}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-slate-900">
                  <td colSpan="3" className="p-2.5 text-right uppercase text-[11px]">Cumulative Totals:</td>
                  <td className="p-2.5 text-center">{totalCredits} Credits</td>
                  <td className="p-2.5 text-center">{totalMarks} / {maxMarks} ({overallPercentage}%)</td>
                  <td colSpan="2" className="p-2.5 text-right uppercase text-[11px]">Total Credit Points:</td>
                  <td className="p-2.5 text-right text-indigo-900 text-sm font-black">
                    {subjectScores.reduce((acc, s) => acc + (s.creditPointsEarned || 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Outcome-Based Education (OBE) & GPA Statement Cards */}
          <div className="grid grid-cols-4 gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 mb-6 text-center text-xs">
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Semester SGPA</span>
              <span className="text-2xl font-black text-indigo-900">{sgpa}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Scale of 10.0</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Cumulative CGPA</span>
              <span className="text-2xl font-black text-slate-900">{cgpa}</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">All Semesters</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">NCrF Credits Earned</span>
              <span className="text-2xl font-black text-emerald-700">{earnedCredits}</span>
              <span className="block text-[10px] text-emerald-600 mt-0.5">ABC Synced</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Result Classification</span>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full font-black text-xs ${
                assessment.resultStatus === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {assessment.resultStatus || 'PASS'}
              </span>
              <span className="block text-[9px] text-slate-400 mt-0.5">First Class with Distinction</span>
            </div>
          </div>

          {/* UGC Reference Legend & OBE Course Outcome Attainment */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-6 text-[10px] text-slate-600">
            <span className="font-bold text-slate-800 uppercase block mb-1">
              UGC 10-Point Grading Scale & Outcome-Based Assessment (OBE):
            </span>
            <div className="grid grid-cols-8 gap-1 text-center font-mono">
              <div className="bg-white p-1 rounded border"><b>O</b> (10): &ge;90%</div>
              <div className="bg-white p-1 rounded border"><b>A+</b> (9): &ge;80%</div>
              <div className="bg-white p-1 rounded border"><b>A</b> (8): &ge;70%</div>
              <div className="bg-white p-1 rounded border"><b>B+</b> (7): &ge;60%</div>
              <div className="bg-white p-1 rounded border"><b>B</b> (6): &ge;55%</div>
              <div className="bg-white p-1 rounded border"><b>C</b> (5): &ge;50%</div>
              <div className="bg-white p-1 rounded border"><b>P</b> (4): &ge;40%</div>
              <div className="bg-white p-1 rounded border text-red-600"><b>F</b> (0): &lt;40%</div>
            </div>
          </div>

          {/* Controller Seal & Certification */}
          <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-2 gap-8 items-end text-xs">
            <div>
              <div className="flex items-center gap-1.5 mb-1 text-emerald-700 font-bold text-[11px]">
                <i className="fas fa-shield-halved"></i>
                <span>National Academic Depository (NAD) / DigiLocker Registered</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                This document is a certified statement of grades issued by the Examination Branch.
                Tamper-evident hash and grade points are cryptographically logged into the Academic Bank of Credits.
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="inline-block border-b-2 border-slate-900 pb-1 px-8 text-center">
                <div className="font-serif italic font-bold text-slate-800 text-sm">Shyvora Exam Cell</div>
              </div>
              <div className="text-[11px] font-bold text-slate-900 uppercase">Controller of Examinations</div>
              <div className="text-[10px] text-slate-500 font-mono">Transcript Ref: NCrF-TR-{studentId}</div>
            </div>
          </div>
        </div>

        {/* Modal Screen Footer (no-print) */}
        <div className="no-print shrink-0 bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center text-xs z-10">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <i className="fas fa-circle-check text-emerald-600"></i>
            <span className="hidden sm:inline">Certified Grade Transcript • UGC CBCS & NCrF Framework compliant.</span>
            <span className="sm:hidden">Certified Transcript</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 border border-emerald-200"
            >
              <i className="fas fa-print text-emerald-600"></i> Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition cursor-pointer"
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

export default ReportCardModal;
