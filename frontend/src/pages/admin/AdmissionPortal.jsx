import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';

const AdmissionPortal = () => {
  const { showToast, showLoading, hideLoading, showConfirm } = useOutletContext();
  
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    password: '',
    email: '',
    phone: '',
    fatherName: '',
    dob: '',
    department: '',
    course: '',
    branch: '',
    session: '',
    semester: '',
    section: '',
    totalFee: ''
  });

  const [hierarchyData, setHierarchyData] = useState([]);
  
  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    try {
      showLoading('Loading Courses...');
      const res = await api.get('/courses-hierarchy');
      setHierarchyData(res.data);
    } catch (e) {
      showToast('Failed to load courses hierarchy', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({
      name: '', studentId: '', password: '', email: '', phone: '',
      fatherName: '', dob: '', department: '', course: '', branch: '',
      session: '', semester: '', section: '', totalFee: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showConfirm('Are you sure you want to admit this student?', async () => {
      try {
        showLoading('Processing Admission...');
        
        const payload = {
          name: formData.name,
          studentId: formData.studentId,
          password: formData.password,
          email: formData.email,
          phone: formData.phone,
          fatherName: formData.fatherName,
          dob: formData.dob,
          currentClass: {
            department: formData.department,
            course: formData.course,
            branch: formData.branch,
            session: formData.session,
            semester: formData.semester,
            section: formData.section,
          },
          feeDetails: {
            totalAmount: Number(formData.totalFee) || 0,
            paidAmount: 0
          }
        };

        await api.post('/students', payload);
        showToast('Student admitted successfully!', 'success');
        handleReset();
      } catch (err) {
        showToast(err.response?.data?.message || err.response?.data?.error || 'Failed to admit student', 'error');
      } finally {
        hideLoading();
      }
    }, { confirmText: 'Admit Student', confirmType: 'success' });
  };

  const getOptions = (level, parentKey, parentValue) => {
    if (!hierarchyData.length) return [];
    if (level === 'department') return [...new Set(hierarchyData.map(h => h.department))];
    if (level === 'course') return [...new Set(hierarchyData.filter(h => h.department === formData.department).map(h => h.course))];
    if (level === 'branch') return [...new Set(hierarchyData.filter(h => h.course === formData.course).map(h => h.branch))];
    if (level === 'session') return [...new Set(hierarchyData.filter(h => h.branch === formData.branch).map(h => h.session))];
    if (level === 'semester') {
      const h = hierarchyData.find(h => h.branch === formData.branch && h.session === formData.session);
      return h ? h.semesters : [];
    }
    if (level === 'section') {
      const h = hierarchyData.find(h => h.branch === formData.branch && h.session === formData.session);
      return h ? h.sections : [];
    }
    return [];
  };

  return (
    <div className="space-y-6 animate-[modalFadeIn_0.3s_ease]">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <i className="fas fa-user-plus text-[#6D4C9C] mr-3"></i> Admission Portal
        </h2>
        <p className="text-gray-500 mt-2">Create new student profiles and allocate courses and fee structures.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Section: Personal Info */}
          <div>
            <h3 className="text-lg font-bold border-b pb-2 mb-4 text-[#6D4C9C]">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (Roll No) <span className="text-red-500">*</span></label>
                <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password <span className="text-red-500">*</span></label>
                <input type="text" name="password" value={formData.password} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]" />
              </div>
            </div>
          </div>

          {/* Section: Academic Info */}
          <div>
            <h3 className="text-lg font-bold border-b pb-2 mb-4 text-[#6D4C9C]">Course & Branch Allocation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
                <select name="department" value={formData.department} onChange={handleChange} required className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]">
                  <option value="">Select...</option>
                  {getOptions('department').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course <span className="text-red-500">*</span></label>
                <select name="course" value={formData.course} onChange={handleChange} required disabled={!formData.department} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]">
                  <option value="">Select...</option>
                  {getOptions('course').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch <span className="text-red-500">*</span></label>
                <select name="branch" value={formData.branch} onChange={handleChange} required disabled={!formData.course} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]">
                  <option value="">Select...</option>
                  {getOptions('branch').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session <span className="text-red-500">*</span></label>
                <select name="session" value={formData.session} onChange={handleChange} required disabled={!formData.branch} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]">
                  <option value="">Select...</option>
                  {getOptions('session').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester <span className="text-red-500">*</span></label>
                <select name="semester" value={formData.semester} onChange={handleChange} required disabled={!formData.session} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]">
                  <option value="">Select...</option>
                  {getOptions('semester').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section <span className="text-red-500">*</span></label>
                <select name="section" value={formData.section} onChange={handleChange} required disabled={!formData.session} className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]">
                  <option value="">Select...</option>
                  {getOptions('section').map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Fee Config */}
          <div>
            <h3 className="text-lg font-bold border-b pb-2 mb-4 text-[#6D4C9C]">Fee Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Course Fee (₹) <span className="text-red-500">*</span></label>
                <input type="number" name="totalFee" value={formData.totalFee} onChange={handleChange} required min="0" className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6D4C9C]" placeholder="e.g. 50000" />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button type="button" onClick={handleReset} className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-50">Clear Form</button>
            <button type="submit" className="px-6 py-2 bg-[#6D4C9C] text-white font-bold rounded shadow hover:bg-[#5B21B6] transition">Admit Student</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdmissionPortal;
