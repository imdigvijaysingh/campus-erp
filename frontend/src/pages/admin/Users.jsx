import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';

const Users = () => {
  const { showToast, showLoading, hideLoading, showConfirm } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const adminRole = localStorage.getItem('adminRole') || 'SuperAdmin';

  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'SuperAdmin'
  });
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      showToast('Failed to fetch admin users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setEditingId(user._id);
      setFormData({
        username: user.username,
        password: '', // blank by default for edit
        role: user.role || 'admin'
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        username: '',
        password: '',
        role: 'SuperAdmin'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing && !formData.password) {
      return showToast('Password is required for new users', 'error');
    }

    showLoading(isEditing ? 'Updating user...' : 'Creating user...');
    try {
      const payload = { ...formData };
      if (isEditing && !payload.password) {
        delete payload.password; // Don't send empty password if editing
      }

      if (isEditing) {
        await api.put(`/users/${editingId}`, payload);
        showToast('User updated successfully');
      } else {
        await api.post('/users', payload);
        showToast('User created successfully');
      }
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      showToast(error.response?.data?.error || 'Operation failed', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleDelete = (id) => {
    showConfirm('Are you sure you want to delete this admin user? This action cannot be undone.', async () => {
      showLoading('Deleting user...');
      try {
        await api.delete(`/users/${id}`);
        showToast('User deleted successfully');
        fetchUsers();
      } catch (error) {
        showToast(error.response?.data?.error || 'Failed to delete user', 'error');
      } finally {
        hideLoading();
      }
    });
  };

  return (
    <div className="animate-[modalFadeIn_0.3s_ease]">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Users Management</h1>
          <p className="text-gray-500 text-sm">Manage CMS administrators and their credentials.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#6D4C9C] text-white px-5 py-2.5 rounded-lg hover:bg-[#5B21B6] transition-colors font-medium flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow"
        >
          <i className="fas fa-user-plus"></i> Add Admin
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            <i className="fas fa-circle-notch fa-spin text-2xl mb-2"></i>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-purple-50 text-[#6D4C9C] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fas fa-users"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Users Found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600 text-sm">Username</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Role</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm w-[150px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-[#6D4C9C] flex justify-center items-center font-bold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                        {user.role || 'Admin'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="w-8 h-8 rounded-lg bg-purple-50 text-[#6D4C9C] flex items-center justify-center hover:bg-purple-100 transition-colors"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        {user.role !== 'SuperAdmin' && (
                          <button 
                            onClick={() => handleDelete(user._id)}
                            className="w-8 h-8 rounded-lg bg-purple-50 text-red-600 flex items-center justify-center hover:bg-purple-100 transition-colors"
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[modalFadeIn_0.3s_ease]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-[modalSlideUp_0.3s_ease]">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Edit Admin User' : 'Add New Admin'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 sm:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D4C9C] focus:border-[#6D4C9C] outline-none"
                    placeholder="e.g. admin_johndoe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D4C9C] focus:border-[#6D4C9C] outline-none bg-white"
                    required
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Librarian">Librarian</option>
                    <option value="FeeCashier">Fee Cashier</option>
                    <option value="StoreIncharge">Store Incharge</option>
                    <option value="HostelWarden">Hostel Warden</option>
                    <option value="TransportManager">Transport Manager</option>
                    <option value="SuperAdmin">Super Admin</option>
                  </select>
                </div>
                {adminRole === 'SuperAdmin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {isEditing ? <span className="text-xs text-gray-400 font-normal">(Leave blank to keep current)</span> : '*'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6D4C9C] focus:border-[#6D4C9C] outline-none pr-10"
                        placeholder={isEditing ? 'Enter new password' : 'Enter a strong password'}
                        required={!isEditing}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#6D4C9C]">
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-white bg-[#6D4C9C] hover:bg-[#5B21B6] rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-save"></i>
                  {isEditing ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
