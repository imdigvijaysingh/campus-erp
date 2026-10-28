import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';
import Button from '../../components/common/Button';

const HostelManager = () => {
  const { showToast, showLoading, hideLoading, showConfirm } = useOutletContext();
  const [activeTab, setActiveTab] = useState('rooms');

  // Data states
  const [rooms, setRooms] = useState([]);
  const [hostelAllocations, setHostelAllocations] = useState([]);
  const [students, setStudents] = useState([]);

  // Form states
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomForm, setRoomForm] = useState({ roomNumber: '', block: 'Boys A', capacity: 2, feePerSemester: 0 });

  const [showHostelAllocForm, setShowHostelAllocForm] = useState(false);
  const [hostelAllocForm, setHostelAllocForm] = useState({ student: '', room: '' });

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
      if (activeTab === 'rooms') {
        const res = await api.get('/facility/hostel/rooms');
        setRooms(res.data.data);
      } else if (activeTab === 'hostel-alloc') {
        await fetchStudents();
        const res = await api.get('/facility/hostel/allocations');
        setHostelAllocations(res.data.data);
        if (rooms.length === 0) {
          const rRes = await api.get('/facility/hostel/rooms');
          setRooms(rRes.data.data);
        }
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to fetch data', 'error');
    } finally {
      hideLoading();
    }
  };

  // --- ROOM HANDLERS ---
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      showLoading('Saving...');
      if (roomForm._id) {
        await api.put(`/facility/hostel/rooms/${roomForm._id}`, roomForm);
      } else {
        await api.post('/facility/hostel/rooms', roomForm);
      }
      showToast('Room saved successfully');
      setShowRoomForm(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to save room', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleDeleteRoom = (id) => {
    showConfirm('Delete this room? This also deletes its allocations.', async () => {
      try {
        showLoading('Deleting...');
        await api.delete(`/facility/hostel/rooms/${id}`);
        showToast('Deleted successfully');
        fetchData();
      } catch (error) {
        showToast('Failed to delete', 'error');
      } finally {
        hideLoading();
      }
    });
  };

  const handleAllocateHostel = async (e) => {
    e.preventDefault();
    try {
      showLoading('Allocating...');
      await api.post('/facility/hostel/allocations', hostelAllocForm);
      showToast('Allocated successfully');
      setShowHostelAllocForm(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to allocate', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleVacateHostel = async (id) => {
    try {
      showLoading('Updating...');
      await api.put(`/facility/hostel/allocations/${id}`);
      showToast('Room vacated');
      fetchData();
    } catch (error) {
      showToast('Failed to update', 'error');
    } finally {
      hideLoading();
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hostel Management</h1>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6 flex-wrap">
        {[
          { id: 'rooms', label: 'Hostel Rooms' },
          { id: 'hostel-alloc', label: 'Hostel Allocations' }
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

      {/* HOSTEL ROOMS TAB */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Hostel Rooms</h2>
            <Button onClick={() => { 
              setRoomForm({ roomNumber: '', block: 'Boys A', capacity: 2, feePerSemester: 0 });
              setShowRoomForm(true); 
            }}>Add Room</Button>
          </div>

          {showRoomForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4">{roomForm._id ? 'Edit' : 'Add'} Room</h3>
              <form onSubmit={handleSaveRoom} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Room Number</label><input required type="text" className="w-full border rounded p-2" value={roomForm.roomNumber} onChange={e => setRoomForm({...roomForm, roomNumber: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Block / Wing</label><input required type="text" className="w-full border rounded p-2" value={roomForm.block} onChange={e => setRoomForm({...roomForm, block: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Capacity</label><input required type="number" min="1" className="w-full border rounded p-2" value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: Number(e.target.value)})} /></div>
                <div><label className="block text-sm font-medium mb-1">Fee Per Semester (₹)</label><input required type="number" min="0" className="w-full border rounded p-2" value={roomForm.feePerSemester} onChange={e => setRoomForm({...roomForm, feePerSemester: Number(e.target.value)})} /></div>

                <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowRoomForm(false)}>Cancel</Button>
                  <Button type="submit">Save Room</Button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <div key={room._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{room.roomNumber}</h3>
                    <span className="text-sm font-medium text-[#6D4C9C] bg-purple-50 px-2 py-1 rounded-full">{room.block}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setRoomForm({...room}); setShowRoomForm(true); }} className="text-gray-400 hover:text-[#8B5CF6]"><i className="fas fa-edit"></i></button>
                    <button onClick={() => handleDeleteRoom(room._id)} className="text-gray-400 hover:text-[#6D4C9C]"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
                <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-2">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Occupancy</div>
                    <div className="font-semibold text-gray-700">
                      <span className={room.occupancy >= room.capacity ? 'text-[#6D4C9C]' : 'text-green-600'}>{room.occupancy}</span> / {room.capacity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fee/Sem</div>
                    <div className="font-semibold text-gray-700">₹{room.feePerSemester}</div>
                  </div>
                </div>
              </div>
            ))}
            {rooms.length === 0 && <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg border border-dashed">No rooms found.</div>}
          </div>
        </div>
      )}

      {/* HOSTEL ALLOCATIONS TAB */}
      {activeTab === 'hostel-alloc' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Hostel Allocations</h2>
            <Button onClick={() => setShowHostelAllocForm(true)}>Allocate Room</Button>
          </div>

          {showHostelAllocForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Allocate Hostel Room</h3>
              <form onSubmit={handleAllocateHostel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Student</label>
                  <select required className="w-full border rounded p-2" value={hostelAllocForm.student} onChange={e => setHostelAllocForm({...hostelAllocForm, student: e.target.value})}>
                    <option value="">-- Select --</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.enrollmentNo})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select Room</label>
                  <select required className="w-full border rounded p-2" value={hostelAllocForm.room} onChange={e => setHostelAllocForm({...hostelAllocForm, room: e.target.value})}>
                    <option value="">-- Select --</option>
                    {rooms.filter(r => r.occupancy < r.capacity).map(r => <option key={r._id} value={r._id}>{r.block} - {r.roomNumber} ({r.capacity - r.occupancy} beds left)</option>)}
                  </select>
                </div>
                
                <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowHostelAllocForm(false)}>Cancel</Button>
                  <Button type="submit">Allocate</Button>
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
                  <th className="p-4 font-semibold text-gray-700">Room</th>
                  <th className="p-4 font-semibold text-gray-700">Date Allocated</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                  <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hostelAllocations.map(alloc => (
                  <tr key={alloc._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{alloc.student?.firstName} {alloc.student?.lastName} <br/><span className="text-xs text-gray-500">{alloc.student?.enrollmentNo}</span></td>
                    <td className="p-4 text-sm">{alloc.student?.course}</td>
                    <td className="p-4 font-bold">{alloc.room?.block} - {alloc.room?.roomNumber}</td>
                    <td className="p-4 text-sm">{new Date(alloc.allocationDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${alloc.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {alloc.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      {alloc.status === 'Active' && (
                        <button onClick={() => handleVacateHostel(alloc._id)} className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-red-600">Vacate</button>
                      )}
                    </td>
                  </tr>
                ))}
                {hostelAllocations.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No allocations found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelManager;
