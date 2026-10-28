import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';

const RoleManager = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentRole, setCurrentRole] = useState({ name: '', description: '', permissions: {} });
  const { showToast, showLoading, hideLoading, showConfirm } = useOutletContext();

  const availableModules = [
    'dashboard', 'website-pages', 'website-courses', 'academics-content', 'testimonials',
    'affiliations', 'media', 'events', 'notices', 'students', 'courses', 'erp-assignments',
    'erp-study-materials', 'erp-notifications', 'teacher-portal', 'librarian-portal',
    'fee-portal', 'roles', 'users', 'staff', 'inventory', 'hostel', 'transport', 'helpdesk',
    'profile', 'help'
  ];

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data.data);
    } catch (error) {
      showToast('Error fetching roles', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handlePermissionChange = (module, action, value) => {
    setCurrentRole(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: value
        }
      }
    }));
  };

  const saveRole = async () => {
    showLoading();
    try {
      if (currentRole._id) {
        await api.put(`/roles/${currentRole._id}`, currentRole);
        showToast('Role updated successfully');
      } else {
        await api.post('/roles', currentRole);
        showToast('Role created successfully');
      }
      setShowModal(false);
      fetchRoles();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to save role', 'error');
    } finally {
      hideLoading();
    }
  };

  const deleteRole = (id) => {
    showConfirm('Are you sure you want to delete this role?', async () => {
      showLoading();
      try {
        await api.delete(`/roles/${id}`);
        showToast('Role deleted successfully');
        fetchRoles();
      } catch (error) {
        showToast(error.response?.data?.error || 'Failed to delete role', 'error');
      } finally {
        hideLoading();
      }
    });
  };

  const openModal = (role = null) => {
    if (role) {
      setCurrentRole(role);
    } else {
      setCurrentRole({ name: '', description: '', permissions: {} });
    }
    setShowModal(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Role & Permission Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow flex items-center"
        >
          <i className="fas fa-plus mr-2"></i> Create Role
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map(role => (
              <tr key={role._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(role)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => deleteRole(role._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[3000] flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 md:w-3/4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{currentRole._id ? 'Edit Role' : 'Create Role'}</h2>
            
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role Name</label>
                <input
                  type="text"
                  value={currentRole.name}
                  onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={currentRole.description}
                  onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-6">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableModules.map(module => (
                <div key={module} className="border p-4 rounded bg-gray-50">
                  <h4 className="font-semibold text-gray-700 capitalize mb-2">{module.replace(/-/g, ' ')}</h4>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentRole.permissions?.[module]?.read || false}
                        onChange={(e) => handlePermissionChange(module, 'read', e.target.checked)}
                        className="mr-2"
                      /> Read
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentRole.permissions?.[module]?.write || false}
                        onChange={(e) => handlePermissionChange(module, 'write', e.target.checked)}
                        className="mr-2"
                      /> Write
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentRole.permissions?.[module]?.delete || false}
                        onChange={(e) => handlePermissionChange(module, 'delete', e.target.checked)}
                        className="mr-2"
                      /> Delete
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveRole}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManager;
