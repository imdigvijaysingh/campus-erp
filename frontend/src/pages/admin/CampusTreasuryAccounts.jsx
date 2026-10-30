import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import InfoTooltip from '../../components/common/InfoTooltip';
import api from '../../utils/api';

const CampusTreasuryAccounts = () => {
  const [activeTab, setActiveTab] = useState('bank-accounts'); // 'bank-accounts' | 'pending-receivables' | 'salary-structure' | 'salaries-to-pay'
  const [searchStaff, setSearchStaff] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);
  const [realFeeStats, setRealFeeStats] = useState({ totalCollected: 0, totalOutstanding: 0, collectionRate: '100.0' });

  useEffect(() => {
    const fetchTreasuryData = async () => {
      try {
        const [feeRes, staffRes] = await Promise.all([
          api.get('/fees/stats').catch(() => ({ data: {} })),
          api.get('/staff').catch(() => ({ data: { data: [] } }))
        ]);

        const fData = feeRes.data || {};
        const collected = Number(fData.totalCollected || 0);
        const outstanding = Number(fData.totalOutstanding || 0);
        const rate = fData.collectionRate || (collected > 0 ? '100.0' : '0.0');

        setRealFeeStats({
          totalCollected: collected,
          totalOutstanding: outstanding,
          collectionRate: rate
        });

        // Update fee collection account with real collected funds
        if (collected > 0) {
          setBankAccounts(prev => prev.map(acc => {
            if (acc.id === 'acc-2') {
              return {
                ...acc,
                balance: collected,
                formattedBalance: `₹${collected.toLocaleString()}`
              };
            }
            return acc;
          }));
        }

        const sList = Array.isArray(staffRes.data) ? staffRes.data : (staffRes.data?.data || []);
        if (sList.length > 0) {
          const mapped = sList.map((stf, idx) => ({
            id: stf._id || `stf-${idx}`,
            name: stf.name || stf.username || `Faculty Member ${idx + 1}`,
            empId: stf.employeeId || stf.staffId || `EMP_${100 + idx}`,
            role: stf.designation || stf.role || 'Faculty Member',
            department: stf.department || 'Academic Department',
            monthlyGross: stf.salary || 35000,
            deductions: Math.round((stf.salary || 35000) * 0.1),
            netPayable: Math.round((stf.salary || 35000) * 0.9),
            bankAccount: `•••• ${1000 + (idx * 111) % 9000}`,
            status: 'Pending',
            paymentMode: 'NEFT Direct Credit'
          }));
          setPendingStaffSalaries(mapped);
        }
      } catch (err) {
        console.error('Failed to load real treasury data:', err);
      }
    };

    fetchTreasuryData();
  }, []);

  // Bank Accounts Data
  const [bankAccounts, setBankAccounts] = useState([
    {
      id: 'acc-1',
      bankName: 'HDFC Bank',
      accountName: 'Campus Operations & Payroll Account',
      accountNumber: '50100482918412',
      maskedNumber: '•••• •••• 8412',
      ifsc: 'HDFC0001245',
      branch: 'University Main Campus Branch',
      accountType: 'Current Institutional A/c',
      balance: 4280000,
      formattedBalance: '₹42,80,000',
      purpose: 'Monthly Faculty/Staff Payroll, Campus OPEX, Utilities',
      lastSynced: '10 minutes ago',
      status: 'Active • Corporate NetBanking Connected',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: 'fa-building-columns',
      color: 'from-blue-700 to-indigo-800'
    },
    {
      id: 'acc-2',
      bankName: 'State Bank of India',
      accountName: 'Student Fee Escrow & Cashier Account',
      accountNumber: '381920481904',
      maskedNumber: '•••• •••• 1904',
      ifsc: 'SBIN0004921',
      branch: 'Secretariat Road Branch',
      accountType: 'Designated Fee Collection A/c',
      balance: 1860000,
      formattedBalance: '₹18,60,000',
      purpose: 'Term Tuition Fees, Admissions & Exam Fee Inflows',
      lastSynced: 'Just now',
      status: 'Active • Real-Time Razorpay / UPI Gateway Sync',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: 'fa-indian-rupee-sign',
      color: 'from-purple-700 to-indigo-900'
    },
    {
      id: 'acc-3',
      bankName: 'ICICI Bank',
      accountName: 'Campus Infrastructure & Research Grants A/c',
      accountNumber: '003405017731',
      maskedNumber: '•••• •••• 7731',
      ifsc: 'ICIC0000892',
      branch: 'Cyber City Tech Branch',
      accountType: 'Statutory Reserve & Research A/c',
      balance: 640000,
      formattedBalance: '₹6,40,000',
      purpose: 'NEP 2020 Equipment, NAAC Development & Capital Reserves',
      lastSynced: '1 hour ago',
      status: 'Active • Annual Statutory Audit Reconciled',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: 'fa-shield-halved',
      color: 'from-amber-600 to-orange-800'
    }
  ]);

  // Total Liquid Funds
  const totalLiquidFunds = bankAccounts.reduce((sum, b) => sum + b.balance, 0);

  // Department Salary Structure Data
  const departmentSalaryStructures = [
    {
      id: 'dept-cse',
      deptName: 'Computer Science & Information Technology',
      facultyCount: 28,
      monthlyBudget: 720000,
      avgSalary: 25714,
      disbursed: 540000,
      pending: 180000,
      breakdown: { basic: 360000, hra: 144000, allowances: 129600, epfEsic: 86400 },
      color: 'border-l-purple-600'
    },
    {
      id: 'dept-mech',
      deptName: 'Mechanical, Civil & Electrical Engineering',
      facultyCount: 22,
      monthlyBudget: 510000,
      avgSalary: 23181,
      disbursed: 410000,
      pending: 100000,
      breakdown: { basic: 255000, hra: 102000, allowances: 91800, epfEsic: 61200 },
      color: 'border-l-blue-600'
    },
    {
      id: 'dept-mgmt',
      deptName: 'Management, Commerce & MBA Studies',
      facultyCount: 18,
      monthlyBudget: 440000,
      avgSalary: 24444,
      disbursed: 360000,
      pending: 80000,
      breakdown: { basic: 220000, hra: 88000, allowances: 79200, epfEsic: 52800 },
      color: 'border-l-emerald-600'
    },
    {
      id: 'dept-school',
      deptName: 'K-12 School Secondary Teaching Faculty',
      facultyCount: 18,
      monthlyBudget: 360000,
      avgSalary: 20000,
      disbursed: 310000,
      pending: 50000,
      breakdown: { basic: 180000, hra: 72000, allowances: 64800, epfEsic: 43200 },
      color: 'border-l-amber-500'
    },
    {
      id: 'dept-support',
      deptName: 'Administrative, Lab Technicians & Helping Staff',
      facultyCount: 34,
      monthlyBudget: 450000,
      avgSalary: 13235,
      disbursed: 200000,
      pending: 250000,
      breakdown: { basic: 225000, hra: 90000, allowances: 81000, epfEsic: 54000 },
      color: 'border-l-rose-500'
    }
  ];

  // Total Monthly Salary Budget
  const totalMonthlyPayroll = departmentSalaryStructures.reduce((sum, d) => sum + d.monthlyBudget, 0);
  const totalDisbursed = departmentSalaryStructures.reduce((sum, d) => sum + d.disbursed, 0);
  const totalSalaryPending = departmentSalaryStructures.reduce((sum, d) => sum + d.pending, 0);

  // Staff with Pending Salaries Roster
  const [pendingStaffSalaries, setPendingStaffSalaries] = useState([
    {
      id: 'stf-101',
      name: 'Dr. Vivek Verma',
      empId: 'FAC_CSE_042',
      role: 'Associate Professor',
      department: 'Computer Science & Information Technology',
      monthlyGross: 48000,
      deductions: 4800,
      netPayable: 43200,
      bankAccount: '•••• 6631 (HDFC)',
      status: 'Pending',
      paymentMode: 'NEFT Direct Credit'
    },
    {
      id: 'stf-102',
      name: 'Prof. S. K. Roy',
      empId: 'FAC_CSE_059',
      role: 'Assistant Professor (Lab Lead)',
      department: 'Computer Science & Information Technology',
      monthlyGross: 38000,
      deductions: 3800,
      netPayable: 34200,
      bankAccount: '•••• 9102 (SBI)',
      status: 'Pending',
      paymentMode: 'NEFT Direct Credit'
    },
    {
      id: 'stf-103',
      name: 'Er. Meenakshi Iyer',
      empId: 'FAC_MCH_021',
      role: 'Assistant Professor',
      department: 'Mechanical, Civil & Electrical Engineering',
      monthlyGross: 39000,
      deductions: 3900,
      netPayable: 35100,
      bankAccount: '•••• 4410 (ICICI)',
      status: 'Pending',
      paymentMode: 'NEFT Direct Credit'
    },
    {
      id: 'stf-104',
      name: 'Mrs. Neha Gupta',
      empId: 'SCH_TCH_012',
      role: 'Senior Secondary Mathematics Teacher',
      department: 'K-12 School Secondary Teaching Faculty',
      monthlyGross: 28000,
      deductions: 2800,
      netPayable: 25200,
      bankAccount: '•••• 1205 (SBI)',
      status: 'Pending',
      paymentMode: 'NEFT Direct Credit'
    },
    {
      id: 'stf-105',
      name: 'Mr. Rajesh Khanna',
      empId: 'SCH_TCH_018',
      role: 'General Science Teacher',
      department: 'K-12 School Secondary Teaching Faculty',
      monthlyGross: 27000,
      deductions: 2700,
      netPayable: 24300,
      bankAccount: '•••• 7719 (HDFC)',
      status: 'Pending',
      paymentMode: 'NEFT Direct Credit'
    },
    {
      id: 'stf-106',
      name: 'Rameshwar Pal',
      empId: 'STF_SUP_003',
      role: 'Senior Campus Security Supervisor',
      department: 'Administrative, Lab Technicians & Helping Staff',
      monthlyGross: 18000,
      deductions: 1800,
      netPayable: 16200,
      bankAccount: '•••• 3091 (PNB)',
      status: 'Pending',
      paymentMode: 'UPI / Direct Bank'
    },
    {
      id: 'stf-107',
      name: 'Santosh Kumar',
      empId: 'STF_SUP_014',
      role: 'Head Facility & Lab Helper',
      department: 'Administrative, Lab Technicians & Helping Staff',
      monthlyGross: 15000,
      deductions: 1500,
      netPayable: 13500,
      bankAccount: '•••• 8820 (SBI)',
      status: 'Pending',
      paymentMode: 'UPI / Direct Bank'
    },
    {
      id: 'stf-108',
      name: 'Pooja Rawat',
      empId: 'STF_SUP_022',
      role: 'Campus Caretaker & Sanitation Staff',
      department: 'Administrative, Lab Technicians & Helping Staff',
      monthlyGross: 14000,
      deductions: 1400,
      netPayable: 12600,
      bankAccount: '•••• 5118 (Bank of Baroda)',
      status: 'Pending',
      paymentMode: 'UPI / Direct Bank'
    }
  ]);

  // Pending Student Fee Dues Data
  const pendingStudentDues = {
    totalPending: 380000,
    totalDemand: 2240000,
    collectionPercentage: 83.0,
    aging: [
      { label: '< 30 Days (Current Term Installment)', amount: 190000, students: 42, color: 'bg-emerald-500', textCol: 'text-emerald-700', bgCol: 'bg-emerald-50' },
      { label: '30 - 60 Days (Grace Period Warning)', amount: 120000, students: 18, color: 'bg-amber-500', textCol: 'text-amber-700', bgCol: 'bg-amber-50' },
      { label: '> 60 Days (Critical Overdue & Exam Gate)', amount: 70000, students: 8, color: 'bg-rose-500', textCol: 'text-rose-700', bgCol: 'bg-rose-50' }
    ],
    byCourse: [
      { course: 'B.Tech CSE (6th Sem)', totalFee: 890000, collected: 820000, pending: 70000, students: 14, rate: '92.1%' },
      { course: 'BCA (4th Sem)', totalFee: 475000, collected: 410000, pending: 65000, students: 12, rate: '86.3%' },
      { course: 'BBA & MBA Studies', totalFee: 475000, collected: 380000, pending: 95000, students: 16, rate: '80.0%' },
      { course: 'K-12 School (Class 6th–12th)', totalFee: 400000, collected: 250000, pending: 150000, students: 26, rate: '62.5%' }
    ]
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mark single employee paid
  const handlePayStaff = (id, name, amount) => {
    setPendingStaffSalaries(prev => prev.map(s => s.id === id ? { ...s, status: 'Paid' } : s));
    showToast(`✓ Salary of ₹${amount.toLocaleString()} successfully credited to ${name}`);
  };

  // Disburse batch payroll
  const handleBatchDisburse = () => {
    const pendingList = pendingStaffSalaries.filter(s => s.status === 'Pending');
    if (pendingList.length === 0) {
      showToast('All staff salaries for this cycle are already disbursed!');
      return;
    }
    const totalBatch = pendingList.reduce((sum, s) => sum + s.netPayable, 0);
    setPendingStaffSalaries(prev => prev.map(s => ({ ...s, status: 'Paid' })));
    showToast(`✓ Batch NEFT Transfer Disbursed! Total ₹${totalBatch.toLocaleString()} credited to ${pendingList.length} accounts.`);
  };

  // Filter staff by department and search
  const filteredStaff = pendingStaffSalaries.filter(s => {
    const matchesDept = departmentFilter === 'all' || s.department.toLowerCase().includes(departmentFilter.toLowerCase());
    const matchesQuery = searchStaff === '' || s.name.toLowerCase().includes(searchStaff.toLowerCase()) || s.empId.toLowerCase().includes(searchStaff.toLowerCase());
    return matchesDept && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-[modalFadeIn_0.3s_ease] text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-[modalFadeIn_0.2s_ease]">
          <i className="fas fa-circle-check text-emerald-400 text-base"></i>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Campus Treasury & Financial Accounts
            </h1>
            <InfoTooltip 
              title="Institutional Treasury & Financial Control"
              text="Centralized oversight of campus liquidity across institutional bank accounts, pending student receivables aging, departmental faculty/staff salary structures, and upcoming payroll payout liabilities."
              tip="Click 'Disburse Batch Payroll' to simulate corporate NEFT clearing."
            />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time liquid bank balances, fee recovery aging, department payroll structures, and pending salary clearance.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/fee-portal"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-2"
          >
            <i className="fas fa-cash-register text-[#6D4C9C]"></i>
            <span>Fee Cashier Portal</span>
          </Link>
          <button
            type="button"
            onClick={handleBatchDisburse}
            className="px-4 py-2 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <i className="fas fa-bolt-lightning text-amber-300"></i>
            <span>Disburse Batch Payroll</span>
          </button>
        </div>
      </div>

      {/* 4 Core Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Money in Bank Accounts */}
        <div 
          onClick={() => setActiveTab('bank-accounts')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'bank-accounts'
              ? 'bg-purple-50/50 border-purple-300 ring-2 ring-purple-500/20 shadow-sm'
              : 'bg-white border-slate-100 hover:border-purple-200 shadow-2xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6D4C9C] flex items-center justify-center text-lg shrink-0">
              <i className="fas fa-vault"></i>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              3 Active A/cs
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-500">Money in Bank Accounts</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              ₹{(totalLiquidFunds / 100000).toFixed(1)}L
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              ₹42.8L HDFC • ₹18.6L SBI • ₹6.4L ICICI
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-purple-700 font-bold flex items-center gap-1">
            <span>View Account Passbooks</span>
            <i className="fas fa-arrow-right text-[8px]"></i>
          </div>
        </div>

        {/* Metric 2: Pending Student Receivables */}
        <div 
          onClick={() => setActiveTab('pending-receivables')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'pending-receivables'
              ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-slate-100 hover:border-amber-200 shadow-2xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg shrink-0">
              <i className="fas fa-clock-rotate-left"></i>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              {realFeeStats.collectionRate}% Realized
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-500">Money Pending from Students</p>
            <h3 className="text-2xl font-black text-amber-700 font-mono mt-0.5">
              ₹{realFeeStats.totalOutstanding > 0 ? Number(realFeeStats.totalOutstanding).toLocaleString() : '0'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {realFeeStats.totalOutstanding > 0 ? `₹${realFeeStats.totalOutstanding.toLocaleString()} ledger dues pending` : 'All registered student fee accounts cleared'}
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-amber-700 font-bold flex items-center gap-1">
            <span>Inspect Aging Breakdown</span>
            <i className="fas fa-arrow-right text-[8px]"></i>
          </div>
        </div>

        {/* Metric 3: Department Salary Budget */}
        <div 
          onClick={() => setActiveTab('salary-structure')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'salary-structure'
              ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20 shadow-sm'
              : 'bg-white border-slate-100 hover:border-blue-200 shadow-2xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shrink-0">
              <i className="fas fa-sitemap"></i>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              5 Departments
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-500">Monthly Salary Structure</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
              ₹{(totalMonthlyPayroll / 100000).toFixed(1)}L
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              120 Faculty & Staff workforce
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-blue-700 font-bold flex items-center gap-1">
            <span>View Department Pay Scales</span>
            <i className="fas fa-arrow-right text-[8px]"></i>
          </div>
        </div>

        {/* Metric 4: Salaries to be Paid */}
        <div 
          onClick={() => setActiveTab('salaries-to-pay')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === 'salaries-to-pay'
              ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/20 shadow-sm'
              : 'bg-white border-slate-100 hover:border-rose-200 shadow-2xs'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center text-lg shrink-0">
              <i className="fas fa-hand-holding-dollar"></i>
            </div>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
              Pending Clearance
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-500">Salaries Needed to be Paid</p>
            <h3 className="text-2xl font-black text-rose-600 font-mono mt-0.5">
              ₹{(totalSalaryPending / 100000).toFixed(1)}L
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {pendingStaffSalaries.filter(s => s.status === 'Pending').length} employees pending bank transfer
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-rose-700 font-bold flex items-center gap-1">
            <span>Process Staff Payouts</span>
            <i className="fas fa-arrow-right text-[8px]"></i>
          </div>
        </div>
      </div>

      {/* Navigation Segmented Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('bank-accounts')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'bank-accounts'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fas fa-vault text-[#6D4C9C]"></i>
          <span>Money in Bank Accounts (3)</span>
          <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.2 rounded-full font-mono">
            ₹{(totalLiquidFunds / 100000).toFixed(1)}L
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pending-receivables')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'pending-receivables'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fas fa-hand-holding-dollar text-amber-600"></i>
          <span>Pending Student Dues</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full font-mono">
            ₹{realFeeStats.totalOutstanding > 0 ? `${(realFeeStats.totalOutstanding / 100000).toFixed(1)}L` : '0'} Due
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('salary-structure')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'salary-structure'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fas fa-sitemap text-blue-600"></i>
          <span>Department Salary Structures</span>
          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.2 rounded-full font-mono">
            5 Depts
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('salaries-to-pay')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'salaries-to-pay'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <i className="fas fa-money-check-dollar text-rose-600"></i>
          <span>Salaries Needed to be Paid</span>
          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.2 rounded-full font-mono">
            ₹6.6L Pending
          </span>
        </button>
      </div>

      {/* TAB 1: MONEY IN BANK ACCOUNTS */}
      {activeTab === 'bank-accounts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {bankAccounts.map((acc) => (
              <div 
                key={acc.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${acc.color}`} />
                
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3 mt-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center text-sm font-bold shadow-2xs">
                        <i className={`fas ${acc.icon}`}></i>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{acc.bankName}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">{acc.accountType}</span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${acc.badgeColor}`}>
                      Verified
                    </span>
                  </div>

                  <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 mb-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Account Number:</span>
                      <span className="font-mono font-bold text-slate-800 tracking-wider">{acc.maskedNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>IFSC Code:</span>
                      <span className="font-mono font-bold text-slate-800">{acc.ifsc}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Branch:</span>
                      <span className="text-slate-700 font-medium truncate max-w-[170px]">{acc.branch}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                    <span className="font-bold text-slate-700">Dedicated Purpose:</span> {acc.purpose}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Balance</span>
                      <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{acc.formattedBalance}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Synced {acc.lastSynced}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Institutional Liquidity & Working Capital Status */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Campus Working Capital Health</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Total Available Institutional Liquidity: ₹{(totalLiquidFunds / 100000).toFixed(2)} Lakhs
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Current liquid reserves provide <span className="text-emerald-400 font-bold">2.7 months of full payroll & operational runway</span> without requiring emergency overdraft facilities.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => showToast('Passbook export initiated. Downloading ledger reconciliation statement...')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2 border border-white/10"
              >
                <i className="fas fa-file-arrow-down"></i>
                <span>Download Passbooks (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING STUDENT DUES & AGING ANALYSIS */}
      {activeTab === 'pending-receivables' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <i className="fas fa-clock-rotate-left text-amber-600"></i>
                  <span>Pending Student Fee Receivables & Aging Analysis</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Total Term Demand: ₹{(pendingStudentDues.totalDemand / 100000).toFixed(1)}L • Collected: ₹18.6L (83%) • Total Pending: ₹{(pendingStudentDues.totalPending / 100000).toFixed(1)}L (17%)
                </p>
              </div>
              <Link
                to="/admin/fee-portal"
                className="px-4 py-2 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Launch Cashier Terminal</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
            </div>

            {/* 3-Tier Aging Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {pendingStudentDues.aging.map((tier, idx) => (
                <div key={idx} className={`p-4 rounded-xl border border-slate-100 ${tier.bgCol} flex flex-col justify-between`}>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${tier.textCol}`}>
                      Aging Bucket {idx + 1}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{tier.label}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Affecting <span className="font-bold text-slate-800">{tier.students} students</span> across classes
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">Total Unpaid:</span>
                    <span className="text-xl font-black text-slate-900 font-mono">
                      ₹{(tier.amount / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Program / Course Wise Fee Recovery Table */}
            <h3 className="font-extrabold text-slate-900 text-sm mb-3">
              Department & Course Wise Fee Recovery Matrix
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Program / Academic Class</th>
                    <th className="py-3 px-4">Total Demand</th>
                    <th className="py-3 px-4">Fees Realized</th>
                    <th className="py-3 px-4">Money Pending</th>
                    <th className="py-3 px-4">Pending Students</th>
                    <th className="py-3 px-4">Collection Rate</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pendingStudentDues.byCourse.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{c.course}</td>
                      <td className="py-3.5 px-4 font-mono font-medium">₹{(c.totalFee / 1000).toFixed(0)}k</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">₹{(c.collected / 1000).toFixed(0)}k</td>
                      <td className="py-3.5 px-4 font-mono font-black text-amber-700">₹{(c.pending / 1000).toFixed(0)}k</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">{c.students} Students</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-[11px]">{c.rate}</span>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: c.rate }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => showToast(`Automated payment reminder circular dispatched to all ${c.students} students in ${c.course}`)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] transition border border-amber-200 cursor-pointer"
                        >
                          Send Reminder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENT SALARY STRUCTURE */}
      {activeTab === 'salary-structure' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <i className="fas fa-sitemap text-blue-600"></i>
                  <span>Departmental Faculty & Staff Salary Structures</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly institutional payroll: ₹{(totalMonthlyPayroll / 100000).toFixed(2)} Lakhs across 120 teaching faculty and helping staff
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Monthly Budget</span>
                <span className="text-xl font-black text-slate-900 font-mono">₹24,80,000</span>
              </div>
            </div>

            {/* Department Breakdown Cards */}
            <div className="space-y-4">
              {departmentSalaryStructures.map((dept) => (
                <div 
                  key={dept.id}
                  className={`p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all border-l-4 ${dept.color} shadow-2xs`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{dept.deptName}</h4>
                      <p className="text-xs text-slate-500">
                        {dept.facultyCount} Employees • Average Salary: <span className="font-bold text-slate-800">₹{dept.avgSalary.toLocaleString()} / mo</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-900 font-mono bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                        Budget: ₹{(dept.monthlyBudget / 100000).toFixed(1)}L / mo
                      </span>
                    </div>
                  </div>

                  {/* Component Breakdown Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-200/60">
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">Basic Pay (50%)</span>
                      <span className="font-mono font-bold text-slate-800">₹{dept.breakdown.basic.toLocaleString()}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">HRA (20%)</span>
                      <span className="font-mono font-bold text-slate-800">₹{dept.breakdown.hra.toLocaleString()}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">DA & Allowances (18%)</span>
                      <span className="font-mono font-bold text-slate-800">₹{dept.breakdown.allowances.toLocaleString()}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block">Statutory EPF & Tax (12%)</span>
                      <span className="font-mono font-bold text-purple-700">₹{dept.breakdown.epfEsic.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-700 font-bold">
                        Disbursed: ₹{dept.disbursed.toLocaleString()}
                      </span>
                      <span>•</span>
                      <span className="text-rose-600 font-bold">
                        Pending: ₹{dept.pending.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {((dept.disbursed / dept.monthlyBudget) * 100).toFixed(0)}% cleared
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SALARIES NEEDED TO BE PAID */}
      {activeTab === 'salaries-to-pay' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <i className="fas fa-hand-holding-dollar text-rose-600"></i>
                  <span>Pending Salaries Requiring Clearance (This Cycle)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {pendingStaffSalaries.filter(s => s.status === 'Pending').length} faculty and staff members pending payroll clearance • Total: ₹{(pendingStaffSalaries.filter(s => s.status === 'Pending').reduce((sum, s) => sum + s.netPayable, 0) / 100000).toFixed(2)} Lakhs
                </p>
              </div>
              <button
                type="button"
                onClick={handleBatchDisburse}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <i className="fas fa-money-check-dollar"></i>
                <span>Disburse All Pending (Batch NEFT)</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 max-w-sm">
                <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Search staff by name or EMP ID..."
                  value={searchStaff}
                  onChange={(e) => setSearchStaff(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6D4C9C] focus:bg-white transition"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Filter Department:</span>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="all">All Departments</option>
                  <option value="computer">Computer Science & IT</option>
                  <option value="mechanical">Mechanical & Civil</option>
                  <option value="school">K-12 School Secondary</option>
                  <option value="administrative">Helping & Support Staff</option>
                </select>
              </div>
            </div>

            {/* Staff Payout Roster Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department & Role</th>
                    <th className="py-3 px-4">Gross Salary</th>
                    <th className="py-3 px-4">Deductions</th>
                    <th className="py-3 px-4">Net Salary Payable</th>
                    <th className="py-3 px-4">Designated Bank Account</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{staff.name}</div>
                        <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-semibold">
                          {staff.empId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{staff.role}</div>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">{staff.department}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium">₹{staff.monthlyGross.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono text-rose-600">-₹{staff.deductions.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 text-sm">
                        ₹{staff.netPayable.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {staff.bankAccount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          staff.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {staff.status === 'Paid' ? 'Paid ✓' : 'Pending Transfer'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {staff.status === 'Paid' ? (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                            <i className="fas fa-circle-check text-xs"></i>
                            <span>Disbursed</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePayStaff(staff.id, staff.name, staff.netPayable)}
                            className="px-3 py-1 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white font-bold text-xs rounded-lg transition shadow-2xs cursor-pointer active:scale-95"
                          >
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CampusTreasuryAccounts;
