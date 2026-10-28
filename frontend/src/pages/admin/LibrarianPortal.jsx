import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';

const LibrarianPortal = () => {
  const { showToast, showLoading, hideLoading } = useOutletContext();
  const [books, setBooks] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory'); // inventory, issue, search
  
  // New Book Form
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', totalCopies: 1, availableCopies: 1 });
  
  // Edit Book State
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  
  // Issue Form
  const [issueData, setIssueData] = useState({ bookId: '', studentId: '', dueDate: '' });

  // Student Search
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  
  // Student Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchIssuedBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('/api/v1/library/books', { headers: { Authorization: `Bearer ${localStorage.getItem('cms_token')}` }});
      setBooks(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchIssuedBooks = async () => {
    try {
      const res = await axios.get('/api/v1/library/issue', { headers: { Authorization: `Bearer ${localStorage.getItem('cms_token')}` }});
      setIssuedBooks(res.data);
    } catch (e) { console.error(e); }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      showLoading('Adding book...');
      await axios.post('/api/v1/library/books', { ...newBook, availableCopies: newBook.totalCopies }, { headers: { Authorization: `Bearer ${localStorage.getItem('cms_token')}` }});
      showToast('Book added successfully');
      setNewBook({ title: '', author: '', isbn: '', totalCopies: 1, availableCopies: 1 });
      fetchBooks();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed', 'error');
    } finally { hideLoading(); }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    try {
      showLoading('Updating book...');
      await axios.put(`/api/v1/library/books/${editingBook._id}`, editingBook, { headers: { Authorization: `Bearer ${localStorage.getItem('cms_token')}` }});
      showToast('Book updated successfully');
      setIsEditBookModalOpen(false);
      fetchBooks();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed', 'error');
    } finally { hideLoading(); }
  };

  const handleDeleteBook = async (id) => {
    if(!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      showLoading('Deleting book...');
      await axios.delete(`/api/v1/library/books/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('cms_token')}` }});
      showToast('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed', 'error');
    } finally { hideLoading(); }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      showLoading('Issuing...');
      await axios.post('/api/v1/library/issue', issueData, { headers: { Authorization: `Bearer ${localStorage.getItem('cms_token')}` }});
      showToast('Book issued successfully');
      setIssueData({ bookId: '', studentId: '', dueDate: '' });
      fetchBooks();
      fetchIssuedBooks();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed', 'error');
    } finally { hideLoading(); }
  };

  const handleReturnBook = async (id) => {
    try {
      showLoading('Returning...');
      await axios.post('/api/v1/library/return', { issuedBookId: id, fine: 0, status: 'Returned' }, { headers: { Authorization: `Bearer ${localStorage.getItem('cms_token')}` }});
      showToast('Book returned');
      fetchBooks();
      fetchIssuedBooks();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed', 'error');
    } finally { hideLoading(); }
  };

  const handleReturnBookStatus = async (id, status, fine = 0) => {
    try {
      showLoading('Updating...');
      await axios.post('/api/v1/library/return', { issuedBookId: id, fine, status }, { headers: { Authorization: `Bearer ${localStorage.getItem('cms_token')}` }});
      showToast(`Book marked as ${status}`);
      fetchBooks();
      fetchIssuedBooks();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed', 'error');
    } finally { hideLoading(); }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleSearchStudents = async (e) => {
    e.preventDefault();
    try {
      showLoading('Searching...');
      const res = await axios.get('/api/v1/students', { headers: { Authorization: `Bearer ${localStorage.getItem('cms_token')}` }});
      const filtered = res.data.filter(s => s.studentId.includes(searchQuery) || s.name.toLowerCase().includes(searchQuery.toLowerCase()));
      setStudents(filtered);
    } catch (e) {
      showToast('Failed to search', 'error');
    } finally { hideLoading(); }
  };

  return (
    <div className="space-y-6 animate-[modalFadeIn_0.3s_ease]">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800"><i className="fas fa-book text-[#8B5CF6] mr-2"></i> Librarian Portal</h2>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'inventory' ? 'bg-purple-100 text-[#5B21B6]' : 'bg-gray-100 text-gray-600'}`}>Inventory</button>
          <button onClick={() => setActiveTab('issue')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'issue' ? 'bg-purple-100 text-[#5B21B6]' : 'bg-gray-100 text-gray-600'}`}>Issue/Return</button>
          <button onClick={() => setActiveTab('search')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'search' ? 'bg-purple-100 text-[#5B21B6]' : 'bg-gray-100 text-gray-600'}`}>Search Students</button>
        </div>
      </div>

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-lg mb-4">Add New Book</h3>
            <form onSubmit={handleAddBook} className="space-y-4">
              <input type="text" placeholder="Title" required className="w-full p-2 border rounded" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
              <input type="text" placeholder="Author" required className="w-full p-2 border rounded" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
              <input type="text" placeholder="ISBN" required className="w-full p-2 border rounded" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} />
              <input type="number" placeholder="Total Copies" required min="1" className="w-full p-2 border rounded" value={newBook.totalCopies} onChange={e => setNewBook({...newBook, totalCopies: parseInt(e.target.value)})} />
              <button type="submit" className="w-full py-2 bg-[#6D4C9C] text-white rounded font-bold hover:bg-[#5B21B6]">Add Book</button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-lg mb-4">Current Inventory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="bg-gray-50 border-b">
                  <th className="p-3">Title</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">ISBN</th>
                  <th className="p-3">Available/Total</th>
                  <th className="p-3 text-right">Actions</th>
                </tr></thead>
                <tbody>
                  {books.map(b => (
                    <tr key={b._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium">{b.title}</td>
                      <td className="p-3">{b.author}</td>
                      <td className="p-3">{b.isbn}</td>
                      <td className="p-3">{b.availableCopies} / {b.totalCopies}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => { setEditingBook({...b}); setIsEditBookModalOpen(true); }} className="w-8 h-8 rounded-lg bg-purple-50 text-[#6D4C9C] hover:bg-purple-100 transition inline-flex items-center justify-center mr-2" title="Edit Book">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleDeleteBook(b._id)} className="w-8 h-8 rounded-lg bg-purple-50 text-red-600 hover:bg-purple-100 transition inline-flex items-center justify-center" title="Delete Book">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-lg mb-4">Issue Book</h3>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <select required className="w-full p-2 border rounded" value={issueData.bookId} onChange={e => setIssueData({...issueData, bookId: e.target.value})}>
                <option value="">Select Book</option>
                {books.filter(b => b.availableCopies > 0).map(b => <option key={b._id} value={b._id}>{b.title} ({b.availableCopies} available)</option>)}
              </select>
              <input type="text" placeholder="Student ID" required className="w-full p-2 border rounded" value={issueData.studentId} onChange={e => setIssueData({...issueData, studentId: e.target.value})} />
              <input type="date" required className="w-full p-2 border rounded" value={issueData.dueDate} onChange={e => setIssueData({...issueData, dueDate: e.target.value})} />
              <button type="submit" className="w-full py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">Issue Book</button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-lg mb-4">Issued Books</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="bg-gray-50 border-b">
                  <th className="p-3">Book</th>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr></thead>
                <tbody>
                  {issuedBooks.map(ib => (
                    <tr key={ib._id} className="border-b">
                      <td className="p-3">{ib.book?.title}</td>
                      <td className="p-3">{ib.studentId}</td>
                      <td className="p-3">{new Date(ib.dueDate).toLocaleDateString()}</td>
                      <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${ib.status === 'Returned' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ib.status}</span></td>
                      <td className="p-3">
                        {ib.status === 'Issued' && <button onClick={() => handleReturnBook(ib._id)} className="bg-[#6D4C9C] text-white px-3 py-1 rounded text-sm">Return</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-lg mb-4">Search Global Student Database</h3>
          <form onSubmit={handleSearchStudents} className="flex gap-4 mb-6">
            <input type="text" placeholder="Search by Name or ID..." className="flex-1 p-2 border rounded" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <button type="submit" className="px-6 py-2 bg-[#6D4C9C] text-white font-bold rounded">Search</button>
          </form>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map(s => (
              <div 
                key={s._id} 
                className="border p-4 rounded-lg bg-gray-50 cursor-pointer hover:shadow-md transition border-gray-200 hover:border-blue-300"
                onClick={() => handleStudentClick(s)}
              >
                <div className="font-bold text-lg text-gray-800">{s.name}</div>
                <div className="text-gray-600 text-sm mb-2">ID: {s.studentId}</div>
                <div className="text-sm text-gray-700">Contact: {s.phone}</div>
                <div className="text-sm text-[#6D4C9C] font-medium mt-1">Department: {s.currentClass?.department}</div>
                <div className="text-sm text-[#6D4C9C] font-medium">Course: {s.currentClass?.course} {s.currentClass?.branch ? `(${s.currentClass.branch})` : ''}</div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-xs font-semibold bg-purple-100 text-blue-800 px-2 py-1 rounded">
                    {issuedBooks.filter(ib => ib.studentId === s.studentId && ib.status === 'Issued').length} Active Issues
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {isStudentModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-[modalFadeIn_0.3s_ease]">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                <i className="fas fa-user-graduate text-[#8B5CF6] mr-2"></i> 
                Student Record: {selectedStudent.name}
              </h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-gray-500 hover:text-[#6D4C9C] transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto style-scrollbar">
              <div className="mb-6 grid grid-cols-2 gap-4 text-sm bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div><span className="font-medium text-gray-600">Student ID:</span> <span className="font-bold text-gray-800">{selectedStudent.studentId}</span></div>
                <div><span className="font-medium text-gray-600">Contact:</span> <span className="font-bold text-gray-800">{selectedStudent.phone}</span></div>
                <div><span className="font-medium text-gray-600">Department:</span> <span className="font-bold text-gray-800">{selectedStudent.currentClass?.department}</span></div>
                <div><span className="font-medium text-gray-600">Course:</span> <span className="font-bold text-gray-800">{selectedStudent.currentClass?.course}</span></div>
              </div>

              <h4 className="font-bold text-lg mb-4 text-gray-800 flex items-center">
                <i className="fas fa-history text-gray-500 mr-2"></i> Issued Books History
              </h4>
              
              <div className="space-y-4">
                {issuedBooks.filter(ib => ib.studentId === selectedStudent.studentId).length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <i className="fas fa-book-open text-gray-400 text-3xl mb-2"></i>
                    <p className="text-gray-500 font-medium">No books issued to this student.</p>
                  </div>
                ) : (
                  issuedBooks.filter(ib => ib.studentId === selectedStudent.studentId).map(ib => (
                    <div key={ib._id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white shadow-sm hover:shadow transition-shadow">
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 text-lg mb-1">{ib.book?.title}</div>
                        <div className="text-sm text-gray-500 mb-2">
                          <span className="mr-3"><i className="far fa-calendar-alt mr-1"></i> Issued: {new Date(ib.issueDate).toLocaleDateString()}</span>
                          <span className={new Date(ib.dueDate) < new Date() && ib.status === 'Issued' ? 'text-[#6D4C9C] font-medium' : ''}>
                            <i className="far fa-clock mr-1"></i> Due: {new Date(ib.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                            ib.status === 'Returned' ? 'bg-green-100 text-green-700 border border-green-200' :
                            ib.status === 'Issued' ? 'bg-purple-100 text-[#5B21B6] border border-purple-200' :
                            'bg-purple-100 text-[#5B21B6] border border-red-200'
                          }`}>
                            {ib.status}
                          </span>
                          {ib.fine > 0 && (
                            <span className="text-xs font-bold text-red-600 bg-purple-50 px-2 py-1 rounded-md border border-red-100">
                              Fine: ₹{ib.fine}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {ib.status === 'Issued' && (
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto bg-gray-50 p-2 rounded-lg border border-gray-200">
                          <select id={`status-${ib._id}`} className="p-2 border border-gray-300 rounded text-sm bg-white focus:outline-[#8B5CF6] focus:ring-2 focus:ring-purple-200">
                            <option value="Returned">Returned (Good Condition)</option>
                            <option value="Lost">Lost</option>
                            <option value="Missing">Missing</option>
                            <option value="Torn">Torn / Damaged</option>
                          </select>
                          <input type="number" id={`fine-${ib._id}`} placeholder="Fine (₹)" className="p-2 border border-gray-300 rounded w-24 text-sm focus:outline-[#8B5CF6] focus:ring-2 focus:ring-purple-200" min="0" />
                          <button 
                            onClick={() => {
                              const status = document.getElementById(`status-${ib._id}`).value;
                              const fine = document.getElementById(`fine-${ib._id}`).value || 0;
                              handleReturnBookStatus(ib._id, status, Number(fine));
                            }}
                            className="bg-[#6D4C9C] hover:bg-[#5B21B6] text-white px-4 py-2 rounded text-sm font-medium transition shadow-sm"
                          >
                            Update
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {isEditBookModalOpen && editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-[modalFadeIn_0.3s_ease]">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Edit Book</h3>
              <button onClick={() => setIsEditBookModalOpen(false)} className="text-gray-500 hover:text-[#6D4C9C]"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleUpdateBook} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" required className="w-full p-2 border rounded" value={editingBook.title} onChange={e => setEditingBook({...editingBook, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input type="text" required className="w-full p-2 border rounded" value={editingBook.author} onChange={e => setEditingBook({...editingBook, author: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input type="text" required className="w-full p-2 border rounded" value={editingBook.isbn} onChange={e => setEditingBook({...editingBook, isbn: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available</label>
                  <input type="number" required min="0" className="w-full p-2 border rounded" value={editingBook.availableCopies} onChange={e => setEditingBook({...editingBook, availableCopies: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                  <input type="number" required min="1" className="w-full p-2 border rounded" value={editingBook.totalCopies} onChange={e => setEditingBook({...editingBook, totalCopies: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setIsEditBookModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded text-gray-700 hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#6D4C9C] text-white rounded hover:bg-[#5B21B6]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibrarianPortal;
