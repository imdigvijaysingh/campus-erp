import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useOutletContext } from 'react-router-dom';
import CascadingDropdown from './components/CascadingDropdown';

const ErpNotificationsManager = () => {
  const { showToast, showLoading, hideLoading, showConfirm } = useOutletContext();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'all', // 'all', 'class', 'student'
    targetId: ''
  });
  const [classesList, setClassesList] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      showToast('Title and message are required', 'error');
      return;
    }

    if (formData.targetType !== 'all' && !formData.targetId) {
      showToast(`Please specify the target ${formData.targetType}`, 'error');
      return;
    }

    try {
      showLoading('Sending Notification...');
      await api.post('/notifications', formData);
      showToast('Notification sent successfully');
      setFormData({ title: '', message: '', targetType: 'all', targetId: '' });
      fetchNotifications();
    } catch (error) {
      showToast('Failed to send notification', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleDelete = (id) => {
    showConfirm('Are you sure you want to delete this notification?', async () => {
      try {
        showLoading('Deleting...');
        await api.delete(`/notifications/${id}`);
        showToast('Notification deleted successfully');
        fetchNotifications();
      } catch (error) {
        showToast('Failed to delete notification', 'error');
      } finally {
        hideLoading();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6"><i className="fas fa-bell text-yellow-500 mr-2"></i> Send ERP Notification</h2>
        
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notification Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="e.g. Tomorrow is a Holiday" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
            <textarea name="message" value={formData.message} onChange={handleChange} rows="4" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="Enter the full announcement..." required></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Send To (Target)</label>
              <select name="targetType" value={formData.targetType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none bg-white">
                <option value="all">All Students</option>
                <option value="class">Specific Class</option>
                <option value="student">Specific Student (Roll No)</option>
              </select>
            </div>
            
            {formData.targetType === 'class' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Target Class</label>
                <CascadingDropdown 
                  onSelectionComplete={(hierarchy) => {
                    setFormData({
                      ...formData, 
                      targetId: `${hierarchy.course} - ${hierarchy.branch} - ${hierarchy.semester} - ${hierarchy.section}`
                    });
                  }} 
                />
              </div>
            )}
            
            {formData.targetType === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Roll Number</label>
                <input type="text" name="targetId" value={formData.targetId} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none" placeholder="e.g. Shyvora2026001" />
              </div>
            )}
          </div>

          <button type="submit" className="px-6 py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition">
            <i className="fas fa-paper-plane mr-2"></i> Send Notification
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Manage Notifications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600 text-sm">Title / Message</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Target</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notifications.map(n => (
                <tr key={n._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-900">
                    <div className="font-bold text-sm">{n.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{n.message}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-[10px] font-bold rounded bg-gray-100 text-gray-700 uppercase">
                      {n.targetType}
                    </span>
                    {n.targetId && <div className="text-xs text-gray-500 mt-1">{n.targetId}</div>}
                  </td>
                  <td className="p-4 text-gray-500 text-sm">{new Date(n.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(n._id)} className="text-[#6D4C9C] hover:text-[#5B21B6]" title="Delete">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No notifications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ErpNotificationsManager;
