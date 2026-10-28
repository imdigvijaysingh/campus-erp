import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import DragDropUpload from '../../components/common/DragDropUpload';

const ErpAssignmentsManager = () => {
  const { showToast, showLoading, hideLoading, showConfirm } = useOutletContext();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pdfFile: null,
    targetClass: ''
  });
  const [classesList, setClassesList] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchAssignments();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('cms_token');
      const { data } = await axios.get('/api/v1/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClassesList(data.data.filter(c => c.isActive));
    } catch (error) {
      console.error('Failed to fetch classes');
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('cms_token');
      const { data } = await axios.get('/api/v1/assignments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.pdfFile || !formData.targetClass) {
      showToast('Title, Assignment File, and Target Class are required', 'error');
      return;
    }

    try {
      showLoading('Uploading Assignment...');
      const token = localStorage.getItem('cms_token');
      
      // 1. Upload File
      const uploadData = new FormData();
      uploadData.append('media', formData.pdfFile);
      const uploadRes = await axios.post('/api/v1/media/upload', uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!uploadRes.data.success || uploadRes.data.data.length === 0) {
        throw new Error('File upload failed');
      }
      
      const fileUrl = uploadRes.data.data[0].url;

      // 2. Save Assignment
      await axios.post('/api/v1/assignments', {
        title: formData.title,
        description: formData.description,
        targetClass: formData.targetClass,
        fileUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Assignment uploaded successfully');
      setFormData({ title: '', description: '', pdfFile: null, targetClass: '' });
      fetchAssignments();
    } catch (error) {
      showToast('Failed to upload assignment', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleDelete = (id) => {
    showConfirm('Are you sure you want to delete this assignment?', async () => {
      try {
        showLoading('Deleting...');
        const token = localStorage.getItem('cms_token');
        await axios.delete(`/api/v1/assignments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('Assignment deleted successfully');
        fetchAssignments();
      } catch (error) {
        showToast('Failed to delete assignment', 'error');
      } finally {
        hideLoading();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6"><i className="fas fa-tasks text-purple-500 mr-2"></i> Upload Assignment</h2>
        
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Data Structures Assignment 1" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Instructions..."></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment File (PDF)</label>
            <DragDropUpload 
              accept="application/pdf"
              label="Drag & drop assignment PDF here"
              onFileSelect={(file) => setFormData({ ...formData, pdfFile: file })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Class</label>
            <select
              name="targetClass"
              value={formData.targetClass}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
            >
              <option value="">Select a class...</option>
              {classesList.map(c => (
                <option key={c._id} value={`${c.courseName} - ${c.semester}`}>
                  {c.courseName} - {c.semester}
                </option>
              ))}
            </select>
            {(!classesList || classesList.length === 0) && (
              <p className="text-xs text-[#6D4C9C] mt-1">No active classes found. Please add them in the Classes Manager.</p>
            )}
          </div>

          <button type="submit" className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition">
            <i className="fas fa-upload mr-2"></i> Upload Assignment
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Manage Assignments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600 text-sm">Title</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Target Class</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignments.map(a => (
                <tr key={a._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-900 font-medium">
                    {a.title}
                    <div className="text-xs text-gray-500 line-clamp-1">{a.description}</div>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{a.targetClass}</td>
                  <td className="p-4 text-gray-500 text-sm">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[#8B5CF6] hover:text-[#5B21B6] mr-4" title="View/Download">
                      <i className="fas fa-eye"></i>
                    </a>
                    <button onClick={() => handleDelete(a._id)} className="text-[#6D4C9C] hover:text-[#5B21B6]" title="Delete">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No assignments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ErpAssignmentsManager;
