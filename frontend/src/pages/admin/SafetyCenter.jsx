import React, { useState, useEffect } from 'react';
import Toast from '../../components/common/Toast';
import api from '../../utils/api';

const SafetyCenter = () => {
  const [activeTab, setActiveTab] = useState('equity');
  const [toast, setToast] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    category: 'ANTI_RAGGING',
    isAnonymous: true,
    complainantName: '',
    description: ''
  });

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Dynamic origin that adapts to whatever URL is in the browser URL box
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentHost = typeof window !== 'undefined' ? window.location.host : '';
  const publicPortalUrl = `${currentOrigin}/safety`;

  const fetchCases = async () => {
    try {
      setLoadingCases(true);
      const res = await api.get('/tickets');
      if (res.data?.data) {
        setCases(res.data.data);
      }
    } catch (e) {
      setCases([]);
    } finally {
      setLoadingCases(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCopyPublicLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicPortalUrl);
      setCopiedLink(true);
      showToast('Public Safety Portal URL copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const emergencyContacts = [
    { name: 'UGC National Anti-Ragging Helpline', number: '1800-180-5522', email: 'helpline@antiragging.in', badge: '24x7 Toll Free' },
    { name: 'Campus Equal Opportunity Officer', number: '+91 98765 43210', email: 'equity@shyvora.in', badge: 'Dedicated Officer' },
    { name: 'Internal Complaints Committee (ICC/POSH)', number: '+91 98765 43211', email: 'icc@shyvora.in', badge: 'Confidential' },
    { name: 'Student Wellness & Counselor', number: '+91 98765 43212', email: 'wellness@shyvora.in', badge: 'Resident Care' },
    { name: 'Local Police Emergency', number: '112 / 100', email: 'police@state.gov.in', badge: 'Police Response' },
  ];

  const handleRegisterComplaint = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets', {
        title: `${complaintForm.category.replace('_', ' ')} Report`,
        description: complaintForm.description || 'Confidential safety incident filed by student/faculty.',
        category: complaintForm.category,
        priority: 'HIGH',
        isAnonymous: complaintForm.isAnonymous
      });
      setShowComplaintModal(false);
      setComplaintForm({ category: 'ANTI_RAGGING', isAnonymous: true, complainantName: '', description: '' });
      showToast('Confidential grievance registered in database. Tracking ticket issued.', 'success');
      fetchCases();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to register report', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Clean, Spacious Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Institutional Safety & Welfare
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            UGC Promotion of Equity Regulations (2026), Anti-Ragging Cell & Confidential Redressal.
          </p>
        </div>

        <button
          onClick={() => setShowComplaintModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.99] rounded-xl shadow-2xs transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <i className="fas fa-bullhorn text-xs"></i>
          <span>File Confidential Report</span>
        </button>
      </div>

      {/* Dynamic Live Server URL Adapter Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50/40 p-4 sm:p-4.5 rounded-2xl border border-purple-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#6D4C9C] text-white flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
            <i className="fas fa-globe"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900">Public Grievance Portal URL</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Active on Current Host
              </span>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5 break-all">
              {publicPortalUrl}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
          <button
            onClick={handleCopyPublicLink}
            className="px-3 py-1.5 text-xs font-bold text-[#6D4C9C] bg-white hover:bg-purple-50 border border-purple-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
          >
            <i className={`fas ${copiedLink ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
            <span>{copiedLink ? 'Copied!' : 'Copy Public Link'}</span>
          </button>
          <a
            href={publicPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
          >
            <i className="fas fa-arrow-up-right-from-square text-[10px] text-gray-400"></i>
            <span>Open Portal</span>
          </a>
        </div>
      </div>

      {/* Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4.5 rounded-2xl border border-gray-100/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6D4C9C] flex items-center justify-center text-base flex-shrink-0">
            <i className="fas fa-scale-unbalanced-flip"></i>
          </div>
          <div>
            <div className="text-lg font-black text-gray-900">UGC Equity Active</div>
            <div className="text-[11px] text-gray-400">Equal Opportunity Centre Desk</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base flex-shrink-0">
            <i className="fas fa-shield-check"></i>
          </div>
          <div>
            <div className="text-lg font-black text-gray-900">Zero Tolerance</div>
            <div className="text-[11px] text-gray-400">Anti-Ragging Squad On Duty</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-base flex-shrink-0">
            <i className="fas fa-lock"></i>
          </div>
          <div>
            <div className="text-lg font-black text-gray-900">ICC / POSH Desk</div>
            <div className="text-[11px] text-gray-400">Encrypted Whistleblower Channel</div>
          </div>
        </div>
      </div>

      {/* Clean Minimal Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100/80 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex border-b border-gray-100 gap-6 text-xs font-bold overflow-x-auto">
          {[
            { id: 'equity', label: 'UGC Equity & RPwD', icon: 'fa-scale-unbalanced-flip' },
            { id: 'anti-ragging', label: 'Anti-Ragging Cell', icon: 'fa-hand-holding-hand' },
            { id: 'icc', label: 'ICC / POSH Panel', icon: 'fa-shield-cat' },
            { id: 'helpline', label: '24/7 Crisis Directory', icon: 'fa-phone-volume' },
            { id: 'cases', label: 'Case Register', icon: 'fa-list-check' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-[#6D4C9C] text-[#6D4C9C]' 
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Equity */}
        {activeTab === 'equity' && (
          <div className="space-y-6 animate-[fadeIn_0.15s_ease]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6D4C9C] flex items-center justify-center text-sm mb-3">
                  <i className="fas fa-door-open"></i>
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Equal Opportunity Centre</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Monitors equity compliance, non-discrimination on grounds of caste, gender, religion, or background.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm mb-3">
                  <i className="fas fa-wheelchair"></i>
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">RPwD Accessibility Audit</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Ensures reasonable accommodations, tactile paths, wheelchair ramps, and accessible online materials.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-sm mb-3">
                  <i className="fas fa-user-shield"></i>
                </div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Protected Complainant Rights</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Statutory anti-retaliation rules protect complainant identity and prevent academic victimization.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Anti-Ragging */}
        {activeTab === 'anti-ragging' && (
          <div className="space-y-4 animate-[fadeIn_0.15s_ease]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="font-bold text-gray-900 text-sm mb-1">Mandatory Student & Parent Affidavits</div>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed">
                  Annual digital undertakings registered with the national portal prior to admission & hostel allotment.
                </p>
                <span className="text-xs bg-purple-100 text-[#6D4C9C] font-bold px-2.5 py-1 rounded-lg">
                  98.4% Batch Verified
                </span>
              </div>

              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="font-bold text-gray-900 text-sm mb-1">Anti-Ragging Squad Inspections</div>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed">
                  Surprise inspections across hostels, common rooms, and campus grounds during initial semester weeks.
                </p>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg">
                  Active Roster Assigned
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: ICC / POSH */}
        {activeTab === 'icc' && (
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 leading-relaxed space-y-2 animate-[fadeIn_0.15s_ease]">
            <h4 className="font-bold text-sm text-gray-900">Internal Complaints Committee (POSH Act 2013)</h4>
            <p>
              Provides time-bound, completely confidential grievance redressal for women on campus. Chaired by a senior female faculty member with independent NGO representation.
            </p>
          </div>
        )}

        {/* Tab 4: Helpline */}
        {activeTab === 'helpline' && (
          <div className="divide-y divide-gray-100 text-xs animate-[fadeIn_0.15s_ease]">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{contact.name}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{contact.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-[11px] font-semibold">
                    {contact.badge}
                  </span>
                  <a
                    href={`tel:${contact.number}`}
                    className="font-mono font-bold text-[#6D4C9C] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    {contact.number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Cases Table */}
        {activeTab === 'cases' && (
          <div className="overflow-x-auto animate-[fadeIn_0.15s_ease]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Case ID</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Summary</th>
                  <th className="p-3">Committee</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400 font-normal">
                      No safety or grievance complaints registered in database.
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => (
                    <tr key={c._id || c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-gray-900">{c.ticketNumber || c._id?.slice(-8) || c.id}</td>
                      <td className="p-3">
                        <span className="bg-purple-50 text-[#6D4C9C] px-2 py-0.5 rounded text-[11px] font-bold">
                          {c.category || 'General'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-800 max-w-xs truncate">{c.title || c.headline}</td>
                      <td className="p-3 text-gray-500">{c.assignedTo || 'Safety Officer'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'RESOLVED' || c.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status || 'OPEN'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-gray-400">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : c.date || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clean Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-[fadeIn_0.15s_ease]">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">File Confidential Incident</h3>
              <button onClick={() => setShowComplaintModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleRegisterComplaint} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category</label>
                <select
                  className="w-full border rounded-xl p-2.5 font-medium text-xs focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                  value={complaintForm.category}
                  onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                >
                  <option value="ANTI_RAGGING">Anti-Ragging / Bullying</option>
                  <option value="UGC_EQUITY">UGC Equity / Discrimination</option>
                  <option value="ICC_POSH">Internal Complaints Committee (ICC)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={complaintForm.isAnonymous}
                  onChange={(e) => setComplaintForm({ ...complaintForm, isAnonymous: e.target.checked })}
                  className="rounded text-[#6D4C9C] focus:ring-[#6D4C9C]"
                />
                <label htmlFor="anonymousCheck" className="font-semibold text-gray-700">
                  Submit Anonymously (Identity Encrypted)
                </label>
              </div>

              {!complaintForm.isAnonymous && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    className="w-full border rounded-xl p-2.5 font-medium text-xs focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    value={complaintForm.complainantName}
                    onChange={(e) => setComplaintForm({ ...complaintForm, complainantName: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Details</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Provide incident details, dates, or location..."
                  className="w-full border rounded-xl p-2.5 font-medium text-xs focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#6D4C9C] hover:bg-[#5b3e85] shadow-xs"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyCenter;
