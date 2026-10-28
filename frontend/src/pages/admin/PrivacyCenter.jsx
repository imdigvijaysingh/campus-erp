import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Toast from '../../components/common/Toast';

const PrivacyCenter = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Dynamic origin that adapts to whatever URL is in the browser URL box
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentHost = typeof window !== 'undefined' ? window.location.host : '';
  const publicPortalUrl = `${currentOrigin}/privacy`;

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleCopyPublicLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicPortalUrl);
      setCopiedLink(true);
      showToast('Public Privacy Portal URL copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const [requestForm, setRequestForm] = useState({
    type: 'ACCESS',
    requester: {
      name: '',
      email: '',
      role: 'Student',
      isMinor: false,
      guardianName: ''
    },
    details: ''
  });

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/privacy/requests');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      showToast('Error loading privacy data requests', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/privacy/requests', requestForm);
      if (res.data.success) {
        showToast('DPDP Data Subject Request registered successfully');
        setShowModal(false);
        fetchRequests();
      }
    } catch (err) {
      showToast('Failed to create privacy request', 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/privacy/requests/${id}`, { status });
      if (res.data.success) {
        showToast(`Request updated to ${status}`);
        fetchRequests();
      }
    } catch (err) {
      showToast('Error updating request status', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100/80 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Privacy & Data Protection
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            DPDP Act (2023) & Rules (2025) compliance, data inventory & subject rights (SAR).
          </p>
        </div>

        {activeTab === 'requests' && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-[#6D4C9C] hover:bg-[#5b3e85] rounded-xl shadow-2xs transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <i className="fas fa-plus text-xs"></i>
            <span>New Subject Request</span>
          </button>
        )}
      </div>

      {/* Dynamic Live Server URL Adapter Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50/40 p-4 sm:p-4.5 rounded-2xl border border-purple-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#6D4C9C] text-white flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
            <i className="fas fa-scale-balanced"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900">Public DPDP Portal URL</span>
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
            <i className="fas fa-database"></i>
          </div>
          <div>
            <div className="text-lg font-black text-gray-900">7 Categories</div>
            <div className="text-[11px] text-gray-400">Statutory Data Classifications</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-base flex-shrink-0">
            <i className="fas fa-child-reaching"></i>
          </div>
          <div>
            <div className="text-lg font-black text-gray-900">Child Safety Active</div>
            <div className="text-[11px] text-gray-400">&lt; 18 Minors Protected</div>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-gray-100/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base flex-shrink-0">
            <i className="fas fa-clock"></i>
          </div>
          <div>
            <div className="text-lg font-black text-gray-900">30-Day SLA</div>
            <div className="text-[11px] text-gray-400">Subject Rights Window (DPDP)</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation & Content Container */}
      <div className="bg-white rounded-2xl border border-gray-100/80 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex border-b border-gray-100 gap-6 text-xs font-bold overflow-x-auto">
          {[
            { id: 'inventory', label: 'Data Inventory & Retention', icon: 'fa-database' },
            { id: 'child-safety', label: 'Child Safety & Consent', icon: 'fa-child-reaching' },
            { id: 'requests', label: 'Data Access & Erasure (SAR)', icon: 'fa-envelope-open-text' },
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

        {/* Tab 1: Data Inventory */}
        {activeTab === 'inventory' && (
          <div className="overflow-x-auto animate-[fadeIn_0.15s_ease]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Data Category</th>
                  <th className="p-3.5">Classification</th>
                  <th className="p-3.5">Data Elements</th>
                  <th className="p-3.5">Lawful Purpose</th>
                  <th className="p-3.5">Retention Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                <tr className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900">Student Identity</td>
                  <td className="p-3.5"><span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">Restricted PII</span></td>
                  <td className="p-3.5 text-gray-500">Name, DOB, Parent Name, Gender, Photo</td>
                  <td className="p-3.5 text-gray-600">Admission & Verification</td>
                  <td className="p-3.5 font-mono text-[11px] text-gray-500">Academic Lifecycle + 7 Yrs</td>
                </tr>
                <tr className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900">National IDs (APAAR / ABC)</td>
                  <td className="p-3.5"><span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">Encrypted Token</span></td>
                  <td className="p-3.5 text-gray-500">APAAR ID, DigiLocker Hash, ABC Credits</td>
                  <td className="p-3.5 text-gray-600">Credit Mobility & NCrF</td>
                  <td className="p-3.5 font-mono text-[11px] text-gray-500">Permanent Transcript</td>
                </tr>
                <tr className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900">Attendance & Academic</td>
                  <td className="p-3.5"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">Internal Academic</span></td>
                  <td className="p-3.5 text-gray-500">Daily roll, Present/Absent/Late records</td>
                  <td className="p-3.5 text-gray-600">Course Completion Minimums</td>
                  <td className="p-3.5 font-mono text-[11px] text-gray-500">Graduation + 3 Yrs</td>
                </tr>
                <tr className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900">Staff & Payroll</td>
                  <td className="p-3.5"><span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">Restricted PII</span></td>
                  <td className="p-3.5 text-gray-500">Salary, Bank A/C, PF, PAN/Tax Details</td>
                  <td className="p-3.5 text-gray-600">Payroll Disbursement & Tax</td>
                  <td className="p-3.5 font-mono text-[11px] text-gray-500">Statutory 8 Years</td>
                </tr>
                <tr className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900">Bus GPS Tracking</td>
                  <td className="p-3.5"><span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">Safety Exemption</span></td>
                  <td className="p-3.5 text-gray-500">Real-time bus coordinates during transit</td>
                  <td className="p-3.5 text-gray-600">Child Safety in Transit</td>
                  <td className="p-3.5 font-mono text-[11px] text-gray-500">Transient (Purged in 90d)</td>
                </tr>
                <tr className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-gray-900">Audit Logs</td>
                  <td className="p-3.5"><span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">Forensic Log</span></td>
                  <td className="p-3.5 text-gray-500">IP, User-Agent, Event, Diff</td>
                  <td className="p-3.5 text-gray-600">CERT-In 2022 Compliance</td>
                  <td className="p-3.5 font-mono text-[11px] text-gray-500">180 Days Mandatory</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Child Safety */}
        {activeTab === 'child-safety' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-[fadeIn_0.15s_ease]">
            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6D4C9C] flex items-center justify-center text-sm mb-3">
                <i className="fas fa-signature"></i>
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">Verifiable Parental Consent</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Minors (&lt; 18) require parent or guardian verification before personal data processing begins.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-sm mb-3">
                <i className="fas fa-eye-slash"></i>
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">Zero Behavioral Profiling</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                No screen-time tracking, engagement ranking, or algorithmic commercial profiling is active.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-sm mb-3">
                <i className="fas fa-bus-simple"></i>
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">Narrow Safety Exemption</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Location tracking is strictly limited to school buses during daily student commute hours for physical safety.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Data Requests */}
        {activeTab === 'requests' && (
          <div className="overflow-x-auto animate-[fadeIn_0.15s_ease]">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Requester</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Due By</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-400">Loading requests...</td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-gray-400">No active data subject requests pending.</td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          req.type === 'DELETION' ? 'bg-red-100 text-red-800' :
                          req.type === 'ACCESS' ? 'bg-blue-100 text-blue-800' :
                          req.type === 'CORRECTION' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {req.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-gray-900">{req.requester?.name}</div>
                        <div className="text-[10px] text-gray-400">{req.requester?.email}</div>
                      </td>
                      <td className="p-3 text-gray-600 max-w-xs truncate">{req.details}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-gray-400">
                        {new Date(req.dueBy).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        {req.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(req._id, 'IN_REVIEW')}
                              className="px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req._id, 'COMPLETED')}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                            >
                              Resolve
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-[fadeIn_0.15s_ease]">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">Register Data Subject Request</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Request Type</label>
                <select
                  className="w-full border rounded-xl p-2.5 font-medium text-xs focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                  value={requestForm.type}
                  onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value })}
                >
                  <option value="ACCESS">Data Access Request (Export Data)</option>
                  <option value="CORRECTION">Data Correction (Update Records)</option>
                  <option value="DELETION">Right to be Forgotten (Account Deletion)</option>
                  <option value="CONSENT_WITHDRAWAL">Withdraw Optional Consents</option>
                  <option value="PORTABILITY">Data Portability (Export JSON)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    className="w-full border rounded-xl p-2.5 font-medium text-xs focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    value={requestForm.requester.name}
                    onChange={(e) => setRequestForm({
                      ...requestForm,
                      requester: { ...requestForm.requester, name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="user@school.edu"
                    className="w-full border rounded-xl p-2.5 font-medium text-xs focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    value={requestForm.requester.email}
                    onChange={(e) => setRequestForm({
                      ...requestForm,
                      requester: { ...requestForm.requester, email: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isMinorCheck"
                  checked={requestForm.requester.isMinor}
                  onChange={(e) => setRequestForm({
                    ...requestForm,
                    requester: { ...requestForm.requester, isMinor: e.target.checked }
                  })}
                  className="rounded text-[#6D4C9C] focus:ring-[#6D4C9C]"
                />
                <label htmlFor="isMinorCheck" className="font-semibold text-gray-700">
                  Requester is a Minor (&lt; 18)
                </label>
              </div>

              {requestForm.requester.isMinor && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Guardian / Parent Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Guardian full name"
                    className="w-full border rounded-xl p-2.5 font-medium text-xs focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                    value={requestForm.requester.guardianName}
                    onChange={(e) => setRequestForm({
                      ...requestForm,
                      requester: { ...requestForm.requester, guardianName: e.target.value }
                    })}
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">Details</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Specify particulars or corrections..."
                  className="w-full border rounded-xl p-2.5 font-medium text-xs focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
                  value={requestForm.details}
                  onChange={(e) => setRequestForm({ ...requestForm, details: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#6D4C9C] hover:bg-[#5b3e85] shadow-xs"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyCenter;
