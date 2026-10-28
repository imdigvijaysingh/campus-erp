import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { useOutletContext } from 'react-router-dom';
import CascadingDropdown from './components/CascadingDropdown';
import DragDropUpload from '../../components/common/DragDropUpload';
import InfoTooltip from '../../components/common/InfoTooltip';

const StudentsManager = () => {
  const { showConfirm } = useOutletContext();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const adminRole = localStorage.getItem('adminRole') || 'SuperAdmin';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [studentToPromote, setStudentToPromote] = useState(null);
  const [promoteData, setPromoteData] = useState({ session: '', semester: '', section: '' });

  // Batch Promotion State for Whole Session/Batch
  const [isBatchPromoteModalOpen, setIsBatchPromoteModalOpen] = useState(false);
  const [batchPromoteData, setBatchPromoteData] = useState({
    session: '',
    department: '',
    course: '',
    branch: '',
    fromSemester: '',
    toSemester: '2nd Semester',
    toSection: '',
    newSession: ''
  });

  // Pagination State for high-performance rendering & uncluttered tables
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // The selected hierarchy for filtering the student list
  const [filterHierarchy, setFilterHierarchy] = useState(null);

  const sessionOptions = [
    "2023-24", "2024-25", "2025-26", "2026-27", "2027-28", 
    "2028-29", "2029-30", "2030-31", "2031-32", "2032-33", 
    "2033-34", "2034-35", "2035-36"
  ];
  const semesterOptions = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
  ];
  const sectionOptions = [
    "Section A", "Section B", "Section C", "Section D", "General Section"
  ];

  // Unmasked APAAR cache (decrypted via audit-logged API)
  const [unmaskedApaarMap, setUnmaskedApaarMap] = useState({});

  // Current student being added/edited
  const emptyStudent = {
    studentId: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    photo: '',
    photoFile: null,
    apaarId: '',
    abcAccountId: '',
    digilockerVerified: false,
    ncrfCredits: {
      earnedCredits: 24,
      transferredCredits: 0,
      ncrfLevel: 'Level 6.0'
    },
    dob: '',
    isMinor: false,
    parentalConsent: {
      guardianName: '',
      guardianRelation: 'Father',
      guardianPhone: '',
      guardianEmail: '',
      consentStatus: 'EXEMPT_ADULT'
    },
    currentClass: {
      department: '',
      course: '',
      branch: '',
      session: '',
      semester: '1st Semester',
      section: 'Section A',
      marks: []
    },
    admitCardUrl: '',
    admitCardFile: null,
    attendance: 0,
    feeDetails: {
      totalAmount: 0,
      paidAmount: 0,
      lastPaymentDate: '',
      lastPaymentAmount: 0
    },
    semesters: [],
    isActive: true
  };
  const [currentStudent, setCurrentStudent] = useState(emptyStudent);
  const [newMark, setNewMark] = useState({ subject: '', totalMarks: 100, obtainedMarks: 0 });

  // Fetch students by hierarchy filter
  const fetchStudents = useCallback(async (hierarchy) => {
    if (!hierarchy || !hierarchy.session) { setStudents([]); return; }
    try {
      setLoading(true);
      const cleanParams = {};
      Object.keys(hierarchy).forEach(key => {
        if (hierarchy[key] && key !== 'subjects') {
          cleanParams[key] = hierarchy[key];
        }
      });
      const params = new URLSearchParams(cleanParams).toString();
      const { data } = await api.get(`/students?${params}`);
      setStudents(data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  // When hierarchy selection is complete, fetch students
  const handleHierarchySelect = (hierarchy) => {
    setFilterHierarchy(hierarchy);
    fetchStudents(hierarchy);
  };

  // Decrypt and reveal unmasked APAAR ID (Audit logged under CERT-In and DPDP rules)
  const handleRevealApaar = async (student) => {
    try {
      if (unmaskedApaarMap[student._id]) {
        setUnmaskedApaarMap(prev => {
          const next = { ...prev };
          delete next[student._id];
          return next;
        });
        return;
      }
      const { data } = await api.post(`/students/${student._id}/reveal-apaar`);
      setUnmaskedApaarMap(prev => ({ ...prev, [student._id]: data.apaarId }));
      toast.success('APAAR ID Decrypted & Logged in CERT-In Security Audit Trail', { icon: '🛡️' });
    } catch (err) {
      toast.error('Failed to decrypt APAAR ID');
    }
  };

  // Sync with Academic Bank of Credits (ABC) & DigiLocker
  const handleSyncAbc = async (student) => {
    try {
      const { data } = await api.post(`/students/${student._id}/sync-abc`, { additionalCredits: 4 });
      toast.success(data.message || 'Synced with DigiLocker ABC', { icon: '🎓' });
      setStudents(prev => prev.map(s => s._id === student._id ? { ...s, digilockerVerified: true, ncrfCredits: data.ncrfCredits } : s));
    } catch (err) {
      toast.error('Failed to sync with ABC');
    }
  };

  // Input handler for flat and nested fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('fee_')) {
      const feeField = name.replace('fee_', '');
      setCurrentStudent({
        ...currentStudent,
        feeDetails: { ...currentStudent.feeDetails, [feeField]: value }
      });
    } else if (name === 'dob') {
      const ageDiff = Date.now() - new Date(value).getTime();
      const age = Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
      const isMinor = age < 18;
      setCurrentStudent(prev => ({
        ...prev,
        dob: value,
        isMinor,
        parentalConsent: isMinor
          ? { ...(prev.parentalConsent || {}), consentStatus: prev.parentalConsent?.consentStatus === 'EXEMPT_ADULT' ? 'PENDING' : (prev.parentalConsent?.consentStatus || 'PENDING') }
          : { ...(prev.parentalConsent || {}), consentStatus: 'EXEMPT_ADULT' }
      }));
    } else if (name.startsWith('guardian_')) {
      const field = name.replace('guardian_', '');
      setCurrentStudent(prev => ({
        ...prev,
        parentalConsent: { ...(prev.parentalConsent || {}), [field]: value }
      }));
    } else if (name.startsWith('ncrf_')) {
      const field = name.replace('ncrf_', '');
      setCurrentStudent(prev => ({
        ...prev,
        ncrfCredits: { ...(prev.ncrfCredits || {}), [field]: value }
      }));
    } else {
      setCurrentStudent({
        ...currentStudent,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Marks management
  const handleAddMark = () => {
    if (!newMark.subject) return;
    setCurrentStudent({
      ...currentStudent,
      currentClass: {
        ...currentStudent.currentClass,
        marks: [...currentStudent.currentClass.marks, newMark]
      }
    });
    setNewMark({ subject: '', totalMarks: 100, obtainedMarks: 0 });
  };

  const handleRemoveMark = (index) => {
    const updatedMarks = [...currentStudent.currentClass.marks];
    updatedMarks.splice(index, 1);
    setCurrentStudent({
      ...currentStudent,
      currentClass: { ...currentStudent.currentClass, marks: updatedMarks }
    });
  };

  // Open Add modal — auto-fill the class from current filter
  const openAddModal = () => {
    if (!filterHierarchy || !filterHierarchy.session) {
      toast.error('Please select at least Department, Course, Branch, and Session from the dropdown first');
      return;
    }
    setIsEditing(false);
    setCurrentStudent({
      ...emptyStudent,
      currentClass: {
        department: filterHierarchy.department || '',
        course: filterHierarchy.course || '',
        branch: filterHierarchy.branch || '',
        session: filterHierarchy.session || '',
        semester: filterHierarchy.semester || '1st Semester',
        section: filterHierarchy.section || 'Section A',
        marks: []
      }
    });
    setIsModalOpen(true);
  };

  // Open Edit modal
  const openEditModal = (student) => {
    setIsEditing(true);
    setCurrentStudent({
      ...student,
      password: '',
      currentClass: student.currentClass ? {
        department: student.currentClass.department || '',
        course: student.currentClass.course || '',
        branch: student.currentClass.branch || '',
        session: student.currentClass.session || '',
        semester: student.currentClass.semester || '1st Semester',
        section: student.currentClass.section || 'Section A',
        marks: student.currentClass.marks || []
      } : { department: '', course: '', branch: '', session: '', semester: '1st Semester', section: 'Section A', marks: [] },
      attendance: student.attendance || 0,
      feeDetails: student.feeDetails || { totalAmount: 0, paidAmount: 0, lastPaymentDate: '', lastPaymentAmount: 0 },
      admitCardUrl: student.admitCardUrl || '',
      admitCardFile: null,
      photo: student.photo || '',
      photoFile: null,
      semesters: student.semesters || [],
      apaarId: student.apaarId || '',
      abcAccountId: student.abcAccountId || '',
      digilockerVerified: student.digilockerVerified || false,
      ncrfCredits: student.ncrfCredits || { earnedCredits: 24, transferredCredits: 0, ncrfLevel: 'Level 6.0' },
      dob: student.dob ? (typeof student.dob === 'string' ? student.dob.substring(0, 10) : new Date(student.dob).toISOString().substring(0, 10)) : '',
      isMinor: student.isMinor || false,
      parentalConsent: student.parentalConsent || { guardianName: '', guardianRelation: 'Father', guardianPhone: '', consentStatus: 'EXEMPT_ADULT' }
    });
    setIsModalOpen(true);
  };

  // Submit handler (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving student details...');
    try {
      const updateData = { ...currentStudent };

      // Upload photo if present
      if (updateData.photoFile) {
        toast.loading('Uploading photo...', { id: loadingToast });
        const photoData = new FormData();
        photoData.append('media', updateData.photoFile);
        const photoRes = await api.post('/media/upload', photoData, { headers: { 'Content-Type': 'multipart/form-data' }});
        updateData.photo = photoRes.data.data[0].url;
      }
      delete updateData.photoFile;
      
      // Upload admit card if present
      if (updateData.admitCardFile) {
        toast.loading('Uploading admit card...', { id: loadingToast });
        const admitData = new FormData();
        admitData.append('media', updateData.admitCardFile);
        const admitRes = await api.post('/media/upload', admitData, { headers: { 'Content-Type': 'multipart/form-data' }});
        updateData.admitCardUrl = admitRes.data.data[0].url;
      }
      delete updateData.admitCardFile;

      if (isEditing) {
        if (!updateData.password) delete updateData.password;
        await api.put(`/students/${currentStudent._id}`, updateData);
        toast.success('Student updated successfully', { id: loadingToast });
      } else {
        await api.post('/students', updateData);
        toast.success('Student added successfully', { id: loadingToast });
      }
      setIsModalOpen(false);
      fetchStudents(filterHierarchy);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save student', { id: loadingToast });
    }
  };

  // Promote Student handler
  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    if (!promoteData.session || !promoteData.semester || !promoteData.section) {
      return toast.error("Please fill all fields for promotion.");
    }
    const loadingToast = toast.loading('Promoting student...');
    try {
      const oldClass = { ...studentToPromote.currentClass };
      const newClass = {
        ...oldClass,
        session: promoteData.session,
        semester: promoteData.semester,
        section: promoteData.section,
        marks: []
      };
      const updatedSemesters = [...(studentToPromote.semesters || []), oldClass];
      
      const updatePayload = {
        currentClass: newClass,
        semesters: updatedSemesters,
        attendance: 0,
        feeDetails: {
          totalAmount: 0,
          paidAmount: 0,
          lastPaymentDate: null,
          lastPaymentAmount: 0
        }
      };

      await api.put(`/students/${studentToPromote._id}`, updatePayload);
      toast.success('Student promoted successfully', { id: loadingToast });
      setIsPromoteModalOpen(false);
      fetchStudents(filterHierarchy);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to promote student', { id: loadingToast });
    }
  };

  // Batch Promote Students Handler
  const handleBatchPromoteSubmit = async (e) => {
    e.preventDefault();
    if (!batchPromoteData.session || !batchPromoteData.toSemester) {
      return toast.error("Please specify at least Session batch and target Semester.");
    }
    const loadingToast = toast.loading('Promoting batch...');
    try {
      const { data } = await api.post('/students/batch-promote', batchPromoteData);
      toast.success(data.message || 'Batch promoted successfully!', { id: loadingToast });
      setIsBatchPromoteModalOpen(false);
      fetchStudents(filterHierarchy);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to promote batch', { id: loadingToast });
    }
  };

  // Delete handler
  const handleDelete = (id) => {
    showConfirm('Are you sure you want to delete this student? This action cannot be undone.', async () => {
      try {
        await api.delete(`/students/${id}`);
        toast.success('Student deleted');
        fetchStudents(filterHierarchy);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete student');
      }
    });
  };

  // Bulk Import Handler
  const handleCsvUpload = (file) => {
    if (!file) return;

    // We use a small timeout to show the loader if it takes >0.8s, but actually file reading is quick.
    // The backend request might take longer.
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        toast.error('CSV file is empty or only has a header.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      if (!headers.includes('studentid') || !headers.includes('name') || !headers.includes('password')) {
         return showConfirm('CSV must contain columns: studentId, name, password', null, { title: 'Invalid CSV Format', confirmType: 'primary', confirmText: 'OK' });
      }

      const studentsToImport = [];
      for (let i = 1; i < lines.length; i++) {
        // Simple CSV split (doesn't handle commas inside quotes, but okay for simple MVP)
        const currentLine = lines[i].split(',').map(item => item.trim());
        const studentData = {};
        
        headers.forEach((header, index) => {
          if (header === 'studentid') studentData.studentId = currentLine[index];
          else if (header === 'name') studentData.name = currentLine[index];
          else if (header === 'email') studentData.email = currentLine[index];
          else if (header === 'phone') studentData.phone = currentLine[index];
          else if (header === 'password') studentData.password = currentLine[index];
        });

        if (!studentData.studentId) continue;
        
        studentData.currentClass = {
          department: filterHierarchy.department,
          course: filterHierarchy.course,
          branch: filterHierarchy.branch,
          session: filterHierarchy.session,
          semester: filterHierarchy.semester,
          section: filterHierarchy.section,
          marks: []
        };

        studentsToImport.push(studentData);
      }

      setIsBulkModalOpen(false);
      
      const loadingToast = toast.loading('Importing students... Please wait.');
      try {
        const res = await api.post('/students/bulk', { students: studentsToImport });
        toast.success(res.data.message || 'Students imported successfully', { id: loadingToast });
        fetchStudents(filterHierarchy);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to import students', { id: loadingToast });
      }
    };
    reader.readAsText(file);
  };

  // Filter by search term (client-side)
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="animate-[modalFadeIn_0.3s_ease]">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Students & ERP Manager</h1>
            <InfoTooltip
              title="Comprehensive Student Registry"
              text="Centralized student records database managing admissions, semester promotions, APAAR IDs, DigiLocker Academic Bank of Credits (ABC), and DPDP parental consent."
              tip="Select your Department and Course below to filter the student roster."
            />
          </div>
          <p className="text-gray-500 text-sm">Select a class hierarchy below to view, promote, and manage student enrollments.</p>
        </div>
      </div>

      {/* Step 1: Select Class Hierarchy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            <i className="fas fa-filter text-[#8B5CF6] mr-2"></i>Step 1: Select Class
          </h2>
          <InfoTooltip
            title="Academic Batch Filtering"
            text="Filter down through Department, Course, Branch, Session, Semester, and Section to view only the students enrolled in that specific batch."
          />
        </div>
        <CascadingDropdown onSelectionComplete={(h) => { setCurrentPage(1); handleHierarchySelect(h); }} />
      </div>

      {/* Step 2: Student List */}
      {filterHierarchy && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  <i className="fas fa-user-graduate text-[#8B5CF6] mr-2"></i>
                  Students in {filterHierarchy.course || ''} — {filterHierarchy.branch || ''} {filterHierarchy.session ? `(${filterHierarchy.session})` : ''} {filterHierarchy.semester ? `— ${filterHierarchy.semester}` : '— All Semesters'} {filterHierarchy.section ? `(${filterHierarchy.section})` : ''}
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">{filteredStudents.length} student(s) found in this view</p>
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search by name, ID, email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                />
              </div>
              <button
                onClick={() => {
                  if (!filterHierarchy?.session) {
                    toast.error('Please select at least Department, Course, Branch, and Session from the dropdown first');
                    return;
                  }
                  setBatchPromoteData({
                    department: filterHierarchy.department || '',
                    course: filterHierarchy.course || '',
                    branch: filterHierarchy.branch || '',
                    session: filterHierarchy.session || '',
                    fromSemester: filterHierarchy.semester || '',
                    toSemester: '2nd Semester',
                    toSection: filterHierarchy.section || '',
                    newSession: ''
                  });
                  setIsBatchPromoteModalOpen(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
                title="Batch promote entire session batch (e.g. 2026-27) to next semester"
              >
                <i className="fas fa-layer-group"></i> Batch Promote
              </button>
              <button
                onClick={() => {
                  if (!filterHierarchy) {
                    toast.error('Please select a class from the hierarchy first');
                    return;
                  }
                  setIsBulkModalOpen(true);
                }}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
                title="Upload CSV / Excel to bulk enroll students"
              >
                <i className="fas fa-file-csv text-green-600"></i> Bulk Import
                <InfoTooltip
                  title="Mass CSV / Excel Onboarding"
                  text="Upload a spreadsheet with student names, IDs, phones, and emails to register an entire batch in seconds."
                  tip="Download the sample CSV format from the modal before uploading."
                  position="bottom"
                />
              </button>
              <button
                onClick={openAddModal}
                className="bg-[#6D4C9C] text-white px-4 py-2 rounded-lg hover:bg-[#5B21B6] transition font-medium flex items-center gap-2 whitespace-nowrap shadow-sm cursor-pointer"
              >
                <i className="fas fa-plus"></i> Add Student
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6D4C9C]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">
                      <span className="inline-flex items-center">
                        Student
                        <InfoTooltip title="Student Profile" text="Full name, unique enrollment ID, contact details, and photo." position="bottom" />
                      </span>
                    </th>
                    <th className="px-6 py-4">
                      <span className="inline-flex items-center">
                        APAAR ID (Masked / NEP)
                        <InfoTooltip
                          title="NEP 2020 APAAR ID"
                          text="12-digit Automated Permanent Academic Account Registry ID. Masked by default for privacy; unmasking is logged to the SOC security audit trail."
                          tip="Click the eye icon to unmask."
                          position="bottom"
                        />
                      </span>
                    </th>
                    <th className="px-6 py-4">
                      <span className="inline-flex items-center">
                        NCrF Credits
                        <InfoTooltip
                          title="National Credit Framework"
                          text="Earned semester credits aligned with UGC/AICTE NCrF academic levels (e.g. Level 6.0 for Bachelor degrees)."
                          position="bottom"
                        />
                      </span>
                    </th>
                    <th className="px-6 py-4">
                      <span className="inline-flex items-center">
                        Child Safety (DPDP)
                        <InfoTooltip
                          title="Digital Personal Data Protection"
                          text="Statutory compliance tracking minor student parental consent and verified guardian approvals."
                          position="bottom"
                        />
                      </span>
                    </th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">
                      <span className="inline-flex items-center justify-end">
                        Actions
                        <InfoTooltip
                          title="Student Operations"
                          text="Promote students to subsequent semesters, edit biodata, or manage enrollment status."
                          position="left"
                        />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedStudents.map((student) => {
                    const isDecrypted = Boolean(unmaskedApaarMap[student._id]);
                    const displayApaar = isDecrypted
                      ? unmaskedApaarMap[student._id]
                      : (student.maskedApaarId || (student.apaarId ? '•••• •••• ' + student.apaarId.slice(-4) : '•••• •••• 9284'));
                    
                    return (
                      <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            {student.photo ? (
                              <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-100 text-[#6D4C9C] flex items-center justify-center font-bold text-sm">
                                {student.name?.charAt(0)?.toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                              <div className="text-xs text-gray-500 font-mono">{student.studentId} • {student.phone || student.email || 'No contact'}</div>
                            </div>
                          </div>
                        </td>

                        {/* APAAR ID & DigiLocker */}
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-xs px-2.5 py-1 rounded-md border ${isDecrypted ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                              {displayApaar}
                            </span>
                            <button
                              onClick={() => handleRevealApaar(student)}
                              className="p-1.5 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition cursor-pointer"
                              title={isDecrypted ? 'Hide unmasked APAAR ID' : 'Decrypt & View Unmasked (Audit Logged)'}
                            >
                              <i className={`fas ${isDecrypted ? 'fa-eye-slash text-emerald-600' : 'fa-eye'}`}></i>
                            </button>
                            <button
                              onClick={() => handleSyncAbc(student)}
                              className={`p-1.5 text-xs rounded transition cursor-pointer ${student.digilockerVerified ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                              title={student.digilockerVerified ? 'DigiLocker Verified' : 'Sync with DigiLocker ABC'}
                            >
                              <i className="fas fa-arrows-rotate"></i>
                            </button>
                          </div>
                        </td>

                        {/* NCrF Credits */}
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">
                              {student.ncrfCredits?.earnedCredits || 24} Cr
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {student.ncrfCredits?.ncrfLevel || 'Level 6.0'}
                            </span>
                          </div>
                        </td>

                        {/* DPDP Child Safety Status */}
                        <td className="px-6 py-3">
                          {student.isMinor ? (
                            <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              <i className="fas fa-shield-halved text-amber-600 mr-1.5 mt-0.5"></i> Minor ({student.parentalConsent?.consentStatus || 'Verified'})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 inline-flex text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                              Adult (18+)
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-3">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-red-800'}`}>
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-medium">
                          <button onClick={() => { setStudentToPromote(student); setPromoteData({ session: '', semester: '', section: '' }); setIsPromoteModalOpen(true); }} className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition inline-flex items-center justify-center mr-2 cursor-pointer" title="Promote to Next Semester">
                            <i className="fas fa-arrow-up"></i>
                          </button>
                          <button onClick={() => openEditModal(student)} className="w-8 h-8 rounded-lg bg-purple-50 text-[#6D4C9C] hover:bg-purple-100 transition inline-flex items-center justify-center mr-2 cursor-pointer" title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button onClick={() => handleDelete(student._id)} className="w-8 h-8 rounded-lg bg-purple-50 text-red-600 hover:bg-purple-100 transition inline-flex items-center justify-center cursor-pointer" title="Delete">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                          <i className="fas fa-user-graduate"></i>
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-1">No Students Found</h3>
                        <p className="text-gray-500 text-sm">Add a student or upload a CSV to get started.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Clean Executive Pagination Footer */}
              {filteredStudents.length > 0 && (
                <div className="px-6 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>Show</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span>per page • Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + pageSize, filteredStudents.length)}</strong> of <strong>{filteredStudents.length}</strong> students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer"
                    >
                      <i className="fas fa-chevron-left text-[10px] mr-1"></i> Prev
                    </button>
                    <span className="px-3 py-1.5 font-bold text-[#6D4C9C] bg-purple-50 border border-purple-200 rounded-lg">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition cursor-pointer"
                    >
                      Next <i className="fas fa-chevron-right text-[10px] ml-1"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[99999] p-3 sm:p-4 overflow-y-auto animate-[modalFadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col my-auto animate-[modalSlideUp_0.25s_ease]">
            <div className="flex justify-between items-center p-6 border-b bg-white rounded-t-xl shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Edit Student & Academic Record' : 'Add New Student'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 style-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left Column: Personal Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2"><i className="fas fa-user text-[#8B5CF6] mr-2"></i>Personal Details</h3>
                  <div className="space-y-4">
                    {/* Photo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Student Photo</label>
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {currentStudent.photo ? (
                            <img src={currentStudent.photo} alt="Student" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-2xl border-2 border-dashed border-gray-300">
                              <i className="fas fa-camera"></i>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <DragDropUpload
                            accept="image/*"
                            label="Upload photo"
                            onFileSelect={(file) => setCurrentStudent({ ...currentStudent, photoFile: file })}
                          />
                          {(currentStudent.photo || currentStudent.photoFile) && (
                            <button type="button" onClick={() => setCurrentStudent({ ...currentStudent, photo: '', photoFile: null })} className="text-xs text-[#6D4C9C] mt-1 hover:underline">
                              Remove photo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student ID / Roll No <span className="text-[#6D4C9C]">*</span></label>
                      <input type="text" name="studentId" value={currentStudent.studentId} onChange={handleInputChange} required disabled={isEditing}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] disabled:bg-gray-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-[#6D4C9C]">*</span></label>
                      <input type="text" name="name" value={currentStudent.name} onChange={handleInputChange} required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-xs text-gray-400">(Optional)</span></label>
                      <input type="email" name="email" value={currentStudent.email || ''} onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-xs text-gray-400">(Optional)</span></label>
                      <input type="text" name="phone" value={currentStudent.phone || ''} onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-xs text-gray-400">(Optional)</span></label>
                      <input type="text" name="address" value={currentStudent.address || ''} onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]" />
                    </div>
                    {adminRole === 'SuperAdmin' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password {isEditing && <span className="text-xs text-gray-400">(Leave blank to keep current)</span>}
                        </label>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} name="password" value={currentStudent.password} onChange={handleInputChange} required={!isEditing}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] pr-10" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#8B5CF6]">
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center">
                      <input type="checkbox" name="isActive" checked={currentStudent.isActive} onChange={handleInputChange}
                        className="h-4 w-4 text-[#6D4C9C] focus:ring-[#8B5CF6] border-gray-300 rounded" id="isActiveCheckbox" />
                      <label htmlFor="isActiveCheckbox" className="ml-2 block text-sm text-gray-900">Active Account</label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Academic & ERP Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2"><i className="fas fa-graduation-cap text-[#8B5CF6] mr-2"></i>Academic Details</h3>
                  <div className="space-y-4">
                    {/* Class info with individual student Semester & Section dropdowns */}
                    <div className="bg-purple-50/80 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-purple-900">Academic Placement</p>
                        <span className="text-[11px] font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">Per-Student Assignment</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-purple-900 mb-3 bg-white/70 p-2.5 rounded border border-purple-100">
                        <div><span className="font-semibold text-gray-600">Dept:</span> {currentStudent.currentClass?.department || '—'}</div>
                        <div><span className="font-semibold text-gray-600">Course:</span> {currentStudent.currentClass?.course || '—'}</div>
                        <div><span className="font-semibold text-gray-600">Branch:</span> {currentStudent.currentClass?.branch || '—'}</div>
                        <div><span className="font-semibold text-gray-600">Session:</span> {currentStudent.currentClass?.session || '—'}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-purple-200">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Semester <span className="text-[#6D4C9C]">*</span>
                          </label>
                          <select
                            value={currentStudent.currentClass?.semester || '1st Semester'}
                            onChange={(e) => setCurrentStudent({
                              ...currentStudent,
                              currentClass: { ...currentStudent.currentClass, semester: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                          >
                            {semesterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Section
                          </label>
                          <select
                            value={currentStudent.currentClass?.section || 'Section A'}
                            onChange={(e) => setCurrentStudent({
                              ...currentStudent,
                              currentClass: { ...currentStudent.currentClass, section: e.target.value }
                            })}
                            className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                          >
                            {sectionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold text-gray-700 mb-3"><i className="fas fa-info-circle text-orange-500 mr-1"></i> Demographic & Academic Info</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Father's Name</label>
                            <input type="text" name="fatherName" value={currentStudent.fatherName || ''} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Mother's Name</label>
                            <input type="text" name="motherName" value={currentStudent.motherName || ''} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">D.O.B</label>
                            <input type="date" name="dob" value={currentStudent.dob ? currentStudent.dob.substring(0,10) : ''} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">College</label>
                            <input type="text" name="college" value={currentStudent.college || 'Quantum School of Technology'} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
                            <input type="text" name="specialization" value={currentStudent.specialization || ''} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Class Roll No.</label>
                            <input type="text" name="classRollNo" value={currentStudent.classRollNo || ''} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Enrollment No.</label>
                            <input type="text" name="enrollmentNo" value={currentStudent.enrollmentNo || ''} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">University Roll No.</label>
                            <input type="text" name="universityRollNo" value={currentStudent.universityRollNo || ''} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">HighSchool %</label>
                            <input type="number" name="highSchoolPercent" value={currentStudent.highSchoolPercent || ''} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Intermediate %</label>
                            <input type="number" name="intermediatePercent" value={currentStudent.intermediatePercent || ''} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                          </div>
                        </div>

                        {/* NCrF & DigiLocker APAAR Section */}
                        <div className="mt-4 pt-3 border-t">
                          <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <i className="fas fa-graduation-cap text-indigo-600"></i> NCrF & Academic Bank of Credits (ABC)
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">APAAR ID (12-Digit)</label>
                              <input type="text" name="apaarId" value={currentStudent.apaarId || ''} onChange={handleInputChange} placeholder="e.g. 8921-4820-1923" className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6] font-mono" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">ABC Account ID</label>
                              <input type="text" name="abcAccountId" value={currentStudent.abcAccountId || ''} onChange={handleInputChange} placeholder="e.g. ABC-902184029" className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6] font-mono" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Earned Credits</label>
                              <input type="number" name="ncrf_earnedCredits" value={currentStudent.ncrfCredits?.earnedCredits || 24} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">NCrF Framework Level</label>
                              <select name="ncrf_ncrfLevel" value={currentStudent.ncrfCredits?.ncrfLevel || 'Level 6.0'} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]">
                                <option value="Level 4.5">Level 4.5 (UG Certificate)</option>
                                <option value="Level 5.0">Level 5.0 (UG Diploma)</option>
                                <option value="Level 5.5">Level 5.5 (Bachelor 3-Yr)</option>
                                <option value="Level 6.0">Level 6.0 (Bachelor Hons 4-Yr)</option>
                                <option value="Level 7.0">Level 7.0 (Master Degree)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* DPDP Section 9 Child Safety Gate */}
                        <div className="mt-4 pt-3 border-t">
                          <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <i className="fas fa-shield-halved text-amber-600"></i> DPDP Child Safety & Parental Consent (Under 18)
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Guardian Name</label>
                              <input type="text" name="guardian_guardianName" value={currentStudent.parentalConsent?.guardianName || ''} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Guardian Phone</label>
                              <input type="text" name="guardian_guardianPhone" value={currentStudent.parentalConsent?.guardianPhone || ''} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Statutory Consent Status</label>
                              <select name="guardian_consentStatus" value={currentStudent.parentalConsent?.consentStatus || 'EXEMPT_ADULT'} onChange={handleInputChange} className="w-full px-2 py-1 border rounded text-sm focus:ring-[#8B5CF6]">
                                <option value="EXEMPT_ADULT">Exempt Adult (18+ Years Old)</option>
                                <option value="VERIFIED">Verified (Parent/Guardian Consent Validated)</option>
                                <option value="PENDING">Pending Parental Consent</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ERP Features */}
                    <div>
                      <h4 className="font-semibold text-gray-700 border-b pb-1 mb-3"><i className="fas fa-id-card text-green-500 mr-1"></i> ERP Features</h4>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admit Card</label>
                        <DragDropUpload
                          accept="image/*,application/pdf"
                          label="Upload Admit Card"
                          onFileSelect={(file) => setCurrentStudent({ ...currentStudent, admitCardFile: file })}
                        />
                        {(currentStudent.admitCardUrl || currentStudent.admitCardFile) && (
                          <div className="mt-2 flex items-center gap-2">
                            {currentStudent.admitCardUrl && (
                              <a href={currentStudent.admitCardUrl} target="_blank" rel="noreferrer" className="text-xs text-[#6D4C9C] hover:underline">View Admit Card</a>
                            )}
                            <button type="button" onClick={() => setCurrentStudent({ ...currentStudent, admitCardUrl: '', admitCardFile: null })} className="text-xs text-[#6D4C9C] hover:underline">Remove</button>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Total Fee</label>
                          <input type="number" name="fee_totalAmount" value={currentStudent.feeDetails?.totalAmount || 0} onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                          <input type="number" name="fee_paidAmount" value={currentStudent.feeDetails?.paidAmount || 0} onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attendance (%)</label>
                        <input type="number" name="attendance" value={currentStudent.attendance || 0} onChange={handleInputChange} min="0" max="100"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]" />
                      </div>
                    </div>

                    {/* Marks Management */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-800 mb-2"><i className="fas fa-chart-bar text-purple-500 mr-1"></i> Marks / Grades</h4>
                      <div className="bg-gray-50 p-4 rounded border mb-3">
                        <div className="flex gap-2 mb-3">
                          {filterHierarchy?.subjects?.length > 0 ? (
                            <select value={newMark.subject} onChange={(e) => setNewMark({...newMark, subject: e.target.value})} className="w-1/2 px-2 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] bg-white">
                              <option value="">Select Subject</option>
                              {filterHierarchy.subjects.map((sub, idx) => (
                                <option key={idx} value={sub}>{sub}</option>
                              ))}
                            </select>
                          ) : (
                            <input type="text" placeholder="Subject Name" value={newMark.subject} onChange={(e) => setNewMark({...newMark, subject: e.target.value})}
                              className="w-1/2 px-2 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]" />
                          )}
                          <input type="number" placeholder="Max" value={newMark.totalMarks} onChange={(e) => setNewMark({...newMark, totalMarks: parseInt(e.target.value)})}
                            className="w-1/4 px-2 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]" />
                          <input type="number" placeholder="Obtained" value={newMark.obtainedMarks} onChange={(e) => setNewMark({...newMark, obtainedMarks: parseInt(e.target.value)})}
                            className="w-1/4 px-2 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]" />
                        </div>
                        <button type="button" onClick={handleAddMark} className="w-full bg-[#6D4C9C] text-white px-4 py-2 rounded hover:bg-[#5B21B6] font-medium transition flex items-center justify-center gap-2">
                          <i className="fas fa-plus text-sm"></i> Add Mark
                        </button>
                      </div>

                      {currentStudent.currentClass.marks.length > 0 && (
                        <div className="border rounded overflow-hidden text-sm">
                          <table className="w-full text-left">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="p-2">Subject</th>
                                <th className="p-2">Max</th>
                                <th className="p-2">Obtained</th>
                                <th className="p-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentStudent.currentClass.marks.map((mark, idx) => (
                                <tr key={idx} className="border-t">
                                  <td className="p-2">{mark.subject}</td>
                                  <td className="p-2">{mark.totalMarks}</td>
                                  <td className="p-2 font-semibold text-[#6D4C9C]">{mark.obtainedMarks}</td>
                                  <td className="p-2 text-right">
                                    <button type="button" onClick={() => handleRemoveMark(idx)} className="text-[#6D4C9C] hover:text-[#5B21B6]">
                                      <i className="fas fa-times"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    
                    {/* Academic History View */}
                    {isEditing && currentStudent.semesters && currentStudent.semesters.length > 0 && (
                      <div className="mt-6 border-t pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3"><i className="fas fa-history text-gray-500 mr-1"></i> Academic History (Archived)</h4>
                        <div className="space-y-4">
                          {currentStudent.semesters.map((sem, idx) => (
                            <div key={idx} className="bg-gray-50 border rounded-lg p-3">
                              <p className="text-sm font-bold text-gray-700 mb-2">{sem.course} - {sem.branch} | {sem.session} ({sem.semester})</p>
                              {sem.marks && sem.marks.length > 0 ? (
                                <table className="w-full text-left text-xs bg-white rounded border">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="p-2">Subject</th>
                                      <th className="p-2">Marks</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sem.marks.map((m, mIdx) => (
                                      <tr key={mIdx} className="border-t">
                                        <td className="p-2">{m.subject}</td>
                                        <td className="p-2">{m.obtainedMarks} / {m.totalMarks}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-xs text-gray-500">No marks recorded.</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                  </div>
                </div>
              </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-xl shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2.5 text-white bg-[#6D4C9C] hover:bg-[#5B21B6] rounded-lg font-medium transition flex items-center gap-2">
                  <i className="fas fa-save"></i>
                  {isEditing ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Promote Modal */}
      {isPromoteModalOpen && studentToPromote && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[99999] p-3 sm:p-4 overflow-y-auto animate-[modalFadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col my-auto overflow-hidden animate-[modalSlideUp_0.25s_ease]">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b shrink-0 bg-slate-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-user-graduate text-purple-600"></i> Promote Student
              </h2>
              <button onClick={() => setIsPromoteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handlePromoteSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
                <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-100 text-sm">
                  <p className="font-semibold text-purple-900 mb-1">Promoting: {studentToPromote.name} ({studentToPromote.studentId})</p>
                  <p className="text-xs text-purple-700">Current Class will be archived to History before advancing.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Session</label>
                    <select 
                      required 
                      value={sessionOptions.includes(promoteData.session) ? promoteData.session : (promoteData.session ? 'Other' : '')} 
                      onChange={e => {
                        if (e.target.value !== 'Other') {
                          setPromoteData({...promoteData, session: e.target.value});
                        } else {
                          setPromoteData({...promoteData, session: ' '}); // trigger text input
                        }
                      }} 
                      className="w-full px-3 py-2 border rounded-lg focus:ring-[#8B5CF6] mb-2 text-sm"
                    >
                      <option value="" disabled>Select Session</option>
                      {sessionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      <option value="Other">Other (Manual Entry)</option>
                    </select>
                    {(!sessionOptions.includes(promoteData.session) && promoteData.session !== '') && (
                      <input type="text" placeholder="Enter manual session" required value={promoteData.session.trim()} onChange={e => setPromoteData({...promoteData, session: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-[#8B5CF6] text-sm" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Semester</label>
                    <select required value={promoteData.semester} onChange={e => setPromoteData({...promoteData, semester: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-[#8B5CF6] text-sm">
                      <option value="" disabled>Select Semester</option>
                      {semesterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Section</label>
                    <select required value={promoteData.section} onChange={e => setPromoteData({...promoteData, section: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-[#8B5CF6] text-sm">
                      <option value="" disabled>Select Section</option>
                      {sectionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 sm:p-5 border-t bg-gray-50/80 shrink-0">
                <button type="button" onClick={() => setIsPromoteModalOpen(false)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-medium transition cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg font-medium shadow-md transition flex items-center gap-2 cursor-pointer">
                  <i className="fas fa-arrow-up"></i> Promote
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Batch Promote Modal */}
      {isBatchPromoteModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[99999] p-3 sm:p-4 overflow-y-auto animate-[modalFadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col my-auto overflow-hidden animate-[modalSlideUp_0.25s_ease]">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-layer-group text-purple-600"></i> Batch Promotion
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Promote an entire session / batch of students simultaneously</p>
              </div>
              <button onClick={() => setIsBatchPromoteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleBatchPromoteSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
                <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 text-sm">
                  <p className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <i className="fas fa-info-circle text-purple-600"></i> Target Batch Scope
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-purple-950">
                    <div><span className="font-semibold text-gray-600">Session Batch:</span> {batchPromoteData.session || '—'}</div>
                    <div><span className="font-semibold text-gray-600">Department:</span> {batchPromoteData.department || 'All Departments'}</div>
                    <div><span className="font-semibold text-gray-600">Course:</span> {batchPromoteData.course || 'All Courses'}</div>
                    <div><span className="font-semibold text-gray-600">Branch:</span> {batchPromoteData.branch || 'All Branches'}</div>
                  </div>
                </div>

                {/* From Semester Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Semester (From)
                  </label>
                  <select
                    value={batchPromoteData.fromSemester}
                    onChange={(e) => setBatchPromoteData({ ...batchPromoteData, fromSemester: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5CF6] text-sm"
                  >
                    <option value="">All Semesters in this Batch</option>
                    {semesterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <span className="text-[11px] text-gray-500 mt-0.5 block">Select a specific semester to promote only those students, or leave as 'All'</span>
                </div>

                {/* To Semester */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Semester (To) <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={batchPromoteData.toSemester}
                    onChange={(e) => setBatchPromoteData({ ...batchPromoteData, toSemester: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5CF6] text-sm font-medium text-purple-900 bg-purple-50/30"
                  >
                    <option value="" disabled>Select Target Semester</option>
                    {semesterOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {/* Section update */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Section (Optional)
                  </label>
                  <select
                    value={batchPromoteData.toSection}
                    onChange={(e) => setBatchPromoteData({ ...batchPromoteData, toSection: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5CF6] text-sm"
                  >
                    <option value="">Keep Students' Existing Sections</option>
                    {sectionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                {/* New Academic Session */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Session Transition (Optional)
                  </label>
                  <select
                    value={batchPromoteData.newSession}
                    onChange={(e) => setBatchPromoteData({ ...batchPromoteData, newSession: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5CF6] text-sm"
                  >
                    <option value="">Keep Current Session ({batchPromoteData.session})</option>
                    {sessionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <i className="fas fa-shield-alt text-amber-600 mr-1.5"></i>
                  <strong>Audit & Archiving:</strong> All current grades and course records will be automatically archived into each student's semester history before promotion.
                </div>
              </div>

              <div className="flex justify-end gap-3 p-4 sm:p-5 border-t bg-gray-50/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBatchPromoteModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-medium shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-check-double"></i> Confirm Batch Promotion
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-[99999] p-3 sm:p-4 overflow-y-auto animate-[modalFadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col my-auto overflow-hidden animate-[modalSlideUp_0.25s_ease]">
            <div className="flex justify-between items-center p-5 sm:p-6 border-b shrink-0 bg-slate-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-file-csv text-blue-600"></i> Bulk Import Students
              </h2>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-sm">
                <p className="font-semibold mb-1 flex items-center gap-1.5"><i className="fas fa-info-circle text-blue-600"></i> Instructions:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Upload a <b>CSV</b> file.</li>
                  <li>The first row must be headers.</li>
                  <li>Required columns: <b>studentId, name, password</b></li>
                  <li>Optional columns: <b>email, phone</b></li>
                  <li>Students will be added to the currently selected class hierarchy.</li>
                </ul>
              </div>

              <DragDropUpload
                accept=".csv"
                label="Upload CSV File"
                onFileSelect={(file) => handleCsvUpload(file)}
              />
            </div>
            <div className="flex justify-end gap-3 p-4 sm:p-5 border-t bg-gray-50/80 shrink-0">
              <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg font-medium transition cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default StudentsManager;
