import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Toast from '../../components/common/Toast';
import shyvoraLogo from '../../assets/images/shyvora_s_logo.png';

const PublicPrivacyPortal = () => {
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [requestForm, setRequestForm] = useState({
    type: 'ACCESS',
    requester: {
      name: '',
      email: '',
      phone: '',
      role: 'Student',
      isMinor: false,
      guardianName: '',
      guardianEmail: ''
    },
    details: ''
  });

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentHost = typeof window !== 'undefined' ? window.location.host : '';
  const livePortalUrl = `${currentOrigin}/privacy`;

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(livePortalUrl);
      setCopied(true);
      showToast('Live Privacy Portal URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await api.post('/privacy/requests', requestForm);
      if (res.data.success) {
        setSubmittedRequest(res.data.data);
        showToast('DPDP Data Subject Request registered successfully!');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit privacy request. Please verify details and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const inventoryItems = [
    { category: 'Student Identity', classification: 'Restricted PII', elements: 'Name, DOB, Parent Name, Gender, Photo', purpose: 'Institutional Admission & Academic Verification', retention: 'Academic Lifecycle + 7 Yrs', color: 'red' },
    { category: 'National Identifiers (APAAR / ABC)', classification: 'Encrypted Token', elements: 'APAAR ID, DigiLocker Hash, ABC Credit Bank', purpose: 'Academic Credit Transfer & NCrF Mobility', retention: 'Permanent Transcript Linkage', color: 'purple' },
    { category: 'Attendance & Classroom Records', classification: 'Internal Academic', elements: 'Daily punch-in, Roll Call, Absent/Late status', purpose: 'Course Completion & Minimum Exam Attendance', retention: 'Graduation + 3 Yrs', color: 'blue' },
    { category: 'Staff & HR Payroll Data', classification: 'Restricted PII', elements: 'Salary, Bank Account, PF Number, PAN/Tax Details', purpose: 'Payroll Disbursement & Statutory Tax Filing', retention: 'Statutory 8 Years', color: 'red' },
    { category: 'Vehicle & Bus GPS Tracking', classification: 'Safety Exemption', elements: 'Real-time vehicle coordinates during transit', purpose: 'Child Safety & Physical Transit Monitoring Only', retention: 'Transient (Purged in 90 Days)', color: 'amber' },
    { category: 'System Forensic Audit Logs', classification: 'Forensic Log', elements: 'IP Address, User-Agent, Event, Change Diffs', purpose: 'CERT-In Direction 70B & Cybersecurity Law', retention: '180 Days Mandatory', color: 'gray' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans antialiased">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top Public Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/authentication/index" className="w-10 h-10 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center shadow-2xs hover:scale-105 transition-transform shrink-0">
              <img src={shyvoraLogo} alt="Shyvora ERP Logo" className="w-full h-full object-contain" />
            </Link>
            <div>
              <span className="text-sm font-black text-gray-900 tracking-tight block leading-tight">Shyvora ERP</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Privacy & Data Protection Center</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/safety"
              className="text-xs font-semibold text-gray-600 hover:text-[#6D4C9C] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors hidden sm:inline-block"
            >
              Safety & Anti-Ragging
            </Link>
            <Link
              to="/authentication/index"
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#6D4C9C] hover:bg-[#5b3e85] rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <i className="fas fa-arrow-left text-[10px]"></i>
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Dynamic Live Server URL Adapter Banner */}
        <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50/50 p-4 sm:p-5 rounded-2xl border border-purple-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6D4C9C] text-white flex items-center justify-center text-sm flex-shrink-0 shadow-2xs">
              <i className="fas fa-scale-balanced"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-900">Live Public DPDP Portal URL</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
                  Adapts to Live Server
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5 break-all">
                {livePortalUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 text-xs font-bold text-[#6D4C9C] bg-white hover:bg-purple-50 border border-purple-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <i className={`fas ${copied ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
              <span>{copied ? 'Copied!' : 'Copy Live Link'}</span>
            </button>
            <span className="text-[10px] text-gray-400 font-mono bg-white/80 px-2 py-1 rounded-lg border border-gray-100">
              Host: {currentHost}
            </span>
          </div>
        </div>

        {/* Banner Title */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100/80 shadow-2xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-[#6D4C9C] px-2.5 py-0.5 rounded-md">
                  DPDP Act 2023 & Rules 2025
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md">
                  Rule 4 Compliant (Nov 2026 Ready)
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-md">
                  Minor Child Protections Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Data Principal Rights & Privacy Center
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                As a student, parent, guardian, or faculty member, your personal data is protected by the Digital Personal Data Protection Act. Exercise your rights to access, correction, and erasure with statutory 30-day SLA tracking.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 self-start md:self-auto flex-shrink-0">
              <a
                href="#sar-form"
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#6D4C9C] hover:bg-[#5b3e85] rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-file-shield text-xs"></i>
                <span>Submit Data Subject Request</span>
              </a>
              <a
                href="#data-inventory"
                className="px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-database text-xs text-gray-500"></i>
                <span>Data Classification</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3 DPDP Core Rights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D4C9C] flex items-center justify-center text-lg mb-3">
              <i className="fas fa-envelope-open-text"></i>
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">Right to Access & Summary</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Obtain a comprehensive summary of personal data being processed, including identity tokens, attendance records, and shared third parties.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg mb-3">
              <i className="fas fa-pen-to-square"></i>
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">Right to Correction & Erasure</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Request correction of inaccurate personal records or erasure of data that is no longer necessary for institutional legal obligations.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg mb-3">
              <i className="fas fa-child-reaching"></i>
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">Minor Child Protections</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Verifiable parental consent required for all students under 18. Zero behavioral tracking, profiling, or targeted algorithmic advertising.
            </p>
          </div>
        </div>

        {/* SAR Submission Form */}
        <section id="sar-form" className="bg-white rounded-2xl border border-gray-100/80 shadow-2xs p-6 sm:p-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#6D4C9C]"></span>
              <span className="text-xs font-bold text-[#6D4C9C] uppercase tracking-wider">Statutory Rights Request</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Submit a Data Subject Request (SAR)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Requests are logged immutably under audit oversight and processed within the statutory 30-day timeline.
            </p>
          </div>

          {submittedRequest ? (
            <div className="mt-6 p-6 rounded-2xl bg-purple-50 border border-purple-100 text-center max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#6D4C9C] text-white flex items-center justify-center text-xl mx-auto mb-3 shadow-2xs">
                <i className="fas fa-check"></i>
              </div>
              <h3 className="text-lg font-black text-gray-900">Request Registered Successfully</h3>
              <p className="text-xs text-gray-600 mt-1">
                Your DPDP Subject Access Request has been forwarded to the Institutional Data Protection Officer.
              </p>
              <div className="mt-4 p-3 bg-white rounded-xl border border-purple-200">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">SAR Tracking ID</span>
                <span className="font-mono text-base font-black text-[#6D4C9C]">{submittedRequest._id}</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-3">
                Statutory response timeframe: within 30 days of submission.
              </p>
              <button
                onClick={() => setSubmittedRequest(null)}
                className="mt-4 px-4 py-2 text-xs font-bold text-[#6D4C9C] hover:text-[#5b3e85] bg-purple-100 rounded-xl transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest} className="mt-6 space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Request Type *</label>
                  <select
                    value={requestForm.type}
                    onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    required
                  >
                    <option value="ACCESS">Data Access (Copy of My Processed Personal Data)</option>
                    <option value="CORRECTION">Correction of Inaccurate Personal Records</option>
                    <option value="ERASURE">Data Erasure / Account Deletion Request</option>
                    <option value="GRIEVANCE">Grievance Redressal with Data Protection Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Role *</label>
                  <select
                    value={requestForm.requester.role}
                    onChange={(e) => setRequestForm({
                      ...requestForm,
                      requester: { ...requestForm.requester, role: e.target.value }
                    })}
                    className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    required
                  >
                    <option value="Student">Current Student</option>
                    <option value="Parent">Parent / Legal Guardian of Minor</option>
                    <option value="Faculty">Faculty Member</option>
                    <option value="Staff">Non-Teaching Staff</option>
                    <option value="Alumni">Alumni / Former Student</option>
                  </select>
                </div>
              </div>

              {/* Requester Identity Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Nair"
                    value={requestForm.requester.name}
                    onChange={(e) => setRequestForm({
                      ...requestForm,
                      requester: { ...requestForm.requester, name: e.target.value }
                    })}
                    className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Registered Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priya@example.com"
                    value={requestForm.requester.email}
                    onChange={(e) => setRequestForm({
                      ...requestForm,
                      requester: { ...requestForm.requester, email: e.target.value }
                    })}
                    className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={requestForm.requester.phone || ''}
                    onChange={(e) => setRequestForm({
                      ...requestForm,
                      requester: { ...requestForm.requester, phone: e.target.value }
                    })}
                    className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Minor Checkbox */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="minorCheck"
                  checked={requestForm.requester.isMinor}
                  onChange={(e) => setRequestForm({
                    ...requestForm,
                    requester: { ...requestForm.requester, isMinor: e.target.checked }
                  })}
                  className="rounded text-[#6D4C9C] focus:ring-[#6D4C9C] w-4 h-4"
                />
                <label htmlFor="minorCheck" className="text-xs font-semibold text-gray-800 cursor-pointer">
                  Data Principal is a Minor (&lt; 18 years of age) - Verifiable Parental Consent Applies
                </label>
              </div>

              {requestForm.requester.isMinor && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 animate-[fadeIn_0.15s_ease]">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">Parent / Legal Guardian Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Nair"
                      value={requestForm.requester.guardianName || ''}
                      onChange={(e) => setRequestForm({
                        ...requestForm,
                        requester: { ...requestForm.requester, guardianName: e.target.value }
                      })}
                      className="w-full text-xs font-medium border border-amber-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">Parent / Guardian Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. anand.nair@example.com"
                      value={requestForm.requester.guardianEmail || ''}
                      onChange={(e) => setRequestForm({
                        ...requestForm,
                        requester: { ...requestForm.requester, guardianEmail: e.target.value }
                      })}
                      className="w-full text-xs font-medium border border-amber-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Request Details & Justification *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Specify the exact personal data elements, student roll number, or correction details..."
                  value={requestForm.details}
                  onChange={(e) => setRequestForm({ ...requestForm, details: e.target.value })}
                  className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-gray-400">
                  <i className="fas fa-clock text-[10px] mr-1"></i> 30-day statutory response SLA
                </span>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#6D4C9C] hover:bg-[#5b3e85] active:scale-[0.99] rounded-xl shadow-2xs transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <i className="fas fa-circle-notch fa-spin text-xs"></i>
                  ) : (
                    <i className="fas fa-shield text-xs"></i>
                  )}
                  <span>Submit DPDP Request</span>
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Data Classification & Transparency Register */}
        <section id="data-inventory" className="bg-white rounded-2xl border border-gray-100/80 shadow-2xs p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span className="text-xs font-bold text-[#6D4C9C] uppercase tracking-wider">Statutory Register</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Statutory Personal Data Classification & Retention Register
              </h2>
            </div>
            <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
              DPDP Act (2023) Section 4 & 8
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Data Category</th>
                  <th className="p-3.5">Classification</th>
                  <th className="p-3.5">Specific Elements</th>
                  <th className="p-3.5">Lawful Purpose</th>
                  <th className="p-3.5">Retention Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {inventoryItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900">{item.category}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.color === 'red' ? 'bg-red-50 text-red-700' :
                        item.color === 'purple' ? 'bg-purple-50 text-purple-700' :
                        item.color === 'blue' ? 'bg-blue-50 text-blue-700' :
                        item.color === 'amber' ? 'bg-amber-50 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.classification}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-500 max-w-xs">{item.elements}</td>
                    <td className="p-3.5 text-gray-600">{item.purpose}</td>
                    <td className="p-3.5 font-mono text-[11px] text-gray-500 whitespace-nowrap">{item.retention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* Public Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <span>Digital Personal Data Protection Act, 2023 & DPDP Rules, 2025</span>
          </div>
          <div>
            Powered by <strong className="text-gray-700">Shyvora Campus OS</strong> • Domain: <span className="font-mono text-purple-700">{currentHost}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPrivacyPortal;
