import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';

const HelpDeskManager = () => {
  const { showToast, showLoading, hideLoading } = useOutletContext();
  const [tickets, setTickets] = useState([]);
  
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState('');

  const fetchTickets = async () => {
    try {
      showLoading('Loading tickets...');
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (error) {
      showToast('Failed to load tickets', 'error');
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenReply = (ticket) => {
    setActiveTicket(ticket);
    setReplyText(ticket.reply || '');
    setStatus(ticket.status || 'Open');
    setReplyModalOpen(true);
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    showLoading('Updating ticket...');
    try {
      await api.put(`/tickets/${activeTicket._id}`, { reply: replyText, status: status });
      showToast('Ticket updated successfully!');
      setReplyModalOpen(false);
      fetchTickets();
    } catch (error) {
      showToast('Failed to update ticket', 'error');
    } finally {
      hideLoading();
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-purple-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'text-[#6D4C9C] bg-purple-100 border-purple-200';
      case 'In Progress': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'Closed': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="animate-[modalFadeIn_0.3s_ease]">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Help Desk</h1>
          <p className="text-gray-500 text-sm">Manage and respond to student support tickets.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold">Student ID</th>
                <th className="p-4 font-semibold">Subject & Category</th>
                <th className="p-4 font-semibold">Priority</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No tickets found.</td>
                </tr>
              ) : (
                tickets.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{t.studentId}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900 mb-1">{t.subject}</div>
                      <div className="text-xs text-gray-500">{t.category}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(t.priority)}`}>{t.priority}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded border text-xs font-bold ${getStatusColor(t.status)}`}>{t.status}</span>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleOpenReply(t)}
                        className="text-[#6D4C9C] hover:text-blue-800 font-medium px-3 py-1 bg-purple-50 hover:bg-purple-100 rounded transition"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      {replyModalOpen && activeTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-[modalFadeIn_0.3s_ease]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Ticket Review</h3>
              <button onClick={() => setReplyModalOpen(false)} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times text-xl"></i></button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900">{activeTicket.subject}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(activeTicket.priority)}`}>{activeTicket.priority}</span>
                </div>
                <div className="text-sm text-gray-500 mb-4">From: {activeTicket.studentId} | {activeTicket.category}</div>
                <p className="text-gray-700 text-sm bg-white p-3 border rounded">{activeTicket.description}</p>
              </div>

              <form onSubmit={handleUpdateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] outline-none text-sm"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reply to Student</label>
                  <textarea 
                    value={replyText} 
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Enter your response here..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] outline-none min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setReplyModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white rounded-lg transition font-medium">Update Ticket</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDeskManager;
