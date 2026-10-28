import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';
import Button from '../../components/common/Button';

const InventoryManager = () => {
  const { showToast, showLoading, hideLoading, showConfirm } = useOutletContext();
  const [activeTab, setActiveTab] = useState('items');

  // Data states
  const [items, setItems] = useState([]);
  const [issuances, setIssuances] = useState([]);

  // Form states
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    itemName: '', category: 'Stationery', quantity: 0, unit: 'pcs', location: '', pricePerUnit: 0
  });

  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueForm, setIssueForm] = useState({
    item: '', issuedTo: '', department: '', quantityIssued: 1, notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      showLoading();
      if (activeTab === 'items') {
        const res = await api.get('/inventory/items');
        setItems(res.data.data);
      } else if (activeTab === 'issuance') {
        const res = await api.get('/inventory/issuance');
        setIssuances(res.data.data);
        if (items.length === 0) {
          const itemsRes = await api.get('/inventory/items');
          setItems(itemsRes.data.data);
        }
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to fetch data', 'error');
    } finally {
      hideLoading();
    }
  };

  // --- ITEM HANDLERS ---
  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      showLoading('Saving...');
      if (itemForm._id) {
        await api.put(`/inventory/items/${itemForm._id}`, itemForm);
      } else {
        await api.post('/inventory/items', itemForm);
      }
      showToast('Item saved successfully');
      setShowItemForm(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to save item', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleDeleteItem = (id) => {
    showConfirm('Delete this item? This also deletes its issuance history.', async () => {
      try {
        showLoading('Deleting...');
        await api.delete(`/inventory/items/${id}`);
        showToast('Deleted successfully');
        fetchData();
      } catch (error) {
        showToast('Failed to delete', 'error');
      } finally {
        hideLoading();
      }
    });
  };

  // --- ISSUANCE HANDLERS ---
  const handleIssueItem = async (e) => {
    e.preventDefault();
    try {
      showLoading('Issuing...');
      await api.post('/inventory/issuance', issueForm);
      showToast('Item issued successfully');
      setShowIssueForm(false);
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to issue item', 'error');
    } finally {
      hideLoading();
    }
  };

  const handleUpdateIssuanceStatus = async (id, status) => {
    try {
      showLoading('Updating...');
      await api.put(`/inventory/issuance/${id}`, { status });
      showToast(`Item marked as ${status}`);
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
        <h1 className="text-2xl font-bold text-gray-800">Inventory & Assets</h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-sm text-gray-500 font-medium">Total Inventory Value:</span>
          <span className="ml-2 text-lg font-bold text-green-600">
            ₹{items.reduce((acc, item) => acc + ((item.pricePerUnit || 0) * (item.quantity || 0)), 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {['items', 'issuance'].map(tab => (
          <button
            key={tab}
            className={`pb-2 px-4 font-semibold capitalize ${activeTab === tab ? 'border-b-2 border-[#6D4C9C] text-[#6D4C9C]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'items' ? 'Items List' : 'Issuance Tracking'}
          </button>
        ))}
      </div>

      {/* ITEMS TAB */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Current Stock</h2>
            <Button onClick={() => { 
              setItemForm({ itemName: '', category: 'Stationery', quantity: 0, unit: 'pcs', location: '', pricePerUnit: 0 });
              setShowItemForm(true); 
            }}>Add Item</Button>
          </div>

          {showItemForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4">{itemForm._id ? 'Edit' : 'Add'} Item</h3>
              <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Item Name</label><input required type="text" className="w-full border rounded p-2" value={itemForm.itemName} onChange={e => setItemForm({...itemForm, itemName: e.target.value})} /></div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select className="w-full border rounded p-2" value={itemForm.category} onChange={e => setItemForm({...itemForm, category: e.target.value})}>
                    {['Stationery', 'Lab Equipment', 'Furniture', 'Electronics', 'Sports', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Current Quantity</label><input required type="number" min="0" className="w-full border rounded p-2" value={itemForm.quantity} onChange={e => setItemForm({...itemForm, quantity: Number(e.target.value)})} /></div>
                <div><label className="block text-sm font-medium mb-1">Unit (e.g. pcs, boxes)</label><input required type="text" className="w-full border rounded p-2" value={itemForm.unit} onChange={e => setItemForm({...itemForm, unit: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Location / Room</label><input type="text" className="w-full border rounded p-2" value={itemForm.location} onChange={e => setItemForm({...itemForm, location: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Price Per Unit (Optional)</label><input type="number" min="0" className="w-full border rounded p-2" value={itemForm.pricePerUnit} onChange={e => setItemForm({...itemForm, pricePerUnit: Number(e.target.value)})} /></div>

                <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowItemForm(false)}>Cancel</Button>
                  <Button type="submit">Save Item</Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700">Item Name</th>
                  <th className="p-4 font-semibold text-gray-700">Category</th>
                  <th className="p-4 font-semibold text-gray-700">Location</th>
                  <th className="p-4 font-semibold text-gray-700 text-center">Stock Available</th>
                  <th className="p-4 font-semibold text-gray-700">Price/Unit</th>
                  <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{item.itemName}</td>
                    <td className="p-4"><span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-blue-800">{item.category}</span></td>
                    <td className="p-4 text-sm text-gray-600">{item.location || '-'}</td>
                    <td className="p-4 text-center text-lg font-bold">
                      <span className={item.quantity === 0 ? 'text-[#6D4C9C]' : item.quantity < 10 ? 'text-yellow-600' : 'text-green-600'}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="p-4 text-sm">₹{item.pricePerUnit}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <button onClick={() => { setItemForm({...item}); setShowItemForm(true); }} className="text-[#8B5CF6] hover:text-[#5B21B6]"><i className="fas fa-edit"></i></button>
                      <button onClick={() => handleDeleteItem(item._id)} className="text-[#6D4C9C] hover:text-[#5B21B6]"><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No inventory items found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ISSUANCE TAB */}
      {activeTab === 'issuance' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Item Issuance Tracking</h2>
            <Button onClick={() => setShowIssueForm(true)}>Issue Item</Button>
          </div>

          {showIssueForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Issue Item</h3>
              <form onSubmit={handleIssueItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Item</label>
                  <select required className="w-full border rounded p-2" value={issueForm.item} onChange={e => setIssueForm({...issueForm, item: e.target.value})}>
                    <option value="">-- Select --</option>
                    {items.filter(i => i.quantity > 0).map(i => <option key={i._id} value={i._id}>{i.itemName} ({i.quantity} {i.unit} available)</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-1">Quantity to Issue</label><input required type="number" min="1" className="w-full border rounded p-2" value={issueForm.quantityIssued} onChange={e => setIssueForm({...issueForm, quantityIssued: Number(e.target.value)})} /></div>
                <div><label className="block text-sm font-medium mb-1">Issued To (Person Name)</label><input required type="text" className="w-full border rounded p-2" value={issueForm.issuedTo} onChange={e => setIssueForm({...issueForm, issuedTo: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Department</label><input type="text" className="w-full border rounded p-2" value={issueForm.department} onChange={e => setIssueForm({...issueForm, department: e.target.value})} /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Notes</label><textarea className="w-full border rounded p-2" value={issueForm.notes} onChange={e => setIssueForm({...issueForm, notes: e.target.value})}></textarea></div>

                <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowIssueForm(false)}>Cancel</Button>
                  <Button type="submit">Issue Item</Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-700">Item</th>
                  <th className="p-4 font-semibold text-gray-700">Issued To</th>
                  <th className="p-4 font-semibold text-gray-700">Qty</th>
                  <th className="p-4 font-semibold text-gray-700">Date Issued</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                  <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {issuances.map(iss => (
                  <tr key={iss._id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{iss.item?.itemName} <br/><span className="text-xs text-gray-500">{iss.item?.category}</span></td>
                    <td className="p-4">{iss.issuedTo} <br/><span className="text-xs text-gray-500">{iss.department}</span></td>
                    <td className="p-4 font-bold">{iss.quantityIssued} {iss.item?.unit}</td>
                    <td className="p-4 text-sm">{new Date(iss.issueDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${iss.status === 'Returned' ? 'bg-green-100 text-green-800' : iss.status === 'Consumed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {iss.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      {iss.status === 'Issued' && (
                        <>
                          <button onClick={() => handleUpdateIssuanceStatus(iss._id, 'Returned')} className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600" title="Mark as Returned (adds back to stock)">Returned</button>
                          <button onClick={() => handleUpdateIssuanceStatus(iss._id, 'Consumed')} className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600" title="Mark as Consumed (no stock change)">Consumed</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {issuances.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No issuance records found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
