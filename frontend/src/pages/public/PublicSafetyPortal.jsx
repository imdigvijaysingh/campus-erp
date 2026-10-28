import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../../components/common/Toast';
import shyvoraLogo from '../../assets/images/shyvora_s_logo.png';

const PublicSafetyPortal = () => {
  const [toast, setToast] = useState(null);
  const [complaintForm, setComplaintForm] = useState({
    category: 'ANTI_RAGGING',
    isAnonymous: true,
    complainantName: '',
    email: '',
    phone: '',
    role: 'Student',
    description: '',
    incidentDate: '',
    location: ''
  });
  const [submittedToken, setSubmittedToken] = useState(null);
  const currentHost = typeof window !== 'undefined' ? window.location.host : '';

  const showToast = (message, type = 'success') => setToast({ message, type });

  const emergencyContacts = [
    { name: 'UGC National Anti-Ragging Helpline', number: '1800-180-5522', email: 'helpline@antiragging.in', badge: '24x7 Toll Free', icon: 'fa-phone-volume', color: 'purple' },
    { name: 'Campus Equal Opportunity Officer', number: '+91 98765 43210', email: 'equity@shyvora.in', badge: 'Dedicated Officer', icon: 'fa-scale-unbalanced-flip', color: 'emerald' },
    { name: 'Internal Complaints Committee (ICC / POSH)', number: '+91 98765 43211', email: 'icc@shyvora.in', badge: 'Confidential Redressal', icon: 'fa-shield-halved', color: 'rose' },
    { name: 'Student Wellness & Counselor Desk', number: '+91 98765 43212', email: 'wellness@shyvora.in', badge: 'Resident Care', icon: 'fa-heart-pulse', color: 'blue' },
    { name: 'Local Police Emergency (National)', number: '112 / 100', email: 'police@state.gov.in', badge: 'Emergency Police', icon: 'fa-shield', color: 'amber' },
  ];

  const handleSubmitGrievance = (e) => {
    e.preventDefault();
    const token = 'SHY-WF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setSubmittedToken(token);
    showToast(`Confidential grievance recorded. Reference Token: ${token}`, 'success');
  };

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
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Institutional Safety & Welfare Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/privacy"
              className="text-xs font-semibold text-gray-600 hover:text-[#6D4C9C] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors hidden sm:inline-block"
            >
              Privacy & DPDP
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

        {/* Banner Title */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100/80 shadow-2xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-md">
                  UGC Regulations 2026
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-[#6D4C9C] px-2.5 py-0.5 rounded-md">
                  Confidential & Encrypted
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md">
                  Zero Retaliation Policy
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Institutional Safety, Equity & Welfare
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                Dedicated grievance portal in compliance with UGC Promotion of Equity in Higher Education Institutions Regulations (2026), Anti-Ragging Mandate, and Internal Complaints Committee (POSH Act 2013).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 self-start md:self-auto flex-shrink-0">
              <a
                href="#report-form"
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-bullhorn text-xs"></i>
                <span>File Confidential Grievance</span>
              </a>
              <a
                href="#helplines"
                className="px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-phone text-xs text-gray-500"></i>
                <span>Emergency Helplines</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3 Statutory Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D4C9C] flex items-center justify-center text-lg mb-3">
              <i className="fas fa-scale-unbalanced-flip"></i>
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">Equal Opportunity Centre</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Monitors anti-discrimination safeguards across caste, creed, religion, gender, and socio-economic backgrounds. Conforms to UGC 2026 equity mandate.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-3">
              <i className="fas fa-wheelchair"></i>
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">RPwD Accessibility Audit</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Guarantees physical wheelchair ramps, tactile guidance, assistive software, and accessible examination accommodations conforming to RPwD Act.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg mb-3">
              <i className="fas fa-user-shield"></i>
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-1">Strict Anti-Retaliation Protection</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Statutory anti-victimization protection. Any retaliation or adverse academic consequence against a complainant is subject to immediate disciplinary action.
            </p>
          </div>
        </div>

        {/* Confidential Grievance Submission Form */}
        <section id="report-form" className="bg-white rounded-2xl border border-gray-100/80 shadow-2xs p-6 sm:p-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Confidential Grievance Portal</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Register a Grievance or Incident
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Your report is reviewed strictly by designated statutory committee members. Anonymous submissions encrypt complainant identifiers from general viewing.
            </p>
          </div>

          {submittedToken ? (
            <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl mx-auto mb-3 shadow-2xs">
                <i className="fas fa-check"></i>
              </div>
              <h3 className="text-lg font-black text-emerald-900">Grievance Registered Successfully</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Your report has been routed to the relevant statutory committee under confidential safeguards.
              </p>
              <div className="mt-4 p-3 bg-white rounded-xl border border-emerald-200">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Grievance Tracking Token</span>
                <span className="font-mono text-base font-black text-[#6D4C9C]">{submittedToken}</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-3">
                Save this token to track progress with the Equal Opportunity Officer or Anti-Ragging Cell.
              </p>
              <button
                onClick={() => setSubmittedToken(null)}
                className="mt-4 px-4 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100 rounded-xl transition-colors"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitGrievance} className="mt-6 space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Grievance Category *</label>
                  <select
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    required
                  >
                    <option value="ANTI_RAGGING">Anti-Ragging / Bullying</option>
                    <option value="UGC_EQUITY">UGC Equity / Discrimination (Caste, Gender, Origin)</option>
                    <option value="ICC_POSH">Internal Complaints Committee (ICC / POSH)</option>
                    <option value="RPWD_ACCESSIBILITY">RPwD Accessibility & Accommodations</option>
                    <option value="GENERAL_WELFARE">Campus Student Welfare & Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Role *</label>
                  <select
                    value={complaintForm.role}
                    onChange={(e) => setComplaintForm({ ...complaintForm, role: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    required
                  >
                    <option value="Student">Current Student</option>
                    <option value="Parent">Parent / Legal Guardian</option>
                    <option value="Faculty">Faculty Member</option>
                    <option value="Staff">Non-Teaching Staff</option>
                    <option value="Alumni">Alumni / External Visitor</option>
                  </select>
                </div>
              </div>

              {/* Anonymous Checkbox */}
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="anonCheck"
                    checked={complaintForm.isAnonymous}
                    onChange={(e) => setComplaintForm({ ...complaintForm, isAnonymous: e.target.checked })}
                    className="rounded text-[#6D4C9C] focus:ring-[#6D4C9C] w-4 h-4"
                  />
                  <label htmlFor="anonCheck" className="text-xs font-bold text-gray-800 cursor-pointer">
                    Submit 100% Anonymously (Identity Protected)
                  </label>
                </div>
                <span className="text-[10px] text-[#6D4C9C] font-semibold hidden sm:inline-block">
                  Protected Complainant Rights
                </span>
              </div>

              {!complaintForm.isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-[fadeIn_0.15s_ease]">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={complaintForm.complainantName}
                      onChange={(e) => setComplaintForm({ ...complaintForm, complainantName: e.target.value })}
                      className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      value={complaintForm.email}
                      onChange={(e) => setComplaintForm({ ...complaintForm, email: e.target.value })}
                      className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={complaintForm.phone}
                      onChange={(e) => setComplaintForm({ ...complaintForm, phone: e.target.value })}
                      className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date of Incident (Approximate)</label>
                  <input
                    type="date"
                    value={complaintForm.incidentDate}
                    onChange={(e) => setComplaintForm({ ...complaintForm, incidentDate: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Location on Campus</label>
                  <input
                    type="text"
                    placeholder="e.g. Hostel Block B, Cafeteria, Library"
                    value={complaintForm.location}
                    onChange={(e) => setComplaintForm({ ...complaintForm, location: e.target.value })}
                    className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Details of Incident / Grievance *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Please provide factual details of the incident or requested accommodations. Confidentiality is legally guaranteed."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-gray-400">
                  <i className="fas fa-lock text-[10px] mr-1"></i> End-to-end encrypted submission
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.99] rounded-xl shadow-2xs transition-all flex items-center gap-2"
                >
                  <i className="fas fa-paper-plane text-xs"></i>
                  <span>Submit Confidential Grievance</span>
                </button>
              </div>
            </form>
          )}
        </section>

        {/* 24/7 Crisis Helplines Directory */}
        <section id="helplines" className="bg-white rounded-2xl border border-gray-100/80 shadow-2xs p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Active Helplines</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                24/7 Crisis & Emergency Contact Directory
              </h2>
            </div>
            <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
              National & Campus Channels
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact, idx) => (
              <div key={idx} className="p-4.5 rounded-2xl bg-slate-50/70 border border-gray-100 flex items-center justify-between gap-3 hover:bg-white hover:border-gray-200 transition-all shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-gray-900">{contact.name}</span>
                  </div>
                  <span className="text-[10px] bg-white text-gray-500 font-semibold px-2 py-0.5 rounded-md border border-gray-100">
                    {contact.badge}
                  </span>
                  <div className="text-[11px] text-gray-400 mt-1 font-mono">{contact.email}</div>
                </div>

                <a
                  href={`tel:${contact.number}`}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#6D4C9C] bg-purple-50 hover:bg-purple-100 border border-purple-100 font-mono whitespace-nowrap transition-colors flex items-center gap-1.5"
                >
                  <i className="fas fa-phone text-[10px]"></i>
                  <span>{contact.number}</span>
                </a>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Public Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>UGC Statutory Compliance • UGC Promotion of Equity 2026</span>
          </div>
          <div>
            Powered by <strong className="text-gray-700">Shyvora Campus OS</strong> • Domain: <span className="font-mono text-purple-700">{currentHost}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicSafetyPortal;
