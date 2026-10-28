import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';
import ReceiptModal from '../../components/finance/ReceiptModal';
import InfoTooltip from '../../components/common/InfoTooltip';

const CONCESSION_PRESETS = [
  { name: 'None (Standard)', amount: 0 },
  { name: 'Merit Academic Scholarship', amount: 5000 },
  { name: 'National/State Sports Quota', amount: 7500 },
  { name: 'Staff Ward Educational Subsidy', amount: 10000 },
  { name: 'Economically Weaker Section (EWS)', amount: 15000 },
  { name: 'Custom Concession', amount: 0 }
];

const FEE_CATEGORIES = [
  'Tuition Fee',
  'Examination Fee',
  'Hostel & Mess Fee',
  'Transportation Fee',
  'Lab & Library Fee',
  'Annual Development Fee',
  'Admission / Registration',
  'Miscellaneous / Other'
];

const FeeCashierPortal = () => {
  const { showToast, showLoading, hideLoading } = useOutletContext();
  
  // Executive Stats
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalExpected: 0,
    totalOutstanding: 0,
    collectionRate: '0.0',
    fullyPaidCount: 0,
    pendingCount: 0
  });

  // Students & Search
  const [allStudents, setAllStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Payment Form
  const [paymentData, setPaymentData] = useState({
    amount: '',
    feeCategory: 'Tuition Fee',
    paymentMethod: 'Cash',
    transactionId: '',
    remarks: '',
    selectedConcession: 'None (Standard)',
    customConcessionName: '',
    customConcessionAmount: ''
  });

  // Payments Ledger & Pagination
  const [recentPayments, setRecentPayments] = useState([]);
  const [tableFilter, setTableFilter] = useState('ALL');
  const [tableSearch, setTableSearch] = useState('');
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(10);

  // Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [receiptStudentData, setReceiptStudentData] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchRecentPayments();
    fetchAllStudents();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/fees/stats');
      if (res.data?.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const fetchRecentPayments = async (studentId = '') => {
    setLoadingLedger(true);
    try {
      const url = studentId ? `/fees?studentId=${studentId}` : '/fees';
      const res = await api.get(url);
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setRecentPayments(list);
    } catch (e) {
      console.error('Error fetching payments:', e);
    } finally {
      setLoadingLedger(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const res = await api.get('/students');
      const list = Array.isArray(res.data) ? res.data : (res.data?.students || []);
      setAllStudents(list);
    } catch (e) {
      console.error('Error fetching students:', e);
    }
  };

  // Instant Student Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = allStudents.filter(s => {
      const classStr = s.currentClass ? `${s.currentClass.department || ''} ${s.currentClass.course || ''} ${s.currentClass.branch || ''} ${s.currentClass.semester || ''}`.toLowerCase() : '';
      return (
        (s.studentId && s.studentId.toLowerCase().includes(q)) || 
        (s.name && s.name.toLowerCase().includes(q)) || 
        (s.phone && s.phone.includes(q)) ||
        (s.enrollmentNo && s.enrollmentNo.toLowerCase().includes(q)) ||
        classStr.includes(q)
      );
    });
    setFilteredStudents(filtered.slice(0, 15));
  }, [searchQuery, allStudents]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchQuery('');
    setFilteredStudents([]);
    fetchRecentPayments(student.studentId);

    // Calculate suggested amount from remaining balance
    const total = student.feeDetails?.totalAmount || 0;
    const paid = student.feeDetails?.paidAmount || 0;
    const due = Math.max(0, total - paid);
    
    setPaymentData(prev => ({
      ...prev,
      amount: due > 0 ? due.toString() : '',
      transactionId: prev.paymentMethod.includes('Online') ? `TXN_${Date.now()}` : ''
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentData(prev => ({
      ...prev,
      paymentMethod: method,
      transactionId: method.includes('Online') || method.includes('UPI') ? `TXN_${Date.now()}` : ''
    }));
  };

  const getConcessionDetails = () => {
    if (paymentData.selectedConcession === 'None (Standard)') {
      return { name: '', amount: 0 };
    }
    if (paymentData.selectedConcession === 'Custom Concession') {
      return {
        name: paymentData.customConcessionName || 'Special Concession',
        amount: Number(paymentData.customConcessionAmount) || 0
      };
    }
    const preset = CONCESSION_PRESETS.find(p => p.name === paymentData.selectedConcession);
    return {
      name: preset?.name || 'Institutional Concession',
      amount: preset?.amount || 0
    };
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('Please select a student first', 'error');
      return;
    }

    const netAmount = Number(paymentData.amount);
    if (!netAmount || netAmount <= 0) {
      showToast('Please enter a valid positive payment amount', 'error');
      return;
    }

    const concession = getConcessionDetails();

    try {
      showLoading('Recording Payment & Generating Receipt...');
      const payload = {
        studentId: selectedStudent.studentId,
        amount: netAmount,
        feeCategory: paymentData.feeCategory,
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
        remarks: paymentData.remarks,
        breakdown: [
          { head: paymentData.feeCategory, amount: netAmount + concession.amount }
        ],
        scholarship: concession
      };

      const res = await api.post('/fees', payload);
      showToast('Payment recorded successfully! Generating official receipt...', 'success');

      // Update student local balance
      const updatedTotalPaid = (selectedStudent.feeDetails?.paidAmount || 0) + netAmount;
      const updatedStudent = {
        ...selectedStudent,
        feeDetails: {
          ...selectedStudent.feeDetails,
          paidAmount: updatedTotalPaid,
          lastPaymentDate: new Date().toISOString(),
          lastPaymentAmount: netAmount
        }
      };
      setSelectedStudent(updatedStudent);

      // Open printable receipt immediately
      if (res.data?.payment) {
        setActiveReceipt(res.data.payment);
        setReceiptStudentData(updatedStudent);
        setIsReceiptModalOpen(true);
      }

      // Reset form
      setPaymentData({
        amount: '',
        feeCategory: 'Tuition Fee',
        paymentMethod: 'Cash',
        transactionId: '',
        remarks: '',
        selectedConcession: 'None (Standard)',
        customConcessionName: '',
        customConcessionAmount: ''
      });

      // Refresh stats & ledger
      fetchStats();
      fetchRecentPayments(selectedStudent.studentId);
    } catch (error) {
      console.error('Payment error:', error);
      showToast(error.response?.data?.error || error.message || 'Payment processing failed', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleOpenReceipt = async (payment) => {
    try {
      showLoading('Fetching Official Receipt...');
      const res = await api.get(`/fees/receipt/${payment.receiptNumber}`);
      if (res.data?.receipt) {
        setActiveReceipt(res.data.receipt);
        setReceiptStudentData(res.data.student);
        setIsReceiptModalOpen(true);
      } else {
        setActiveReceipt(payment);
        setReceiptStudentData(selectedStudent);
        setIsReceiptModalOpen(true);
      }
    } catch (err) {
      setActiveReceipt(payment);
      setReceiptStudentData(selectedStudent);
      setIsReceiptModalOpen(true);
    } finally {
      hideLoading();
    }
  };

  // Filtered payments for table
  const displayedPayments = recentPayments.filter(p => {
    const matchesFilter = 
      tableFilter === 'ALL' ||
      (tableFilter === 'CASH' && p.paymentMethod === 'Cash') ||
      (tableFilter === 'ONLINE' && p.paymentMethod.includes('Online')) ||
      (tableFilter === 'CHEQUE' && (p.paymentMethod === 'Cheque' || p.paymentMethod === 'Draft'));

    const q = tableSearch.toLowerCase();
    const matchesSearch = 
      !q || 
      p.receiptNumber?.toLowerCase().includes(q) ||
      p.studentId?.toLowerCase().includes(q) ||
      p.studentName?.toLowerCase().includes(q) ||
      p.feeCategory?.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const selectedTotalFee = selectedStudent?.feeDetails?.totalAmount || 0;
  const selectedPaidFee = selectedStudent?.feeDetails?.paidAmount || 0;
  const selectedRemainingDue = Math.max(0, selectedTotalFee - selectedPaidFee);

  return (
    <div className="space-y-6 animate-[modalFadeIn_0.3s_ease] pb-12">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-6 shadow-lg border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 text-white/5 text-9xl pointer-events-none">
          <i className="fas fa-file-invoice-dollar"></i>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/30">
                Phase 6 • Campus Finance Engine
              </span>
              <span className="text-xs text-purple-200/80">
                <i className="fas fa-shield-alt text-emerald-400 mr-1"></i> Multi-Tenant Audit Ledger
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Campus Treasury & Fee Cashier Console
              </h1>
              <InfoTooltip
                title="Campus Treasury Operations"
                text="Comprehensive financial management portal handling semester tuition, hostel, bus, and exam fee collection with auto-reconciled digital receipts."
                tip="Search student by name or enrollment ID to start collecting fees."
              />
            </div>
            <p className="text-xs md:text-sm text-purple-200/80 mt-1 max-w-2xl">
              Real-time student fee collection, concession adjustments, instant institutional receipt generation, and ledger auto-reconciliation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { fetchStats(); fetchRecentPayments(selectedStudent?.studentId); }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/10 backdrop-blur-xs flex items-center gap-2 transition cursor-pointer"
            >
              <i className="fas fa-rotate"></i> Refresh Ledger
            </button>
          </div>
        </div>
      </div>

      {/* 4-Card Executive KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Collected */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue Collected</span>
                <InfoTooltip title="Collected Revenue" text="Total reconciled payments deposited into the campus treasury across all heads for the academic session." position="bottom" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{stats.totalCollected?.toLocaleString('en-IN') || 0}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              <i className="fas fa-indian-rupee-sign"></i>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span><i className="fas fa-check-circle text-emerald-500 mr-1"></i> Live Reconciled</span>
            <span className="font-semibold text-slate-700">{stats.fullyPaidCount || 0} Accounts Cleared</span>
          </div>
        </div>

        {/* Card 2: Expected Receivables */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Receivables</span>
                <InfoTooltip title="Total Annual Demand" text="Aggregate expected fee revenue based on all active student enrollments across all semesters." position="bottom" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{stats.totalExpected?.toLocaleString('en-IN') || 0}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
              <i className="fas fa-building-columns"></i>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Across Active Students</span>
            <span className="font-semibold text-slate-700">{allStudents.length} Students</span>
          </div>
        </div>

        {/* Card 3: Outstanding Dues */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding Dues</span>
                <InfoTooltip title="Pending Receivables" text="Outstanding fees remaining to be recovered prior to semester end and admit card issuance." position="bottom" />
              </div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                ₹{stats.totalOutstanding?.toLocaleString('en-IN') || 0}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
              <i className="fas fa-clock"></i>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-amber-600 font-medium">Pending Recovery</span>
            <span className="font-bold text-slate-700">{stats.pendingCount || 0} Students</span>
          </div>
        </div>

        {/* Card 4: Collection Rate */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collection Efficiency</span>
                <InfoTooltip title="Recovery Percentage" text="Ratio of total fee collected against total billed demand across the institution." position="bottom" />
              </div>
              <div className="text-2xl font-black text-[#6D4C9C] mt-1">
                {stats.collectionRate}%
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-[#6D4C9C] flex items-center justify-center text-lg">
              <i className="fas fa-chart-pie"></i>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#6D4C9C] h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Number(stats.collectionRate) || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Cashier Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Selection & Payment Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Student Search Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#6D4C9C] text-white text-xs flex items-center justify-center font-bold">1</span>
                Locate Student Account
                <InfoTooltip title="Student Account Lookup" text="Search by student enrollment ID or name to view pending tuition dues, payment history, and fee breakdown." />
              </h2>
              {selectedStudent && (
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    fetchRecentPayments();
                  }}
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search by Name, Student ID, Phone, Enrollment..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6D4C9C] focus:bg-white transition"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search absolute left-3 top-3.5 text-slate-400 text-xs"></i>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <i className="fas fa-times-circle text-xs"></i>
                </button>
              )}
            </div>

            {/* Live Search Dropdown */}
            {filteredStudents.length > 0 && (
              <div className="mt-3 divide-y divide-slate-100 max-h-56 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-lg z-20">
                {filteredStudents.map(s => {
                  const sTotal = s.feeDetails?.totalAmount || 0;
                  const sPaid = s.feeDetails?.paidAmount || 0;
                  const sDue = Math.max(0, sTotal - sPaid);

                  return (
                    <div
                      key={s._id}
                      onClick={() => handleSelectStudent(s)}
                      className="p-3 hover:bg-purple-50/60 cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-xs text-slate-900 truncate">{s.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          ID: {s.studentId} • {s.currentClass ? `${s.currentClass.course} ${s.currentClass.branch || ''}` : 'Student'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {sDue > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            Due: ₹{sDue.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Cleared
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Student Profile Banner */}
            {selectedStudent ? (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#6D4C9C] text-white font-black text-lg flex items-center justify-center shrink-0">
                      {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{selectedStudent.name}</div>
                      <div className="text-xs text-slate-500 font-mono">ID: {selectedStudent.studentId}</div>
                      <div className="text-[11px] text-purple-700 font-medium">
                        {selectedStudent.currentClass 
                          ? `${selectedStudent.currentClass.course} (${selectedStudent.currentClass.semester || 'Sem 1'})`
                          : selectedStudent.college || 'Higher Ed'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ledger balances */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 text-center">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Total Fee</span>
                    <span className="font-bold text-xs text-slate-900">₹{selectedTotalFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                    <span className="block text-[10px] text-emerald-700 font-bold uppercase">Paid So Far</span>
                    <span className="font-bold text-xs text-emerald-800">₹{selectedPaidFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-100">
                    <span className="block text-[10px] text-amber-700 font-bold uppercase">Balance Due</span>
                    <span className="font-bold text-xs text-amber-900">₹{selectedRemainingDue.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {selectedRemainingDue > 0 && (
                  <button
                    type="button"
                    onClick={() => setPaymentData(prev => ({ ...prev, amount: selectedRemainingDue.toString() }))}
                    className="w-full mt-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <i className="fas fa-wallet text-[11px]"></i> Fill Full Due Amount (₹{selectedRemainingDue.toLocaleString('en-IN')})
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-3 p-4 bg-purple-50/50 rounded-xl border border-dashed border-purple-200 text-center text-xs text-purple-800">
                <i className="fas fa-user-circle text-purple-400 text-xl mb-1 block"></i>
                Please search and select a student above to initiate payment collection.
              </div>
            )}
          </div>

          {/* Step 2: Payment & Concession Processing Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                Collect Fee & Issue Receipt
                <InfoTooltip title="Cashier Collection Engine" text="Enter payment amount, specify payment method (Cash, UPI, Cheque), apply approved concessions, and click to generate an official PDF receipt." />
              </h2>
              <span className="text-[11px] font-mono text-slate-400">INSTITUTIONAL LEDGER</span>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4">
              {/* Fee Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fee Category / Head *</label>
                <select
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#6D4C9C] focus:bg-white"
                  value={paymentData.feeCategory}
                  onChange={e => setPaymentData({ ...paymentData, feeCategory: e.target.value })}
                  disabled={!selectedStudent}
                >
                  {FEE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Amount & Quick chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount Collected (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="e.g. 25000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#6D4C9C] focus:bg-white"
                  value={paymentData.amount}
                  onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })}
                  disabled={!selectedStudent}
                />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold">Quick Set:</span>
                  {[5000, 10000, 25000, 50000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPaymentData(prev => ({ ...prev, amount: amt.toString() }))}
                      disabled={!selectedStudent}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concession / Scholarship Adjustment */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <i className="fas fa-award text-amber-500"></i> Scholarship / Concession
                    <InfoTooltip title="Institutional Concessions" text="Apply fee reductions for Merit scholarships, Sports quota, Staff wards, or EWS students with automatic balance recalculation." />
                  </label>
                  <span className="text-[10px] text-slate-500">Fee Adjustment</span>
                </div>

                <select
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  value={paymentData.selectedConcession}
                  onChange={e => setPaymentData({ ...paymentData, selectedConcession: e.target.value })}
                  disabled={!selectedStudent}
                >
                  {CONCESSION_PRESETS.map(p => (
                    <option key={p.name} value={p.name}>
                      {p.name} {p.amount > 0 ? `(-₹${p.amount.toLocaleString('en-IN')})` : ''}
                    </option>
                  ))}
                </select>

                {paymentData.selectedConcession === 'Custom Concession' && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Concession Reason"
                      className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      value={paymentData.customConcessionName}
                      onChange={e => setPaymentData({ ...paymentData, customConcessionName: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Deduction (₹)"
                      className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      value={paymentData.customConcessionAmount}
                      onChange={e => setPaymentData({ ...paymentData, customConcessionAmount: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Cash', icon: 'fa-money-bill-wave' },
                    { id: 'Online (Razorpay)', icon: 'fa-bolt' },
                    { id: 'Online (UPI/QR)', icon: 'fa-qrcode' },
                    { id: 'Net Banking', icon: 'fa-globe' },
                    { id: 'Card', icon: 'fa-credit-card' },
                    { id: 'Demand Draft', icon: 'fa-file-invoice' },
                    { id: 'Cheque', icon: 'fa-money-check' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!selectedStudent}
                      onClick={() => handlePaymentMethodChange(m.id)}
                      className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                        paymentData.paymentMethod === m.id
                          ? 'bg-[#6D4C9C] text-white border-[#6D4C9C] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <i className={`fas ${m.icon} text-sm`}></i>
                      <span className="text-[10px] text-center leading-tight">{m.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction Ref / Cheque No */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction Ref / Cheque / UTR No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/123456789 or CHQ-00981"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-[#6D4C9C] focus:bg-white"
                  value={paymentData.transactionId}
                  onChange={e => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                  disabled={!selectedStudent}
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Internal Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Paid in full for Autumn semester"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#6D4C9C] focus:bg-white"
                  value={paymentData.remarks}
                  onChange={e => setPaymentData({ ...paymentData, remarks: e.target.value })}
                  disabled={!selectedStudent}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedStudent}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fas fa-file-invoice-dollar text-sm"></i>
                Collect Payment & Generate Receipt
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Payments Ledger & Printable Receipts (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <i className="fas fa-receipt text-[#6D4C9C]"></i>
                  {selectedStudent ? `${selectedStudent.name}'s Receipts` : 'Institutional Fee Ledger (All Students)'}
                  <InfoTooltip title="Financial Audit Trail" text="Real-time chronological ledger of all cash, UPI, and bank transactions. Filter by payment method or search by receipt number." />
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {displayedPayments.length} recorded payments
                </p>
              </div>

              {/* Method Filters */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                {['ALL', 'CASH', 'ONLINE', 'CHEQUE'].map(f => (
                  <button
                    key={f}
                    onClick={() => {
                      setTableFilter(f);
                      setLedgerPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                      tableFilter === f ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Search Bar */}
            <div className="mb-4 relative">
              <input
                type="text"
                placeholder="Filter by Receipt No, Student ID, Category..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4C9C]"
                value={tableSearch}
                onChange={e => {
                  setTableSearch(e.target.value);
                  setLedgerPage(1);
                }}
              />
              <i className="fas fa-filter absolute left-2.5 top-3 text-slate-400 text-xs"></i>
            </div>

            {/* Transactions Table with Pagination */}
            {(() => {
              const totalLedgerPages = Math.ceil(displayedPayments.length / ledgerPageSize) || 1;
              const startLedgerIndex = (ledgerPage - 1) * ledgerPageSize;
              const paginatedPayments = displayedPayments.slice(startLedgerIndex, startLedgerIndex + ledgerPageSize);

              return (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">
                          <span className="inline-flex items-center">
                            Receipt No
                            <InfoTooltip title="Digital Receipt Code" text="Unique tamper-evident cryptographic receipt number for institutional accounting." position="bottom" />
                          </span>
                        </th>
                        <th className="p-3">Student</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-right">
                          <span className="inline-flex items-center justify-end">
                            Amount (₹)
                            <InfoTooltip title="Transaction Value" text="Net tuition or fee amount credited after applying scholarships/concessions." position="bottom" />
                          </span>
                        </th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Date</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loadingLedger ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400">
                            <i className="fas fa-spinner fa-spin mr-2"></i> Loading transactions...
                          </td>
                        </tr>
                      ) : displayedPayments.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400">
                            <i className="fas fa-folder-open text-2xl mb-2 block text-slate-300"></i>
                            No transactions found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedPayments.map(p => (
                          <tr key={p._id || p.receiptNumber} className="hover:bg-slate-50/70 transition">
                            <td className="p-3">
                              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                {p.receiptNumber}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{p.studentName || p.studentId}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {p.studentId}</div>
                            </td>
                            <td className="p-3 text-slate-700 font-medium">
                              {p.feeCategory || 'Tuition'}
                            </td>
                            <td className="p-3 text-right">
                              <span className="font-bold text-emerald-700 text-xs">
                                ₹{p.amount?.toLocaleString('en-IN')}
                              </span>
                              {p.scholarship?.amount > 0 && (
                                <span className="block text-[9px] text-amber-600">
                                  (-₹{p.scholarship.amount})
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.paymentMethod === 'Cash'
                                  ? 'bg-slate-100 text-slate-700'
                                  : p.paymentMethod.includes('Online')
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                {p.paymentMethod}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 font-mono text-[11px]">
                              {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : 'N/A'}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleOpenReceipt(p)}
                                title="View & Print Official Receipt"
                                className="p-1.5 bg-slate-100 hover:bg-[#6D4C9C] hover:text-white text-slate-700 rounded-lg transition active:scale-95 cursor-pointer"
                              >
                                <i className="fas fa-print text-xs"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Clean Ledger Pagination Footer */}
                  {displayedPayments.length > 0 && (
                    <div className="px-4 py-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div>
                        Showing <strong>{startLedgerIndex + 1}</strong> to <strong>{Math.min(startLedgerIndex + ledgerPageSize, displayedPayments.length)}</strong> of <strong>{displayedPayments.length}</strong> receipts
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setLedgerPage(p => Math.max(p - 1, 1))}
                          disabled={ledgerPage === 1}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer"
                        >
                          Prev
                        </button>
                        <span className="px-2.5 py-1 font-bold text-[#6D4C9C] bg-purple-50 border border-purple-200 rounded-lg">
                          Page {ledgerPage} of {totalLedgerPages}
                        </span>
                        <button
                          onClick={() => setLedgerPage(p => Math.min(p + 1, totalLedgerPages))}
                          disabled={ledgerPage === totalLedgerPages}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Institutional Printable Formal Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={activeReceipt}
        student={receiptStudentData || selectedStudent}
      />
    </div>
  );
};

export default FeeCashierPortal;
