import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';
import Button from '../../components/common/Button';

const TransportManager = () => {
  const { showToast, showLoading, hideLoading, showConfirm } = useOutletContext();
  const [activeTab, setActiveTab] = useState('routes');

  // Data states
  const [routes, setRoutes] = useState([]);
  const [transportAllocations, setTransportAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [transportStaff, setTransportStaff] = useState([]);

  // Form states
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [routeForm, setRouteForm] = useState({ routeName: '', vehicleNumber: '', driverName: '', driverPhone: '', feePerSemester: 0 });

  const [showTransportAllocForm, setShowTransportAllocForm] = useState(false);
  const [transportAllocForm, setTransportAllocForm] = useState({ student: '', route: '', pickupPoint: '' });

  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeForm, setFeeForm] = useState({ allocationId: '', amount: 0, currentSubmitted: 0, totalFee: 0 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchStudents = async () => {
    if (students.length === 0) {
      try {
        const res = await api.get('/students');
        setStudents(res.data.data);
      } catch (error) {
        showToast('Failed to fetch students', 'error');
      }
    }
  };

  const fetchData = async () => {
    try {
      showLoading();
      if (activeTab === 'routes') {
        const res = await api.get('/facility/transport/routes');
        setRoutes(res.data.data);
      } else if (activeTab === 'transport-alloc') {
        await fetchStudents();
        const res = await api.get('/facility/transport/allocations');
        setTransportAllocations(res.data.data);
        if (routes.length === 0) {
          const rRes = await api.get('/facility/transport/routes');
          setRoutes(rRes.data.data);
        }
      } else if (activeTab === 'transport-staff') {
        const res = await api.get('/staff');
        const staff = res.data.data.filter(s => s.department === 'Transport');
        setTransportStaff(staff);
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to fetch data', 'error');
    } finally {
      hideLoading();
    }
  };

  // --- ROUTE HANDLERS ---
  const handleSaveRoute = async (e) => {
    e.preventDefault();
    try {
      showLoading('Saving...');
      if (routeForm._id) {
        await api.put(`/facility/transport/routes/${routeForm._id}`, routeForm);
      } else {
        await api.post('/facility/transport/routes', routeForm);
      }
      showToast('Route saved successfully');
      setShowRouteForm(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to save route', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleDeleteRoute = (id) => {
    showConfirm('Delete this route? This also deletes its allocations.', async () => {
      try {
        showLoading('Deleting...');
        await api.delete(`/facility/transport/routes/${id}`);
        showToast('Deleted successfully');
        fetchData();
      } catch (error) {
        showToast('Failed to delete', 'error');
      } finally {
        hideLoading();
      }
    });
  };

  const handleAllocateTransport = async (e) => {
    e.preventDefault();
    try {
      showLoading('Allocating...');
      await api.post('/facility/transport/allocations', transportAllocForm);
      showToast('Allocated successfully');
      setShowTransportAllocForm(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to allocate', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleCancelTransport = async (id) => {
    try {
      showLoading('Updating...');
      await api.put(`/facility/transport/allocations/${id}`);
      showToast('Allocation cancelled');
      fetchData();
    } catch (error) {
      showToast('Failed to update', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      showLoading('Submitting Fee...');
      await api.put(`/facility/transport/allocations/${feeForm.allocationId}/fee`, { amount: feeForm.amount });
      showToast('Fee submitted successfully');
      setShowFeeModal(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to submit fee', 'error');
    } finally {
      hideLoading();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transport Management</h1>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6 flex-wrap">
        {[
          { id: 'routes', label: 'Transport Routes' },
          { id: 'transport-alloc', label: 'Student Allocations & Fees' },
          { id: 'transport-staff', label: 'Transport Staff' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`pb-2 px-4 font-semibold ${activeTab === tab.id ? 'border-b-2 border-[#6D4C9C] text-[#6D4C9C]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TRANSPORT ROUTES TAB */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Transport Routes</h2>
            <Button onClick={() => { 
              setRouteForm({ routeName: '', vehicleNumber: '', driverName: '', driverPhone: '', feePerSemester: 0 });
              setShowRouteForm(true); 
            }}>Add Route</Button>
          </div>

          {showRouteForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4">{routeForm._id ? 'Edit' : 'Add'} Route</h3>
              <form onSubmit={handleSaveRoute} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Route Name (e.g., Route 1 - City Center)</label><input required type="text" className="w-full border rounded p-2" value={routeForm.routeName} onChange={e => setRouteForm({...routeForm, routeName: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Vehicle Number</label><input required type="text" className="w-full border rounded p-2" value={routeForm.vehicleNumber} onChange={e => setRouteForm({...routeForm, vehicleNumber: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Driver Name</label><input required type="text" className="w-full border rounded p-2" value={routeForm.driverName} onChange={e => setRouteForm({...routeForm, driverName: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Driver Phone</label><input required type="text" className="w-full border rounded p-2" value={routeForm.driverPhone} onChange={e => setRouteForm({...routeForm, driverPhone: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Fee Per Semester (₹)</label><input required type="number" min="0" className="w-full border rounded p-2" value={routeForm.feePerSemester} onChange={e => setRouteForm({...routeForm, feePerSemester: Number(e.target.value)})} /></div>

                <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowRouteForm(false)}>Cancel</Button>
                  <Button type="submit">Save Route</Button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map(route => (
              <div key={route._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{route.routeName}</h3>
                    <span className="text-sm font-medium text-gray-500"><i className="fas fa-bus mr-1"></i> {route.vehicleNumber}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setRouteForm({...route}); setShowRouteForm(true); }} className="text-gray-400 hover:text-[#8B5CF6]"><i className="fas fa-edit"></i></button>
                    <button onClick={() => handleDeleteRoute(route._id)} className="text-gray-400 hover:text-[#6D4C9C]"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Driver</div>
                    <div className="text-sm font-medium text-gray-700">{route.driverName}</div>
                    <div className="text-xs text-gray-500">{route.driverPhone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fee/Sem</div>
                    <div className="font-semibold text-gray-700">₹{route.feePerSemester}</div>
                  </div>
                </div>
              </div>
            ))}
            {routes.length === 0 && <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg border border-dashed">No transport routes found.</div>}
          </div>
        </div>
      )}

      {/* TRANSPORT ALLOCATIONS TAB */}
      {activeTab === 'transport-alloc' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Transport Allocations</h2>
            <Button onClick={() => setShowTransportAllocForm(true)}>Allocate Transport</Button>
          </div>

          {showTransportAllocForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Allocate Transport Route</h3>
              <form onSubmit={handleAllocateTransport} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Student</label>
                  <select required className="w-full border rounded p-2" value={transportAllocForm.student} onChange={e => setTransportAllocForm({...transportAllocForm, student: e.target.value})}>
                    <option value="">-- Select --</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.enrollmentNo})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select Route</label>
                  <select required className="w-full border rounded p-2" value={transportAllocForm.route} onChange={e => setTransportAllocForm({...transportAllocForm, route: e.target.value})}>
                    <option value="">-- Select --</option>
                    {routes.map(r => <option key={r._id} value={r._id}>{r.routeName}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Pickup Point</label>
                  <input required type="text" className="w-full border rounded p-2" value={transportAllocForm.pickupPoint} onChange={e => setTransportAllocForm({...transportAllocForm, pickupPoint: e.target.value})} />
                </div>
                
                <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowTransportAllocForm(false)}>Cancel</Button>
                  <Button type="submit">Allocate</Button>
                </div>
              </form>
            </div>
          )}

          {showFeeModal && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Submit Transport Fee</h3>
              <form onSubmit={handleFeeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount to Submit (₹)</label>
                  <input required type="number" min="1" max={feeForm.totalFee - feeForm.currentSubmitted} className="w-full border rounded p-2" value={feeForm.amount} onChange={e => setFeeForm({...feeForm, amount: Number(e.target.value)})} />
                  <p className="text-xs text-gray-500 mt-1">Remaining: ₹{feeForm.totalFee - feeForm.currentSubmitted}</p>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowFeeModal(false)}>Cancel</Button>
                  <Button type="submit">Submit Fee</Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700">Student</th>
                  <th className="p-4 font-semibold text-gray-700">Course</th>
                  <th className="p-4 font-semibold text-gray-700">Route</th>
                  <th className="p-4 font-semibold text-gray-700">Fee (Sem)</th>
                  <th className="p-4 font-semibold text-gray-700">Submitted</th>
                  <th className="p-4 font-semibold text-gray-700">Remaining</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                  <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transportAllocations.map(alloc => (
                  <tr key={alloc._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{alloc.student?.firstName} {alloc.student?.lastName} <br/><span className="text-xs text-gray-500">{alloc.student?.enrollmentNo}</span></td>
                    <td className="p-4 text-sm">{alloc.student?.course}</td>
                    <td className="p-4 font-bold">{alloc.route?.routeName}</td>
                    <td className="p-4 font-bold text-gray-800">₹{alloc.route?.feePerSemester || 0}</td>
                    <td className="p-4 text-green-600 font-bold">₹{alloc.feeSubmitted || 0}</td>
                    <td className="p-4 text-[#6D4C9C] font-bold">₹{(alloc.route?.feePerSemester || 0) - (alloc.feeSubmitted || 0)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${alloc.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {alloc.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      {alloc.status === 'Active' && (
                        <>
                          <button onClick={() => { setFeeForm({ allocationId: alloc._id, amount: 0, currentSubmitted: alloc.feeSubmitted || 0, totalFee: alloc.route?.feePerSemester || 0 }); setShowFeeModal(true); }} className="px-2 py-1 bg-[#8B5CF6] text-white rounded text-xs hover:bg-[#6D4C9C]">Add Fee</button>
                          <button onClick={() => handleCancelTransport(alloc._id)} className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-red-600">Cancel</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {transportAllocations.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No allocations found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TRANSPORT STAFF TAB */}
      {activeTab === 'transport-staff' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Transport Staff</h2>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700">Staff Name</th>
                  <th className="p-4 font-semibold text-gray-700">Designation</th>
                  <th className="p-4 font-semibold text-gray-700">Phone</th>
                  <th className="p-4 font-semibold text-gray-700">Basic Salary</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transportStaff.map(staff => (
                  <tr key={staff._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{staff.firstName} {staff.lastName} <br/><span className="text-xs text-gray-500">{staff.employeeId}</span></td>
                    <td className="p-4"><span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-blue-800">{staff.designation}</span></td>
                    <td className="p-4 text-sm">{staff.phone}</td>
                    <td className="p-4 font-bold text-gray-800">₹{staff.salary?.basic || 0}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${staff.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-red-800'}`}>
                        {staff.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {transportStaff.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No transport staff found. Please add them from the global Staff Management.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransportManager;
