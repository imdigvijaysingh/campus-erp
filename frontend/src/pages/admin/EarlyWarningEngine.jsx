import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const EarlyWarningEngine = () => {
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [recalculating, setRecalculating] = useState(false);
  
  // Modals state
  const [diagnosisModalStudent, setDiagnosisModalStudent] = useState(null);
  const [interventionModalStudent, setInterventionModalStudent] = useState(null);
  const [interventionForm, setInterventionForm] = useState({
    category: 'PARENT_COMMUNICATION',
    channel: 'WHATSAPP',
    urgency: 'CRITICAL',
    title: '',
    assignedTo: 'Dr. Meenakshi Iyer (Department Mentor)',
    notes: ''
  });
  const [submittingIntervention, setSubmittingIntervention] = useState(false);

  // Lock body scroll and close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDiagnosisModalStudent(null);
        setInterventionModalStudent(null);
      }
    };

    if (diagnosisModalStudent || interventionModalStudent) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [diagnosisModalStudent, interventionModalStudent]);

  // Fetch summary & student risk list
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, studentsRes] = await Promise.all([
        api.get('/early-warning/summary'),
        api.get(`/early-warning/students?tier=${tierFilter}&department=${deptFilter}&search=${encodeURIComponent(searchQuery)}`)
      ]);

      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load Early Warning Engine data:', err);
      toast.error('Could not load AI Risk Engine data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [tierFilter, deptFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const res = await api.post('/early-warning/recalculate', {});
      if (res.data.success) {
        toast.success(res.data.message || 'AI Risk Engine recalculated successfully!');
        await fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to recalculate risk scores');
    } finally {
      setRecalculating(false);
    }
  };

  const handleExportCSV = () => {
    if (!students || students.length === 0) {
      return toast.error('No student risk records to export');
    }
    const headers = ['Student ID', 'Student Name', 'Department', 'Risk Score', 'Risk Tier', 'Attendance %', 'Detention Alert', 'Unpaid Dues (INR)', 'Primary Driver'];
    const rows = students.map(s => [
      `"${s.studentId}"`,
      `"${s.student?.name || ''}"`,
      `"${s.student?.programId?.name || s.student?.specialization || 'B.Tech'}"`,
      s.overallRiskScore,
      s.riskTier,
      `"${s.student?.attendance || 0}%"`,
      s.detentionAlert ? 'YES (< 75%)' : 'NO',
      s.factorBreakdown?.financialRisk ? (s.student?.feeDetails?.totalAmount - s.student?.feeDetails?.paidAmount) : 0,
      `"${(s.primaryDrivers && s.primaryDrivers[0]) ? s.primaryDrivers[0].replace(/"/g, '""') : 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Shyvora_AI_Early_Warning_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Risk register exported successfully!');
  };

  const openInterventionModal = (studentRiskItem) => {
    const student = studentRiskItem.student;
    const defaultTitle = studentRiskItem.detentionAlert
      ? `Urgent Attendance Debarment Notice (${student.attendance}% Attendance)`
      : `Academic Counseling Session (${studentRiskItem.overallRiskScore}% Risk Score)`;

    setInterventionModalStudent(studentRiskItem);
    setInterventionForm({
      category: studentRiskItem.detentionAlert ? 'PARENT_COMMUNICATION' : 'STUDENT_COUNSELING',
      channel: 'WHATSAPP',
      urgency: studentRiskItem.riskTier === 'HIGH' ? 'CRITICAL' : 'HIGH',
      title: defaultTitle,
      assignedTo: 'Prof. S. K. Verma (HOD / Mentor)',
      notes: `Identified by Shyvora AI Risk Engine with ${studentRiskItem.overallRiskScore}% Risk Score. Primary cause: ${studentRiskItem.primaryDrivers?.[0] || 'Academic progress review required.'}`
    });
  };

  const handleSaveIntervention = async (e) => {
    e.preventDefault();
    if (!interventionModalStudent) return;
    try {
      setSubmittingIntervention(true);
      const payload = {
        studentId: interventionModalStudent.studentId,
        ...interventionForm
      };
      const res = await api.post('/early-warning/interventions', payload);
      if (res.data.success) {
        toast.success(`Intervention assigned for ${interventionModalStudent.student?.name || interventionModalStudent.studentId}!`);
        setInterventionModalStudent(null);
        await fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to save intervention');
    } finally {
      setSubmittingIntervention(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-[fadeIn_0.3s_ease]">
      
      {/* Top Banner / Executive Outcome Engine Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 p-6 md:p-8 text-white shadow-xl border border-indigo-900/50">
        <div className="absolute -right-8 -bottom-10 text-white/5 text-9xl pointer-events-none select-none">
          <i className="fas fa-brain"></i>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Shyvora Outcome Engine
              </span>
              <span className="text-xs font-mono text-slate-400">
                UGC & NEP 2020 Predictive Model
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>AI Early-Warning Risk Engine</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed">
              Real-time multi-factor intelligence continuously flagging students at risk of <span className="text-rose-400 font-semibold">exam debarment (&lt;75% attendance)</span>, <span className="text-amber-300 font-semibold">academic course failure</span>, and <span className="text-purple-300 font-semibold">financial tuition default</span> before dropouts occur.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <i className={`fas fa-arrows-rotate ${recalculating ? 'fa-spin' : ''}`}></i>
              <span>{recalculating ? 'Analyzing Cohort...' : 'Refresh AI Diagnosis'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/15 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-file-arrow-down"></i>
              <span>Export Risk Register</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Column Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Campus Risk Index */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Campus Risk Index</span>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                <span>{summary?.averageCampusRiskScore || 0}</span>
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D4C9C] flex items-center justify-center text-sm shadow-2xs">
              <i className="fas fa-gauge-high"></i>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Cohort Status:</span>
            <span className="font-bold text-emerald-600">Stable (Low Range)</span>
          </div>
        </div>

        {/* Critical Risk Students */}
        <div className="bg-gradient-to-br from-rose-50/70 via-white to-white p-5 rounded-2xl border border-rose-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Critical Risk (P0)</span>
              <div className="text-2xl font-black text-rose-700 mt-1">
                {summary?.highRiskCount || 0}
                <span className="text-xs text-slate-400 font-normal ml-1.5">Students</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-sm shadow-2xs">
              <i className="fas fa-triangle-exclamation"></i>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rose-100 flex items-center justify-between text-[11px]">
            <span className="text-rose-700 font-semibold">Action Required</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">Immediate</span>
          </div>
        </div>

        {/* Detention Alerts (< 75% Attendance) */}
        <div className="bg-gradient-to-br from-amber-50/70 via-white to-white p-5 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Detention Alerts</span>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {summary?.detentionAlertCount || 0}
                <span className="text-xs text-slate-400 font-normal ml-1.5">&lt; 75% Att.</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-sm shadow-2xs">
              <i className="fas fa-user-xmark"></i>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-amber-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">UGC Exam Gate:</span>
            <span className="font-bold text-amber-700">Debarment Risk</span>
          </div>
        </div>

        {/* Fee Default Exposure */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Financial Exposure</span>
              <div className="text-2xl font-black text-purple-900 mt-1">
                {summary?.feeAtRiskCount || 0}
                <span className="text-xs text-slate-400 font-normal ml-1.5">Defaulters</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm shadow-2xs">
              <i className="fas fa-hand-holding-dollar"></i>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Tuition Risk:</span>
            <span className="font-bold text-indigo-700">&gt; 50% Unpaid</span>
          </div>
        </div>

        {/* Active Interventions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Interventions</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {summary?.pendingInterventionsCount || 0}
                <span className="text-xs text-slate-400 font-normal ml-1.5">In Progress</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shadow-2xs">
              <i className="fas fa-shield-heart"></i>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Resolved to Date:</span>
            <span className="font-bold text-emerald-700">{summary?.resolvedInterventionsCount || 0}</span>
          </div>
        </div>

      </div>

      {/* Cohort Risk Breakdown & Department Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Distribution Visualizer */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i className="fas fa-chart-pie text-[#6D4C9C]"></i> Campus Risk Cohort Segmentation
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Total Enrolled Cohort: {summary?.totalStudents || 0} Learners</p>
            </div>
          </div>

          <div className="space-y-4">
            {summary?.riskDistribution?.map((dist, idx) => {
              const total = summary.totalStudents || 1;
              const pct = Math.round((dist.count / total) * 100);
              return (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="flex items-center gap-2" style={{ color: dist.color }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dist.color }}></span>
                      {dist.label}
                    </span>
                    <span className="text-slate-700">{dist.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: dist.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900">
            <i className="fas fa-lightbulb text-indigo-600 mt-0.5"></i>
            <div>
              <span className="font-bold block">Outcome Engine Recommendation:</span>
              <p className="text-[11px] text-indigo-800 mt-0.5 leading-normal">
                Prioritize the <span className="font-bold text-rose-700">{summary?.highRiskCount || 0} critical students</span> with immediate WhatsApp Parent Alerts and schedule department attendance counseling before the upcoming semester cutoff.
              </p>
            </div>
          </div>
        </div>

        {/* Department / Program Risk Matrix */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <i className="fas fa-layer-group text-[#6D4C9C]"></i> Academic Department Risk Matrix
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Sorted by average attrition / failure vulnerability</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
              {summary?.departmentBreakdown?.length || 0} Departments Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5">Department / Program</th>
                  <th className="pb-2.5 text-center">Enrolled</th>
                  <th className="pb-2.5 text-center">Critical (High)</th>
                  <th className="pb-2.5 text-center">Watchlist</th>
                  <th className="pb-2.5 text-right">Avg Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary?.departmentBreakdown?.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 font-bold text-slate-800">{dept.department}</td>
                    <td className="py-2.5 text-center font-semibold text-slate-600">{dept.totalStudents}</td>
                    <td className="py-2.5 text-center">
                      {dept.highRisk > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                          {dept.highRisk} High
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">0</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center">
                      {dept.moderateRisk > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          {dept.moderateRisk}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">0</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-black">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${dept.averageRiskScore >= 70 ? 'bg-rose-50 text-rose-700 border border-rose-200' : (dept.averageRiskScore >= 40 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')}`}>
                        {dept.averageRiskScore} / 100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Main Student Risk Roster & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Header & Filter Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <i className="fas fa-users-viewfinder text-[#6D4C9C]"></i> At-Risk Student Cohort Roster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified by real-time mathematical assessment of Attendance (35%), Academic Marks (30%), Fee Overdue (20%), and Engagement (15%).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Tier Filter Tabs */}
            <div className="bg-slate-200/70 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
              {['ALL', 'HIGH', 'MODERATE', 'LOW'].map(t => (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${tierFilter === t ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {t === 'ALL' ? 'All Tiers' : (t === 'HIGH' ? '🔴 Critical' : (t === 'MODERATE' ? '🟡 Watchlist' : '🟢 Safe'))}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search student or ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none w-48 sm:w-56"
              />
              <i className="fas fa-search absolute left-2.5 top-2.5 text-slate-400 text-xs"></i>
            </form>
          </div>
        </div>

        {/* Student Risk Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent"></div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Running mathematical risk diagnostics...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <i className="fas fa-shield-check text-4xl text-emerald-400 mb-2"></i>
              <p className="text-sm font-bold text-slate-700">No At-Risk Students Found</p>
              <p className="text-xs text-slate-500 mt-1">All learners match your filter criteria or maintain safe standing.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Student Learner</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Fee Status</th>
                  <th className="py-3 px-4">Primary Risk Driver (Explainable AI)</th>
                  <th className="py-3 px-4 text-center">Interventions</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(item => {
                  const s = item.student || {};
                  const isHigh = item.riskTier === 'HIGH';
                  const isMod = item.riskTier === 'MODERATE';
                  const totalFee = s.feeDetails?.totalAmount || 0;
                  const paidFee = s.feeDetails?.paidAmount || 0;
                  const dues = Math.max(0, totalFee - paidFee);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition">
                      {/* Student info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-2xs shrink-0 ${isHigh ? 'bg-rose-100 text-rose-700 border border-rose-200' : (isMod ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200')}`}>
                            {s.photo ? (
                              <img src={s.photo} alt={s.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <span>{s.name ? s.name.charAt(0) : item.studentId.slice(-2)}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">{s.name || 'Unknown Student'}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="font-mono">{item.studentId}</span>
                              <span>•</span>
                              <span className="truncate max-w-[140px]">{s.specialization || s.programId?.name || 'General Course'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 ${isHigh ? 'bg-rose-50 text-rose-700 border border-rose-200' : (isMod ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')}`}>
                            {item.overallRiskScore}%
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isHigh ? 'text-rose-600' : (isMod ? 'text-amber-600' : 'text-emerald-600')}`}>
                            {item.riskTier}
                          </span>
                        </div>
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className={`font-bold text-xs ${item.detentionAlert ? 'text-rose-600' : 'text-slate-800'}`}>
                            {s.attendance || 0}%
                          </span>
                          {item.detentionAlert ? (
                            <span className="text-[10px] font-black text-rose-700 uppercase tracking-tight flex items-center gap-1 mt-0.5">
                              <i className="fas fa-triangle-exclamation text-[9px]"></i> Debarred (&lt;75%)
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                              Eligible (UGC Safe)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fee Status */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {dues > 0 ? `₹${dues.toLocaleString('en-IN')}` : '₹0 (Paid)'}
                          </span>
                          {dues > 0 ? (
                            <span className="text-[10px] text-rose-600 font-semibold mt-0.5">
                              {Math.round((dues / totalFee) * 100)}% Default
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                              Zero Dues
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Primary Driver */}
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-slate-700 text-xs line-clamp-2 leading-tight">
                          {item.primaryDrivers?.[0] || 'On-track'}
                        </span>
                      </td>

                      {/* Active Interventions */}
                      <td className="py-3 px-4 text-center">
                        {item.activeInterventionsCount > 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] inline-flex items-center gap-1">
                            <i className="fas fa-shield-halved text-[9px]"></i>
                            {item.activeInterventionsCount} Active
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">None</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDiagnosisModalStudent(item)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                            title="View In-Depth AI Diagnosis"
                          >
                            <i className="fas fa-stethoscope text-[10px]"></i>
                            <span className="hidden sm:inline">Diagnose</span>
                          </button>

                          <button
                            onClick={() => openInterventionModal(item)}
                            className="px-2.5 py-1.5 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer flex items-center gap-1"
                            title="Take Prescriptive Intervention"
                          >
                            <i className="fas fa-paper-plane text-[10px]"></i>
                            <span>Intervene</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL 1: In-Depth Student Diagnostic Modal (Rendered at top layer using Portal) */}
      {diagnosisModalStudent && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-[fadeIn_0.15s_ease-out]"
          onClick={(e) => { if (e.target === e.currentTarget) setDiagnosisModalStudent(null); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-200/90 my-auto animate-[modalFadeIn_0.2s_ease]">
            {/* Modal Header */}
            <div className="shrink-0 bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 p-5 sm:p-6 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xl shadow-inner">
                  <i className="fas fa-brain"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      diagnosisModalStudent.riskTier === 'HIGH' 
                        ? 'bg-rose-500/25 text-rose-300 border-rose-500/40' 
                        : diagnosisModalStudent.riskTier === 'MODERATE'
                        ? 'bg-amber-500/25 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {diagnosisModalStudent.riskTier} Risk
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      ID: {diagnosisModalStudent.studentId}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    {diagnosisModalStudent.student?.name || 'Student Diagnosis'}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setDiagnosisModalStudent(null)}
                title="Close Diagnostic Modal"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <i className="fas fa-times text-base"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto style-scrollbar">
              
              {/* Overall Score & Probability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Composite Risk Score</span>
                  <div className="text-3xl font-black text-rose-600 mt-1">
                    {diagnosisModalStudent.overallRiskScore}%
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Mathematical outcome formula</span>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Dropout / Debarment Probability</span>
                  <div className="text-3xl font-black text-amber-600 mt-1">
                    {diagnosisModalStudent.dropoutProbability || 0}%
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">If unmitigated this semester</span>
                </div>
              </div>

              {/* 4 Factor Breakdown Bars */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  4-Factor Breakdown Analysis
                </h4>
                <div className="space-y-3">
                  {/* Attendance */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-slate-700">Attendance Risk (35% Weight)</span>
                      <span className="font-bold text-rose-600">{diagnosisModalStudent.factorBreakdown?.attendanceRisk}% Risk</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-rose-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${diagnosisModalStudent.factorBreakdown?.attendanceRisk}%` }}></div>
                    </div>
                  </div>

                  {/* Academic */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-slate-700">Academic / Internal Marks Risk (30% Weight)</span>
                      <span className="font-bold text-amber-600">{diagnosisModalStudent.factorBreakdown?.academicRisk}% Risk</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${diagnosisModalStudent.factorBreakdown?.academicRisk}%` }}></div>
                    </div>
                  </div>

                  {/* Financial */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-slate-700">Financial / Fee Default Risk (20% Weight)</span>
                      <span className="font-bold text-purple-600">{diagnosisModalStudent.factorBreakdown?.financialRisk}% Risk</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${diagnosisModalStudent.factorBreakdown?.financialRisk}%` }}></div>
                    </div>
                  </div>

                  {/* Engagement */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-slate-700">Engagement & Behavioral Risk (15% Weight)</span>
                      <span className="font-bold text-blue-600">{diagnosisModalStudent.factorBreakdown?.engagementRisk}% Risk</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${diagnosisModalStudent.factorBreakdown?.engagementRisk}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Drivers */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Detected Root-Cause Drivers (Explainable AI)
                </h4>
                <div className="space-y-2">
                  {diagnosisModalStudent.primaryDrivers?.map((driver, idx) => (
                    <div key={idx} className="p-3.5 bg-rose-50/80 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-rose-900 font-medium leading-relaxed">
                      <i className="fas fa-circle-exclamation text-rose-600 mt-0.5 shrink-0"></i>
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Prescriptive Interventions */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  AI Prescriptive Interventions
                </h4>
                <div className="space-y-2.5">
                  {diagnosisModalStudent.recommendedInterventions?.map((rec, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-[#5B21B6]">
                            {rec.category.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {rec.urgency}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-xs mt-1.5">{rec.title}</h5>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{rec.actionSummary}</p>
                      </div>

                      <button
                        onClick={() => {
                          setDiagnosisModalStudent(null);
                          openInterventionModal(diagnosisModalStudent);
                        }}
                        className="px-3 py-1.5 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer transition active:scale-95"
                      >
                        Execute
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50/90 border-t border-slate-100 flex justify-end gap-2.5 shrink-0">
              <button
                onClick={() => setDiagnosisModalStudent(null)}
                className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Close Diagnostic
              </button>
              <button
                onClick={() => {
                  const s = diagnosisModalStudent;
                  setDiagnosisModalStudent(null);
                  openInterventionModal(s);
                }}
                className="px-5 py-2.5 bg-[#6D4C9C] text-white rounded-xl text-xs font-bold hover:bg-[#5B21B6] transition shadow-md cursor-pointer"
              >
                Assign Intervention
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: Create / Trigger Intervention Action Modal (Rendered at top layer using Portal) */}
      {interventionModalStudent && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-[fadeIn_0.15s_ease-out]"
          onClick={(e) => { if (e.target === e.currentTarget) setInterventionModalStudent(null); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-200/90 my-auto animate-[modalFadeIn_0.2s_ease]">
            {/* Header */}
            <div className="shrink-0 bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 p-5 sm:p-6 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
                  <i className="fas fa-hand-holding-heart"></i>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Intervention Action
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    {interventionModalStudent.student?.name} ({interventionModalStudent.studentId})
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setInterventionModalStudent(null)}
                title="Close Action Modal"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <i className="fas fa-times text-base"></i>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveIntervention} className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto style-scrollbar">
              
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intervention Category *</label>
                <select
                  value={interventionForm.category}
                  onChange={e => setInterventionForm({ ...interventionForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#6D4C9C]"
                >
                  <option value="PARENT_COMMUNICATION">📱 Parent Communication (WhatsApp Alert)</option>
                  <option value="REMEDIAL_COACHING">🎓 Academic Remedial Coaching & Practice Lab</option>
                  <option value="FEE_RESTRUCTURING">💳 Fee Restructuring (Emergency Installment Plan)</option>
                  <option value="ATTENDANCE_WARNING">⚠️ Formal Attendance Undertaking (Debarment Gate)</option>
                  <option value="STUDENT_COUNSELING">🤝 Department Faculty Mentorship Meeting</option>
                </select>
              </div>

              {/* Delivery Channel & Urgency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Channel</label>
                  <select
                    value={interventionForm.channel}
                    onChange={e => setInterventionForm({ ...interventionForm, channel: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#6D4C9C]"
                  >
                    <option value="WHATSAPP">WhatsApp Official Broadcast</option>
                    <option value="PHONE_CALL">Phone Call Consultation</option>
                    <option value="IN_PERSON_MEETING">In-Person Principal/HOD Meeting</option>
                    <option value="OFFICIAL_LETTER">Statutory Registered Letter</option>
                    <option value="SYSTEM_NOTIFICATION">Student Portal Urgent Popup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Tier</label>
                  <select
                    value={interventionForm.urgency}
                    onChange={e => setInterventionForm({ ...interventionForm, urgency: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#6D4C9C]"
                  >
                    <option value="CRITICAL">🔴 Critical (Immediate 24h Action)</option>
                    <option value="HIGH">🟠 High Priority (3-Day SLA)</option>
                    <option value="MODERATE">🟡 Moderate (Routine Follow-up)</option>
                  </select>
                </div>
              </div>

              {/* Action Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Intervention Title *</label>
                <input
                  type="text"
                  required
                  value={interventionForm.title}
                  onChange={e => setInterventionForm({ ...interventionForm, title: e.target.value })}
                  placeholder="e.g. Urgent Attendance Debarment Notice"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#6D4C9C]"
                />
              </div>

              {/* Assigned Staff */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Responsible Faculty / Staff *</label>
                <input
                  type="text"
                  required
                  value={interventionForm.assignedTo}
                  onChange={e => setInterventionForm({ ...interventionForm, assignedTo: e.target.value })}
                  placeholder="e.g. Prof. S. K. Verma (HOD CSE)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#6D4C9C]"
                />
              </div>

              {/* Notes / Action Details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Notes & Action Plan</label>
                <textarea
                  rows="3"
                  value={interventionForm.notes}
                  onChange={e => setInterventionForm({ ...interventionForm, notes: e.target.value })}
                  placeholder="Add specific instructions for counselor or message body..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6D4C9C]"
                ></textarea>
              </div>

              {/* WhatsApp Message Preview if WhatsApp channel */}
              {interventionForm.channel === 'WHATSAPP' && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1.5">
                    <i className="fab fa-whatsapp text-emerald-600 text-sm"></i> Official WhatsApp Advisory Template:
                  </div>
                  <p className="text-[11px] text-emerald-950 font-mono bg-white p-3 rounded-xl border border-emerald-100/90 leading-relaxed">
                    "Dear Guardian, this is an official statutory advisory from Shyvora ERP Institutional Outcome Engine. Student <strong>{interventionModalStudent.student?.name}</strong> is currently flagged at <strong>{interventionModalStudent.student?.attendance}% attendance</strong>, which is below the mandatory 75% UGC examination eligibility threshold. Please consult the department HOD immediately to avoid semester debarment."
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setInterventionModalStudent(null)}
                  className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIntervention}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:from-emerald-700 hover:to-teal-700 shadow-md transition cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {submittingIntervention ? 'Saving...' : 'Dispatch Intervention'}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default EarlyWarningEngine;
