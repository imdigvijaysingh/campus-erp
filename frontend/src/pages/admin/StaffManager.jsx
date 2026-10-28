import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';
import Button from '../../components/common/Button';

const StaffManager = () => {
  const { showToast, showLoading, hideLoading, showConfirm } = useOutletContext();
  const [activeTab, setActiveTab] = useState('directory');
  const adminRole = localStorage.getItem('adminRole') || 'SuperAdmin';

  // Data states
  const [staff, setStaff] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [payrolls, setPayrolls] = useState([]);

  // Form states
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({
    employeeId: '', firstName: '', lastName: '', email: '', phone: '', department: '', designation: '', joiningDate: '', status: 'Active',
    salary: { basic: 0, allowances: 0, deductions: 0 },
    createLogin: false, username: '', password: '', roleName: ''
  });

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ staff: '', type: 'Casual', startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      showLoading();
      if (activeTab === 'directory') {
        const res = await api.get('/staff');
        setStaff(res.data.data);
      } else if (activeTab === 'leaves') {
        const res = await api.get('/staff/leaves');
        setLeaves(res.data.data);
        if (staff.length === 0) {
          const staffRes = await api.get('/staff');
          setStaff(staffRes.data.data);
        }
      } else if (activeTab === 'attendance') {
        if (staff.length === 0) {
          const staffRes = await api.get('/staff');
          setStaff(staffRes.data.data);
        }
        await fetchAttendance();
      } else if (activeTab === 'payroll') {
        await fetchPayroll();
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to fetch data', 'error');
    } finally {
      hideLoading();
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/staff/attendance?date=${attendanceDate}`);
      setAttendanceRecords(res.data.data);
    } catch (error) {
      showToast('Failed to fetch attendance', 'error');
    }
  };

  const fetchPayroll = async () => {
    try {
      const res = await api.get(`/staff/payroll?month=${payrollMonth}&year=${payrollYear}`);
      setPayrolls(res.data.data);
    } catch (error) {
      showToast('Failed to fetch payroll', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'attendance') fetchAttendance();
  }, [attendanceDate]);

  useEffect(() => {
    if (activeTab === 'payroll') fetchPayroll();
  }, [payrollMonth, payrollYear]);

  // --- STAFF DIRECTORY HANDLERS ---
  const handleSaveStaff = async (e) => {
    e.preventDefault();
    try {
      showLoading('Saving...');
      if (staffForm._id) {
        await api.put(`/staff/${staffForm._id}`, staffForm);
      } else {
        await api.post('/staff', staffForm);
      }
      showToast('Staff saved successfully');
      setShowStaffForm(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to save staff', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleDeleteStaff = (id) => {
    showConfirm('Delete this staff member? This also deletes their attendance and payroll records.', async () => {
      try {
        showLoading('Deleting...');
        await api.delete(`/staff/${id}`);
        showToast('Deleted successfully');
        fetchData();
      } catch (error) {
        showToast('Failed to delete', 'error');
      } finally {
        hideLoading();
      }
    });
  };

  // --- LEAVE HANDLERS ---
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      showLoading('Applying...');
      await api.post('/staff/leaves', leaveForm);
      showToast('Leave applied successfully');
      setShowLeaveForm(false);
      fetchData();
    } catch (error) {
      showToast('Failed to apply leave', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleUpdateLeave = async (id, status) => {
    try {
      showLoading('Updating...');
      await api.put(`/staff/leaves/${id}`, { status });
      showToast(`Leave ${status}`);
      fetchData();
    } catch (error) {
      showToast('Failed to update leave', 'error');
    } finally {
      hideLoading();
    }
  };

  // --- ATTENDANCE HANDLERS ---
  const handleMarkAttendance = async (staffId, status) => {
    try {
      const records = [{ staff: staffId, status }];
      await api.post('/staff/attendance', { date: attendanceDate, records });
      fetchAttendance();
    } catch (error) {
      showToast('Failed to mark attendance', 'error');
    }
  };

  const getAttendanceStatus = (staffId) => {
    const record = attendanceRecords.find(r => r.staff._id === staffId || r.staff === staffId);
    return record ? record.status : 'Not Marked';
  };

  // --- PAYROLL HANDLERS ---
  const handleGeneratePayroll = async () => {
    showConfirm(`Generate payroll for ${payrollMonth}/${payrollYear}?`, async () => {
      try {
        showLoading('Generating...');
        await api.post('/staff/payroll/generate', { month: payrollMonth, year: payrollYear });
        showToast('Payroll generated successfully');
        fetchPayroll();
      } catch (error) {
        showToast('Failed to generate payroll', 'error');
      } finally {
        hideLoading();
      }
    });
  };

  const handleUpdatePayrollStatus = async (id, status) => {
    try {
      showLoading('Updating...');
      await api.put(`/staff/payroll/${id}`, { status });
      showToast(`Payroll marked as ${status}`);
      fetchPayroll();
    } catch (error) {
      showToast('Failed to update payroll', 'error');
    } finally {
      hideLoading();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff / HR Management</h1>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {['directory', 'attendance', 'leaves', 'payroll'].map(tab => (
          <button
            key={tab}
            className={`pb-2 px-4 font-semibold capitalize ${activeTab === tab ? 'border-b-2 border-[#6D4C9C] text-[#6D4C9C]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* DIRECTORY TAB */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Staff Directory</h2>
            <Button onClick={() => { 
              setStaffForm({ employeeId: '', firstName: '', lastName: '', email: '', phone: '', department: '', designation: '', joiningDate: '', status: 'Active', salary: { basic: 0, allowances: 0, deductions: 0 }, createLogin: false, username: '', password: '', roleName: ''});
              setShowStaffForm(true); 
            }}>Add Staff</Button>
          </div>

          {showStaffForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4">{staffForm._id ? 'Edit' : 'Add'} Staff Member</h3>
              <form onSubmit={handleSaveStaff} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1">Employee ID</label><input required type="text" className="w-full border rounded p-2" value={staffForm.employeeId} onChange={e => setStaffForm({...staffForm, employeeId: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">First Name</label><input required type="text" className="w-full border rounded p-2" value={staffForm.firstName} onChange={e => setStaffForm({...staffForm, firstName: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Last Name</label><input required type="text" className="w-full border rounded p-2" value={staffForm.lastName} onChange={e => setStaffForm({...staffForm, lastName: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input required type="email" className="w-full border rounded p-2" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Phone</label><input required type="text" className="w-full border rounded p-2" value={staffForm.phone} onChange={e => setStaffForm({...staffForm, phone: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Department</label><input required type="text" className="w-full border rounded p-2" value={staffForm.department} onChange={e => setStaffForm({...staffForm, department: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Designation</label><input required type="text" className="w-full border rounded p-2" value={staffForm.designation} onChange={e => setStaffForm({...staffForm, designation: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Joining Date</label><input required type="date" className="w-full border rounded p-2" value={staffForm.joiningDate ? staffForm.joiningDate.split('T')[0] : ''} onChange={e => setStaffForm({...staffForm, joiningDate: e.target.value})} /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className="w-full border rounded p-2" value={staffForm.status} onChange={e => setStaffForm({...staffForm, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                
                {/* Salary Section */}
                <div className="md:col-span-3 mt-2 border-t pt-4"><h4 className="font-semibold mb-2"><i className="fas fa-money-bill text-green-600 mr-2"></i>Salary Config</h4></div>
                <div><label className="block text-sm font-medium mb-1">Basic Salary</label><input required type="number" className="w-full border rounded p-2" value={staffForm.salary.basic} onChange={e => setStaffForm({...staffForm, salary: {...staffForm.salary, basic: Number(e.target.value)}})} /></div>
                <div><label className="block text-sm font-medium mb-1">Allowances</label><input required type="number" className="w-full border rounded p-2" value={staffForm.salary.allowances} onChange={e => setStaffForm({...staffForm, salary: {...staffForm.salary, allowances: Number(e.target.value)}})} /></div>
                <div><label className="block text-sm font-medium mb-1">Deductions</label><input required type="number" className="w-full border rounded p-2" value={staffForm.salary.deductions} onChange={e => setStaffForm({...staffForm, salary: {...staffForm.salary, deductions: Number(e.target.value)}})} /></div>

                {/* Login Account Section */}
                <div className="md:col-span-3 mt-2 border-t pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <input type="checkbox" id="createLogin" className="w-4 h-4 text-[#8B5CF6] focus:ring-[#8B5CF6] border-gray-300 rounded" checked={staffForm.createLogin} onChange={e => setStaffForm({...staffForm, createLogin: e.target.checked})} />
                    <label htmlFor="createLogin" className="font-semibold cursor-pointer"><i className="fas fa-user-shield text-[#8B5CF6] mr-2"></i>Create System Login Account</label>
                  </div>
                  
                  {staffForm.createLogin && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div>
                        <label className="block text-sm font-medium mb-1">Role <span className="text-red-500">*</span></label>
                        <select className="w-full border rounded p-2" required={staffForm.createLogin} value={staffForm.roleName} onChange={e => setStaffForm({...staffForm, roleName: e.target.value})}>
                          <option value="">Select Role</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Librarian">Librarian</option>
                          <option value="FeeCashier">Fee Cashier</option>
                          <option value="Admin">Admin</option>
                          <option value="Staff">Staff</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Username <span className="text-red-500">*</span></label>
                        <input type="text" className="w-full border rounded p-2" required={staffForm.createLogin} value={staffForm.username} onChange={e => setStaffForm({...staffForm, username: e.target.value})} placeholder="e.g., john.doe" />
                      </div>
                      {adminRole === 'SuperAdmin' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Password {staffForm._id ? <span className="text-xs font-normal text-gray-500">(Leave blank to keep)</span> : <span className="text-red-500">*</span>}</label>
                          <input type="password" className="w-full border rounded p-2" required={staffForm.createLogin && !staffForm._id} value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} placeholder="Enter secure password" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-3 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowStaffForm(false)}>Cancel</Button>
                  <Button type="submit">Save Staff</Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700">Emp ID</th>
                  <th className="p-4 font-semibold text-gray-700">Name</th>
                  <th className="p-4 font-semibold text-gray-700">Department</th>
                  <th className="p-4 font-semibold text-gray-700">Designation</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                  <th className="p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-[#6D4C9C]">{s.employeeId}</td>
                    <td className="p-4">{s.firstName} {s.lastName}</td>
                    <td className="p-4">{s.department}</td>
                    <td className="p-4 text-sm">{s.designation}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${s.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-red-800'}`}>{s.status}</span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => { setStaffForm({...s}); setShowStaffForm(true); }} className="text-[#8B5CF6] hover:text-[#5B21B6]"><i className="fas fa-edit"></i></button>
                      <button onClick={() => handleDeleteStaff(s._id)} className="text-[#6D4C9C] hover:text-[#5B21B6]"><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No staff found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Daily Attendance</h2>
            <div className="flex items-center gap-2">
              <label className="font-semibold text-gray-700">Select Date:</label>
              <input type="date" className="border rounded p-2" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700">Emp ID</th>
                  <th className="p-4 font-semibold text-gray-700">Name</th>
                  <th className="p-4 font-semibold text-gray-700">Current Status</th>
                  <th className="p-4 font-semibold text-gray-700">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.map(s => {
                  const currentStatus = getAttendanceStatus(s._id);
                  return (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="p-4">{s.employeeId}</td>
                    <td className="p-4">{s.firstName} {s.lastName}</td>
                    <td className="p-4 font-semibold">{currentStatus}</td>
                    <td className="p-4 flex gap-2">
                      <button onClick={() => handleMarkAttendance(s._id, 'Present')} className={`px-3 py-1 text-sm rounded ${currentStatus === 'Present' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Present</button>
                      <button onClick={() => handleMarkAttendance(s._id, 'Absent')} className={`px-3 py-1 text-sm rounded ${currentStatus === 'Absent' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Absent</button>
                      <button onClick={() => handleMarkAttendance(s._id, 'Half-Day')} className={`px-3 py-1 text-sm rounded ${currentStatus === 'Half-Day' ? 'bg-yellow-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Half-Day</button>
                      <button onClick={() => handleMarkAttendance(s._id, 'Leave')} className={`px-3 py-1 text-sm rounded ${currentStatus === 'Leave' ? 'bg-[#6D4C9C] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Leave</button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAVES TAB */}
      {activeTab === 'leaves' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Leave Requests</h2>
            <Button onClick={() => setShowLeaveForm(true)}>Apply Leave (Admin override)</Button>
          </div>

          {showLeaveForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Apply Leave</h3>
              <form onSubmit={handleApplyLeave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Staff Member</label>
                  <select required className="w-full border rounded p-2" value={leaveForm.staff} onChange={e => setLeaveForm({...leaveForm, staff: e.target.value})}>
                    <option value="">Select Staff</option>
                    {staff.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.employeeId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full border rounded p-2" value={leaveForm.type} onChange={e => setLeaveForm({...leaveForm, type: e.target.value})}>
                    <option value="Casual">Casual</option><option value="Sick">Sick</option><option value="Paid">Paid</option><option value="Unpaid">Unpaid</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Start Date</label><input required type="date" className="w-full border rounded p-2" value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">End Date</label><input required type="date" className="w-full border rounded p-2" value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Reason</label><textarea required className="w-full border rounded p-2" value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}></textarea></div>
                
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <Button type="button" variant="secondary" onClick={() => setShowLeaveForm(false)}>Cancel</Button>
                  <Button type="submit">Submit Leave</Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700">Staff</th>
                  <th className="p-4 font-semibold text-gray-700">Type</th>
                  <th className="p-4 font-semibold text-gray-700">Dates</th>
                  <th className="p-4 font-semibold text-gray-700">Reason</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                  <th className="p-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaves.map(l => (
                  <tr key={l._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{l.staff?.firstName} {l.staff?.lastName} <br/><span className="text-xs text-gray-500">{l.staff?.employeeId}</span></td>
                    <td className="p-4">{l.type}</td>
                    <td className="p-4 text-sm">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</td>
                    <td className="p-4 text-sm max-w-xs">{l.reason}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${l.status === 'Approved' ? 'bg-green-100 text-green-800' : l.status === 'Rejected' ? 'bg-purple-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{l.status}</span>
                    </td>
                    <td className="p-4 flex gap-2">
                      {l.status === 'Pending' && (
                        <>
                          <button onClick={() => handleUpdateLeave(l._id, 'Approved')} className="text-green-600 hover:text-green-800"><i className="fas fa-check-circle text-lg"></i></button>
                          <button onClick={() => handleUpdateLeave(l._id, 'Rejected')} className="text-red-600 hover:text-red-800"><i className="fas fa-times-circle text-lg"></i></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No leave requests found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYROLL TAB */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Payroll & Salaries</h2>
            <div className="flex gap-4 items-center">
              <select className="border rounded p-2" value={payrollMonth} onChange={(e) => setPayrollMonth(e.target.value)}>
                {Array.from({length:12}, (_,i) => <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>)}
              </select>
              <input type="number" className="border rounded p-2 w-24" value={payrollYear} onChange={(e) => setPayrollYear(e.target.value)} />
              <Button onClick={handleGeneratePayroll}>Generate Payroll</Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700">Emp ID</th>
                  <th className="p-4 font-semibold text-gray-700">Name</th>
                  <th className="p-4 font-semibold text-gray-700">Basic</th>
                  <th className="p-4 font-semibold text-gray-700">Allowances</th>
                  <th className="p-4 font-semibold text-gray-700">Deductions</th>
                  <th className="p-4 font-semibold text-gray-700 text-[#5B21B6]">Net Salary</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                  <th className="p-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrolls.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="p-4">{p.staff?.employeeId}</td>
                    <td className="p-4 font-medium">{p.staff?.firstName} {p.staff?.lastName}</td>
                    <td className="p-4">₹{p.basic}</td>
                    <td className="p-4 text-green-600">+₹{p.allowances}</td>
                    <td className="p-4 text-red-600">-₹{p.deductions}</td>
                    <td className="p-4 font-bold text-[#5B21B6]">₹{p.netSalary}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${p.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</span>
                      {p.paymentDate && <div className="text-[10px] text-gray-500 mt-1">{new Date(p.paymentDate).toLocaleDateString()}</div>}
                    </td>
                    <td className="p-4">
                      {p.status === 'Pending' && (
                        <button onClick={() => handleUpdatePayrollStatus(p._id, 'Paid')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Mark Paid</button>
                      )}
                    </td>
                  </tr>
                ))}
                {payrolls.length === 0 && <tr><td colSpan="8" className="p-4 text-center text-gray-500">No payroll generated for this month. Click Generate Payroll.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManager;
