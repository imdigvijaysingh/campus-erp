import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Toast from '../../components/common/Toast';

const DeviceSessionsManager = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/auth/sessions');
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      showToast('Error loading active device sessions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId) => {
    try {
      const res = await api.post(`/auth/sessions/revoke/${sessionId}`);
      if (res.data.success) {
        showToast('Device session successfully revoked');
        fetchSessions();
      }
    } catch (err) {
      showToast('Error revoking device session', 'error');
    }
  };

  const handleRevokeAllOthers = async () => {
    if (!window.confirm('Are you sure you want to sign out from all other devices?')) return;
    try {
      const res = await api.post('/auth/sessions/revoke-all');
      if (res.data.success) {
        showToast('All other active device sessions terminated');
        fetchSessions();
      }
    } catch (err) {
      showToast('Error revoking sessions', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-[modalFadeIn_0.2s_ease]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#6D4C9C] tracking-wider uppercase bg-purple-50 px-2.5 py-0.5 rounded-md">
              Zero-Trust Session Registry
            </span>
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-2.5 py-0.5 rounded-md">
              {sessions.length} Active {sessions.length === 1 ? 'Device' : 'Devices'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Active Login Sessions</h1>
          <p className="text-xs text-gray-500 mt-1">
            Review all web browsers, tablets, and phones currently authenticated to your account. Terminate suspicious sessions instantly.
          </p>
        </div>

        <button
          onClick={handleRevokeAllOthers}
          className="px-4 py-2.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto border border-red-100"
        >
          <i className="fas fa-arrow-right-from-bracket text-xs"></i>
          Sign Out All Other Devices
        </button>
      </div>

      {/* Sessions Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          <i className="fas fa-spinner fa-spin text-2xl mb-2 text-[#6D4C9C]"></i>
          <p className="text-xs">Loading active login sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          No active sessions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <div
              key={session._id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                session.isCurrent 
                  ? 'bg-purple-50/40 border-[#6D4C9C]/30 shadow-sm' 
                  : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      session.isCurrent ? 'bg-[#6D4C9C] text-white shadow-sm' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <i className={`fas ${session.device === 'Mobile' ? 'fa-mobile-screen' : 'fa-laptop'}`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 leading-tight">
                        {session.browser}
                      </h4>
                      <span className="text-[11px] text-gray-500">{session.os}</span>
                    </div>
                  </div>

                  {session.isCurrent ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Current Device
                    </span>
                  ) : (
                    <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100/80">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">IP Address:</span>
                    <span className="font-mono text-gray-800">{session.ip}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Estimated Location:</span>
                    <span className="text-gray-800 font-medium">{session.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Last Active:</span>
                    <span className="text-gray-800 font-medium">
                      {new Date(session.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (IST)
                    </span>
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <div className="pt-4 mt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleRevokeSession(session._id)}
                    className="w-full py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <i className="fas fa-ban text-[11px]"></i>
                    Revoke Device Session
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeviceSessionsManager;
