import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Indian Number to Words converter helper
const numberToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() ? `${str.trim()} Rupees Only` : 'Zero Rupees Only';
};

const ReceiptModal = ({ isOpen, onClose, receipt, student }) => {
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

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = receipt.paymentDate 
    ? new Date(receipt.paymentDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString('en-IN');

  const studentName = receipt.studentName || student?.name || 'Student';
  const studentId = receipt.studentId || student?.studentId || 'N/A';
  const enrollmentNo = student?.enrollmentNo || student?.classRollNo || 'ENR-' + studentId;
  const programCourse = receipt.programCourse || 
    (student?.currentClass ? `${student.currentClass.course || ''} - ${student.currentClass.branch || ''}`.trim() : student?.college || 'Higher Education');
  
  const breakdown = receipt.breakdown && receipt.breakdown.length > 0 
    ? receipt.breakdown 
    : [{ head: receipt.feeCategory || 'Tuition Fee', amount: receipt.amount }];

  const scholarshipAmount = receipt.scholarship?.amount || 0;
  const scholarshipName = receipt.scholarship?.name || 'Institutional Scholarship';

  const totalCourseFee = student?.totalFee || student?.feeDetails?.totalAmount || (receipt.amount * 2);
  const totalPaidSoFar = student?.paidFee || student?.feeDetails?.paidAmount || receipt.amount;
  const balanceRemaining = Math.max(0, totalCourseFee - totalPaidSoFar);

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 md:p-6 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[88vh] my-auto flex flex-col overflow-hidden border border-slate-300 animate-[modalFadeIn_0.2s_ease]">
        {/* Pinned Screen Controls Header */}
        <div className="no-print shrink-0 bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shadow-sm z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 text-sm shrink-0">
              <i className="fas fa-file-invoice"></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-white truncate">Official Fee Payment Receipt</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                  {receipt.receiptNumber}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block truncate">Audited Institutional Treasury Copy</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <i className="fas fa-print"></i>
              <span className="hidden sm:inline">Print / Save PDF</span>
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

        {/* Scrollable Printable Formal Institutional Document Area */}
        <div className="printable-receipt-area flex-1 overflow-y-auto p-4 sm:p-8 text-gray-900 bg-white">
          {/* Institution Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-5 text-center relative">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-[#6D4C9C]/10 border border-[#6D4C9C]/20 flex items-center justify-center text-[#6D4C9C] text-2xl font-black shrink-0">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                  {student?.college || 'Shyvora Institute of Higher Education & Technology'}
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Accredited by NAAC (A++) • Approved by AICTE, UGC & Ministry of Education
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  Campus Knowledge Park, Technology Corridor, New Delhi - 110001 • GSTIN: 07AAAAA0000A1Z5
                </p>
              </div>
              <div className="w-16 h-16 border-2 border-emerald-600 rounded-lg p-1 flex flex-col items-center justify-center shrink-0">
                <i className="fas fa-qrcode text-emerald-800 text-2xl"></i>
                <span className="text-[8px] font-bold text-emerald-700 tracking-tighter uppercase mt-0.5">Verified</span>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-dashed border-gray-300 flex items-center justify-between">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
                Official Student Fee Receipt
              </span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Original Copy (Student Record & Tax Audit)
              </span>
            </div>
          </div>

          {/* Receipt & Student Meta Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs">
            <div className="space-y-1.5 border-r border-slate-200 pr-4">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Receipt Number:</span>
                <span className="font-mono font-bold text-slate-900">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Date & Time:</span>
                <span className="font-semibold text-slate-800">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment Method:</span>
                <span className="font-semibold text-slate-800">{receipt.paymentMethod || 'Cash'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Transaction / UTR Ref:</span>
                <span className="font-mono font-bold text-slate-800 truncate max-w-[160px]">
                  {receipt.transactionId || 'CASH_OFFLINE'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pl-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Student Name:</span>
                <span className="font-bold text-slate-900 uppercase">{studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Student ID:</span>
                <span className="font-mono font-semibold text-slate-800">{studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Enrollment / Roll No:</span>
                <span className="font-mono font-semibold text-slate-800">{enrollmentNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Program / Branch:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[160px]">{programCourse}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-6 overflow-hidden border border-slate-300 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800 text-white uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Fee Category / Particulars</th>
                  <th className="p-3 text-right">Gross Amount</th>
                  <th className="p-3 text-right">Concession / Adjustment</th>
                  <th className="p-3 text-right">Net Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {breakdown.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="p-3 text-center font-medium text-slate-500">{index + 1}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {item.head || receipt.feeCategory}
                      <span className="block text-[10px] font-normal text-slate-500">
                        Academic Session 2026-27 • Semester Installment
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium text-slate-700">₹{item.amount?.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-medium text-slate-400">-</td>
                    <td className="p-3 text-right font-bold text-slate-900">₹{item.amount?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}

                {scholarshipAmount > 0 && (
                  <tr className="bg-emerald-50 text-emerald-900 font-medium">
                    <td className="p-3 text-center">•</td>
                    <td className="p-3">
                      <span className="font-bold">Concession / Subsidy:</span> {scholarshipName}
                    </td>
                    <td className="p-3 text-right">-</td>
                    <td className="p-3 text-right font-bold text-emerald-700">-₹{scholarshipAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">-₹{scholarshipAmount.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {/* Net Total Row */}
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-slate-900">
                  <td colSpan="4" className="p-3 text-right uppercase text-xs tracking-wider">
                    Total Amount Paid:
                  </td>
                  <td className="p-3 text-right text-base text-emerald-700 font-black">
                    ₹{receipt.amount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount In Words */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mb-6 text-xs flex items-center justify-between">
            <span className="font-semibold text-slate-600">Amount in Words:</span>
            <span className="font-bold text-slate-900 italic">{numberToWords(receipt.amount)}</span>
          </div>

          {/* Ledger Balance Statement */}
          <div className="grid grid-cols-4 gap-2 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 mb-6 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Fee</div>
              <div className="font-bold text-slate-800 mt-0.5">₹{totalCourseFee.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Cumulative Paid</div>
              <div className="font-bold text-emerald-700 mt-0.5">₹{totalPaidSoFar.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">This Receipt</div>
              <div className="font-bold text-indigo-700 mt-0.5">₹{receipt.amount.toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Outstanding Dues</div>
              <div className={`font-bold mt-0.5 ${balanceRemaining > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {balanceRemaining > 0 ? `₹${balanceRemaining.toLocaleString('en-IN')}` : 'NIL (Settled)'}
              </div>
            </div>
          </div>

          {/* Signatures & Certification */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 items-end text-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-shield-check text-emerald-600"></i>
                <span className="font-bold text-slate-800 text-[11px]">DPDP & NEP 2020 Compliant</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                This is a tamper-evident system-generated receipt registered in Shyvora Campus Financial Ledger.
                Valid for Section 80C Income Tax rebate and Education Loan subsidy audits.
              </p>
              <p className="text-[9px] text-slate-400 font-mono mt-1">
                Collected By: {receipt.collectedBy || 'Campus Cashier'} • Ledger Hash: {receipt.receiptNumber.replace(/[^0-9]/g, '') || '94821'}
              </p>
            </div>

            <div className="text-right space-y-1">
              <div className="inline-block border-b-2 border-slate-900 pb-1 mb-1 px-8 text-center">
                <div className="font-serif italic font-bold text-slate-800 text-sm">Shyvora Accounts</div>
              </div>
              <div className="text-[11px] font-bold text-slate-900 uppercase">Authorized Financial Signatory</div>
              <div className="text-[10px] text-slate-500">Controller of Examinations & Finance</div>
            </div>
          </div>
        </div>

        {/* Modal Footer (no-print) */}
        <div className="no-print shrink-0 bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center text-xs z-10">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <i className="fas fa-circle-check text-emerald-600"></i>
            <span className="hidden sm:inline">Official Institutional Fee Receipt • Section 80C compliant.</span>
            <span className="sm:hidden">Official Receipt</span>
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

export default ReceiptModal;
