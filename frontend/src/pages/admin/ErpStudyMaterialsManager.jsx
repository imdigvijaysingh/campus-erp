import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import DragDropUpload from '../../components/common/DragDropUpload';

const ErpStudyMaterialsManager = () => {
  const { showToast, showLoading, hideLoading, showConfirm } = useOutletContext();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf', // 'pdf', 'youtube', 'video'
    url: '',
    file: null,
    targetClass: ''
  });
  const [classesList, setClassesList] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchMaterials();
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

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('cms_token');
      const { data } = await axios.get('/api/v1/study-materials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaterials(data);
    } catch (error) {
      console.error('Failed to fetch study materials');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || (!formData.url && !formData.file) || !formData.targetClass) {
      showToast('Title, URL/File, and Target Class are required', 'error');
      return;
    }

    try {
      showLoading('Uploading Study Material...');
      const token = localStorage.getItem('cms_token');
      
      let finalUrl = formData.url;
      
      if (formData.type !== 'youtube' && formData.file) {
        // 1. Upload File
        const uploadData = new FormData();
        uploadData.append('media', formData.file);
        const uploadRes = await axios.post('/api/v1/media/upload', uploadData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!uploadRes.data.success || uploadRes.data.data.length === 0) {
          throw new Error('File upload failed');
        }
        
        finalUrl = uploadRes.data.data[0].url;
      }

      await axios.post('/api/v1/study-materials', {
        ...formData,
        url: finalUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Study material uploaded successfully');
      setFormData({ title: '', description: '', type: 'pdf', url: '', file: null, targetClass: '' });
      fetchMaterials();
    } catch (error) {
      showToast('Failed to upload material', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleDelete = (id) => {
    showConfirm('Are you sure you want to delete this study material?', async () => {
      try {
        showLoading('Deleting...');
        const token = localStorage.getItem('cms_token');
        await axios.delete(`/api/v1/study-materials/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('Study material deleted successfully');
        fetchMaterials();
      } catch (error) {
        showToast('Failed to delete study material', 'error');
      } finally {
        hideLoading();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6"><i className="fas fa-book-open text-green-500 mr-2"></i> Upload Study Material</h2>
        
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. OS Lecture 4 Notes" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white">
                <option value="pdf">PDF Document</option>
                <option value="youtube">YouTube Video</option>
                <option value="video">Direct Video Link</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Short description..."></textarea>
          </div>

          {formData.type === 'pdf' || formData.type === 'video' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
              <DragDropUpload 
                accept={formData.type === 'pdf' ? "application/pdf" : "video/mp4,video/webm"}
                label={`Drag & drop ${formData.type.toUpperCase()} here`}
                onFileSelect={(file) => setFormData({ ...formData, file })}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video Link</label>
              <input type="url" name="url" value={formData.url} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="https://youtube.com/watch?v=..." required />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Class</label>
            <select
              name="targetClass"
              value={formData.targetClass}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
            >
              <option value="">Select a class...</option>
              {classesList.map(c => (
                <option key={c._id} value={`${c.courseName} - ${c.semester}`}>
                  {c.courseName} - {c.semester}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition">
            <i className="fas fa-cloud-upload-alt mr-2"></i> Publish Material
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Manage Study Materials</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600 text-sm">Title</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Type</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Target Class</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materials.map(m => (
                <tr key={m._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-900 font-medium">
                    {m.title}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      m.type === 'pdf' ? 'bg-purple-100 text-[#5B21B6]' :
                      m.type === 'youtube' ? 'bg-purple-100 text-[#5B21B6]' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {m.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{m.targetClass}</td>
                  <td className="p-4 text-gray-500 text-sm">{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-[#8B5CF6] hover:text-[#5B21B6] mr-4" title="View/Download">
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                    <button onClick={() => handleDelete(m._id)} className="text-[#6D4C9C] hover:text-[#5B21B6]" title="Delete">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No study materials found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ErpStudyMaterialsManager;
