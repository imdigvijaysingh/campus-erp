import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Toast from '../../components/common/Toast';

const AuditLogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      let query = `/audit-logs?limit=50`;
      if (riskFilter) query += `&riskLevel=${riskFilter}`;
      if (actionFilter) query += `&action=${actionFilter}`;
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await api.get(query);
      if (res.data.success) {
        setLogs(res.data.data);
        setTotal(res.data.total);
      }
    } catch (error) {
      showToast('Error loading audit log records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [riskFilter, actionFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-6 animate-[modalFadeIn_0.2s_ease]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#6D4C9C] tracking-wider uppercase bg-purple-50 px-2.5 py-0.5 rounded-md">
              Immutable Forensics
            </span>
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase bg-gray-100 px-2 py-0.5 rounded-md">
              Total Records: {total}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Security & Compliance Audit Trail</h1>
          <p className="text-xs text-gray-500 mt-1">
            Tamper-evident system logs capturing every authentication, access grant, and data modification across institutions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2.5 text-xs font-bold text-white bg-[#6D4C9C] hover:bg-[#5b3e85] rounded-xl shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <i className="fas fa-rotate text-xs"></i>
          Refresh Logs
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search by username, details, resource..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <select
            className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">🔴 Critical Risk</option>
            <option value="HIGH">🟠 High Risk</option>
            <option value="MEDIUM">🟡 Medium Risk</option>
            <option value="LOW">🟢 Low Risk</option>
          </select>

          <select
            className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#6D4C9C] focus:outline-none"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="FAILED_LOGIN">FAILED_LOGIN</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="REVOKE">REVOKE</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP & Route</th>
                <th className="py-3 px-4 text-right">Timestamp (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    <i className="fas fa-spinner fa-spin mr-2"></i> Loading audit trails...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    No audit records found matching criteria
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        log.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        log.riskLevel === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                        log.riskLevel === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {log.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900 text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{log.actor?.username || 'System'}</div>
                      <div className="text-[10px] text-gray-400">{log.actor?.role}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-mono">
                        {log.resource}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-gray-800" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-gray-500">
                      <div>{log.metadata?.ip || '127.0.0.1'}</div>
                      <div className="text-gray-400 truncate max-w-[120px]">{log.metadata?.route}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsViewer;
