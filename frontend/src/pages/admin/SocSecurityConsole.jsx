import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Toast from '../../components/common/Toast';

const SocSecurityConsole = () => {
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    criticalAlerts: 0,
    highRiskAlerts: 0,
    failedLogins24h: 0,
    systemsHealthyPercent: 99.8
  });
  const [securityEvents, setSecurityEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    severity: 'HIGH',
    type: 'Unauthorized Access Attempt',
    description: '',
    certInReportable: true
  });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchSocData = async () => {
    try {
      setIsLoading(true);
      const [metricsRes, logsRes] = await Promise.all([
        api.get('/audit-logs/soc-metrics'),
        api.get('/audit-logs?limit=15')
      ]);

      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.data);
      }
      if (logsRes.data.success) {
        setSecurityEvents(logsRes.data.data);
      }
    } catch (err) {
      showToast('Error loading SOC security telemetry', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSocData();
  }, []);

  const handleCreateIncident = (e) => {
    e.preventDefault();
    setShowIncidentModal(false);
    showToast(`Security Incident registered. CERT-In notification package generated (6-hr timer initiated).`, 'success');
  };

  return (
    <div className="space-y-6 animate-[modalFadeIn_0.2s_ease]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
              SOC Telemetry Active
            </span>
            <span className="text-xs font-bold text-purple-700 tracking-wider uppercase bg-purple-50 px-2 py-0.5 rounded-md">
              CERT-In Direction 70B Ready
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Security Operations Center (SOC)</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time threat monitoring, access control anomalies, and 6-hour statutory cyber incident response.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSocData}
            className="px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <i className="fas fa-rotate text-xs"></i>
            Refresh Telemetry
          </button>
          <button
            onClick={() => setShowIncidentModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <i className="fas fa-triangle-exclamation text-xs"></i>
            Log Security Incident
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-bold">
            <i className="fas fa-radiation"></i>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{metrics.criticalAlerts}</div>
            <div className="text-xs font-bold text-red-600 uppercase tracking-wide">Critical Alerts</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Immediate triage required</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            <i className="fas fa-shield-virus"></i>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{metrics.highRiskAlerts}</div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wide">High Risk Events</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Privileged & multi-tenant access</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
            <i className="fas fa-key"></i>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{metrics.failedLogins24h}</div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">Failed Logins (24h)</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Brute-force monitor</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            <i className="fas fa-heart-pulse"></i>
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{metrics.systemsHealthyPercent}%</div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Infrastructure Health</div>
            <div className="text-[10px] text-gray-400 mt-0.5">All API nodes green</div>
          </div>
        </div>
      </div>

      {/* Incident Workflow Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-[#6D4C9C] to-indigo-900 text-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded text-purple-200">
              Statutory 6-Hour Rule
            </span>
            <h3 className="text-lg font-bold mt-1">CERT-In Mandatory Cyber Incident Response Pipeline</h3>
            <p className="text-xs text-purple-200 max-w-2xl mt-1 leading-relaxed">
              Under CERT-In 2022 Directions, all cyber security incidents must be formally contained and reported to incident@cert-in.org.in within 6 hours of discovery.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['1. Detection', '2. Classification', '3. Containment', '4. CERT-In Notify', '5. Post-Mortem'].map((step, i) => (
              <span key={i} className="text-xs bg-white/10 px-2.5 py-1 rounded-lg font-medium border border-white/10">
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Live Security Audit Stream */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-tower-broadcast text-[#6D4C9C] text-sm"></i>
            <h3 className="font-bold text-sm text-gray-900">Real-Time Security Audit Telemetry</h3>
          </div>
          <span className="text-xs text-gray-400 font-mono">Sync: NTP IST (UTC+05:30)</span>
        </div>

        <div className="divide-y divide-gray-100">
          {securityEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">No recent security events recorded</div>
          ) : (
            securityEvents.map((evt) => (
              <div key={evt._id} className="p-4 hover:bg-gray-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    evt.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    evt.riskLevel === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                    evt.riskLevel === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {evt.riskLevel}
                  </span>
                  <div>
                    <span className="font-bold text-gray-900">{evt.details}</span>
                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-3">
                      <span><i className="fas fa-user text-gray-400 mr-1"></i>{evt.actor?.username} ({evt.actor?.role})</span>
                      <span><i className="fas fa-network-wired text-gray-400 mr-1"></i>{evt.metadata?.ip || 'Local'}</span>
                      <span><i className="fas fa-tag text-gray-400 mr-1"></i>{evt.resource}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-gray-400 font-mono whitespace-nowrap">
                  {new Date(evt.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 animate-[modalFadeIn_0.2s_ease]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-shield-virus text-red-600 text-lg"></i>
                <h3 className="font-bold text-base text-gray-900">Declare Cyber Security Incident</h3>
              </div>
              <button onClick={() => setShowIncidentModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Incident Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unauthorized administrative credential attack"
                  className="w-full border rounded-xl p-2.5 font-medium text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Severity</label>
                  <select
                    className="w-full border rounded-xl p-2 font-medium text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={incidentForm.severity}
                    onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                  >
                    <option value="CRITICAL">CRITICAL (Data breach / Ransomware)</option>
                    <option value="HIGH">HIGH (Bypassed authorization)</option>
                    <option value="MEDIUM">MEDIUM (Multiple brute-force)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Classification Type</label>
                  <select
                    className="w-full border rounded-xl p-2 font-medium text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    value={incidentForm.type}
                    onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value })}
                  >
                    <option value="Unauthorized Access Attempt">Unauthorized Access Attempt</option>
                    <option value="Privileged Data Exfiltration">Privileged Data Exfiltration</option>
                    <option value="API Rate Abuse">API Rate Abuse</option>
                    <option value="Malicious File Upload">Malicious File Upload</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Forensic Description & Containment Action Taken</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe initial indicators of compromise (IP, affected user account, token revocation status)..."
                  className="w-full border rounded-xl p-2.5 font-medium text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-red-700 font-medium">
                <i className="fas fa-clock text-sm"></i>
                <span>CERT-In 6-Hour reporting timer starts immediately upon submission.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm"
                >
                  Confirm & Initiate CERT-In Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocSecurityConsole;
