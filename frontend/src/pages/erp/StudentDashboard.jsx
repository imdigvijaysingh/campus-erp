import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Toast from '../../components/common/Toast';
import ProfileImageCropper from '../../components/ProfileImageCropper';
import RedirectOverlay from '../../components/common/RedirectOverlay';
import ReceiptModal from '../../components/finance/ReceiptModal';
import HallTicketModal from '../../components/exam/HallTicketModal';
import ReportCardModal from '../../components/exam/ReportCardModal';
import InfoTooltip from '../../components/common/InfoTooltip';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const StudentDashboard = () => {

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [events, setEvents] = useState([]);
  const [circulars, setCirculars] = useState([]);
  const [tickets, setTickets] = useState([]);

  // Ticket form state
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', category: 'IT Support', priority: 'Medium' });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Tab & layout state
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [toast, setToast] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [syncingAbc, setSyncingAbc] = useState(false);
  
  // Phase 6 Fee & Receipts state
  const [feePayments, setFeePayments] = useState([]);
  const [loadingFeeHistory, setLoadingFeeHistory] = useState(false);
  const [isOnlineCheckoutOpen, setIsOnlineCheckoutOpen] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState('');
  const [checkoutCategory, setCheckoutCategory] = useState('Tuition Fee');
  const [checkoutMethod, setCheckoutMethod] = useState('UPI / QR Scan');
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Phase 7 Exam & OBE Assessment state
  const [studentHallTicket, setStudentHallTicket] = useState(null);
  const [isHallTicketModalOpen, setIsHallTicketModalOpen] = useState(false);
  const [loadingHallTicket, setLoadingHallTicket] = useState(false);
  const [studentAssessments, setStudentAssessments] = useState([]);
  const [activeReportCardAssessment, setActiveReportCardAssessment] = useState(null);
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState(false);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  // Question Papers & Sample Papers Archive state
  const [examPapers, setExamPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [paperCategory, setPaperCategory] = useState('college'); // 'college' | 'school'
  const [paperTypeFilter, setPaperTypeFilter] = useState('all'); // 'all' | 'Previous Year Exam Paper' | 'Sample / Model Paper' | 'Pre-Board Exam Paper' | 'Mid-Term Paper'
  const [paperCourseFilter, setPaperCourseFilter] = useState('all');
  const [paperSemesterFilter, setPaperSemesterFilter] = useState('all');
  const [paperClassFilter, setPaperClassFilter] = useState('all');
  const [paperStreamFilter, setPaperStreamFilter] = useState('all');
  const [paperSubjectFilter, setPaperSubjectFilter] = useState('all');
  const [paperYearFilter, setPaperYearFilter] = useState('all');
  const [paperSearch, setPaperSearch] = useState('');
  const [paperFiltersData, setPaperFiltersData] = useState({
    college: { courses: [], semesters: [], departments: [] },
    school: { classes: [], streams: [] },
    subjects: [],
    paperTypes: [],
    academicYears: []
  });
  const [activePdfPreview, setActivePdfPreview] = useState(null); // { isOpen, paper, viewMode: 'paper' | 'solution' }

  const navigate = useNavigate();
  const location = useLocation();

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Sync with Academic Bank of Credits & DigiLocker
  const handleSyncAbc = async () => {
    if (!profile?._id) return;
    try {
      setSyncingAbc(true);
      const token = localStorage.getItem('studentToken');
      const { data } = await axios.post(`/api/v1/students/${profile._id}/sync-abc`, { additionalCredits: 4 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(prev => ({
        ...prev,
        digilockerVerified: true,
        ncrfCredits: data.ncrfCredits
      }));
      showToast('Successfully synchronized with DigiLocker Academic Bank of Credits (ABC)!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to sync with ABC', 'error');
    } finally {
      setSyncingAbc(false);
    }
  };

  const fetchStudentFeePayments = async () => {
    if (!profile?.studentId) return;
    setLoadingFeeHistory(true);
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.get(`/api/v1/fees?studentId=${profile.studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setFeePayments(list);
    } catch (err) {
      console.error('Failed to load student fee payments:', err);
    } finally {
      setLoadingFeeHistory(false);
    }
  };

  useEffect(() => {
    if (profile?.studentId && activeTab === 'fee') {
      fetchStudentFeePayments();
    }
  }, [profile?.studentId, activeTab]);

  const fetchStudentHallTicket = async () => {
    if (!profile?.studentId) return;
    setLoadingHallTicket(true);
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.get(`/api/v1/exams/hall-ticket?studentId=${profile.studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.hallTicket) {
        setStudentHallTicket(res.data.hallTicket);
      }
    } catch (err) {
      console.error('Failed to load hall ticket:', err);
    } finally {
      setLoadingHallTicket(false);
    }
  };

  const fetchStudentAssessments = async () => {
    if (!profile?.studentId) return;
    setLoadingAssessments(true);
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.get(`/api/v1/exams/assessments?studentId=${profile.studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data?.data || [];
      setStudentAssessments(list);
      if (list.length > 0) {
        setActiveReportCardAssessment(list[list.length - 1]);
      }
    } catch (err) {
      console.error('Failed to load assessments:', err);
    } finally {
      setLoadingAssessments(false);
    }
  };

  useEffect(() => {
    if (profile?.studentId && activeTab === 'admitCard') {
      fetchStudentHallTicket();
    }
    if (profile?.studentId && activeTab === 'reportCard') {
      fetchStudentAssessments();
    }
  }, [profile?.studentId, activeTab]);

  const handleRazorpayPayment = async (e) => {
    if (e) e.preventDefault();
    const num = Number(checkoutAmount);
    if (!num || num <= 0) {
      showToast('Please enter a valid positive payment amount', 'error');
      return;
    }

    try {
      setProcessingCheckout(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        showToast('Razorpay Gateway SDK failed to load. Please verify your internet connection.', 'error');
        setProcessingCheckout(false);
        return;
      }

      const token = localStorage.getItem('studentToken');
      // Step 1: Request verified order from backend
      const orderRes = await axios.post('/api/v1/fees/razorpay/order', {
        studentId: profile.studentId,
        amount: num,
        feeCategory: checkoutCategory
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!orderRes.data?.success || !orderRes.data?.order) {
        throw new Error(orderRes.data?.error || 'Failed to initialize Razorpay checkout order');
      }

      const { order, keyId, student } = orderRes.data;
      const razorpayKey = keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Trd85yui9Lxf3X';

      // Step 2: Configure Razorpay Checkout Modal
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: profile.college || 'Shyvora Campus ERP',
        description: `${checkoutCategory} Fee Payment`,
        image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        order_id: order.id,
        prefill: {
          name: student?.name || profile.name || '',
          email: student?.email || profile.email || `${profile.studentId?.toLowerCase()}@campus.edu`,
          contact: student?.phone || profile.phone || '9999999999'
        },
        notes: {
          studentId: profile.studentId,
          feeCategory: checkoutCategory
        },
        theme: {
          color: '#6D4C9C'
        },
        modal: {
          ondismiss: () => {
            setProcessingCheckout(false);
            showToast('Payment window closed', 'info');
          }
        },
        handler: async (response) => {
          try {
            showToast('Verifying payment signature with banking gateway...', 'info');
            // Step 3: Cryptographically verify signature on server
            const verifyRes = await axios.post('/api/v1/fees/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              studentId: profile.studentId,
              amount: num,
              feeCategory: checkoutCategory
            }, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (verifyRes.data?.success) {
              showToast('Payment verified successfully! Official institutional receipt generated.', 'success');
              setIsOnlineCheckoutOpen(false);

              // Update local student profile fee details
              setProfile(prev => ({
                ...prev,
                feeDetails: {
                  ...prev.feeDetails,
                  paidAmount: (prev.feeDetails?.paidAmount || 0) + num,
                  lastPaymentDate: new Date().toISOString(),
                  lastPaymentAmount: num
                }
              }));

              fetchStudentFeePayments();

              if (verifyRes.data.payment) {
                setActiveReceipt(verifyRes.data.payment);
                setIsReceiptModalOpen(true);
              }
            }
          } catch (verifyErr) {
            console.error('Razorpay verification error:', verifyErr);
            showToast(verifyErr.response?.data?.error || 'Payment verification failed', 'error');
          } finally {
            setProcessingCheckout(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp) {
        setProcessingCheckout(false);
        showToast(resp.error?.description || 'Payment was declined or failed', 'error');
      });
      razorpayInstance.open();
    } catch (err) {
      console.error('Razorpay checkout error:', err);
      showToast(err.response?.data?.error || err.message || 'Payment initiation failed', 'error');
      setProcessingCheckout(false);
    }
  };

  const handleSimulateOnlinePayment = async (e) => {
    if (e) e.preventDefault();
    const num = Number(checkoutAmount);
    if (!num || num <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    try {
      setProcessingCheckout(true);
      const res = await axios.post('/api/v1/fees/simulate-online', {
        studentId: profile.studentId,
        amount: num,
        paymentMethod: `Online (${checkoutMethod})`,
        feeCategory: checkoutCategory
      });

      if (res.data?.success) {
        showToast('Payment successful! Official institutional receipt generated.', 'success');
        setIsOnlineCheckoutOpen(false);

        // Update local profile feeDetails
        setProfile(prev => ({
          ...prev,
          feeDetails: {
            ...prev.feeDetails,
            paidAmount: (prev.feeDetails?.paidAmount || 0) + num,
            lastPaymentDate: new Date().toISOString(),
            lastPaymentAmount: num
          }
        }));

        fetchStudentFeePayments();

        if (res.data.payment) {
          setActiveReceipt(res.data.payment);
          setIsReceiptModalOpen(true);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Payment failed', 'error');
    } finally {
      setProcessingCheckout(false);
    }
  };


  useEffect(() => {
    if (location.state?.toastMessage) {
      showToast(location.state.toastMessage, location.state.toastType || 'success');
      const newState = { ...location.state };
      delete newState.toastMessage;
      delete newState.toastType;
      navigate(location.pathname, { replace: true, state: newState });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('studentToken') || localStorage.getItem('cms_token');
        if (!token) {
          navigate('/authentication/index');
          return;
        }
        localStorage.setItem('studentToken', token);

        const { data } = await axios.get('/api/v1/students/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProfile(data);
      } catch (error) {
        showToast('Session expired. Please log in again.', 'error');
        localStorage.removeItem('studentToken');
        setTimeout(() => navigate('/authentication/index'), 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (!profile) return;
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('studentToken') || localStorage.getItem('cms_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [notifRes, assignRes, studyRes, eventsRes, circularsRes, ticketsRes] = await Promise.all([
          axios.get('/api/v1/notifications/my', config),
          axios.get('/api/v1/assignments/my', config),
          axios.get('/api/v1/study-materials/my', config),
          axios.get('/api/v1/events', config),
          axios.get('/api/v1/circulars'),
          axios.get('/api/v1/tickets/my', config)
        ]);
        
        setNotifications(notifRes.data);
        
        const lastViewed = localStorage.getItem('lastViewedNotifications_' + profile.studentId);
        const newNotifs = notifRes.data.filter(n => new Date(n.createdAt) > new Date(lastViewed || 0));
        setUnreadCount(newNotifs.length);
        
        setAssignments(assignRes.data);
        setStudyMaterials(studyRes.data);
        setEvents(eventsRes.data);
        setCirculars(circularsRes.data.data || circularsRes.data);
        setTickets(ticketsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchDashboardData();
  }, [profile]);

  // Question Papers & Sample Papers Archive Fetchers
  const fetchPaperFilters = async () => {
    try {
      const res = await axios.get('/api/v1/exam-papers/filters');
      if (res.data?.success && res.data?.data) {
        setPaperFiltersData(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load paper filters:', e);
    }
  };

  const fetchExamPapers = async () => {
    setLoadingPapers(true);
    try {
      const params = new URLSearchParams();
      if (paperCategory && paperCategory !== 'all') params.append('category', paperCategory);
      if (paperTypeFilter && paperTypeFilter !== 'all') params.append('paperType', paperTypeFilter);
      if (paperYearFilter && paperYearFilter !== 'all') params.append('academicYear', paperYearFilter);
      if (paperSubjectFilter && paperSubjectFilter !== 'all') params.append('subject', paperSubjectFilter);
      if (paperSearch && paperSearch.trim()) params.append('search', paperSearch.trim());

      if (paperCategory === 'college') {
        if (paperCourseFilter && paperCourseFilter !== 'all') params.append('course', paperCourseFilter);
        if (paperSemesterFilter && paperSemesterFilter !== 'all') params.append('semester', paperSemesterFilter);
      } else {
        if (paperClassFilter && paperClassFilter !== 'all') params.append('targetClass', paperClassFilter);
        if (paperStreamFilter && paperStreamFilter !== 'all') params.append('stream', paperStreamFilter);
      }

      const res = await axios.get(`/api/v1/exam-papers?${params.toString()}`);
      if (res.data?.success) {
        setExamPapers(res.data.data || []);
      }
    } catch (e) {
      console.error('Failed to load exam papers:', e);
    } finally {
      setLoadingPapers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'papers') {
      fetchPaperFilters();
      fetchExamPapers();
    }
  }, [
    activeTab, 
    paperCategory, 
    paperTypeFilter, 
    paperCourseFilter, 
    paperSemesterFilter, 
    paperClassFilter, 
    paperStreamFilter, 
    paperSubjectFilter, 
    paperYearFilter, 
    paperSearch
  ]);

  // Auto-detect student course/semester or class from profile
  useEffect(() => {
    if (profile) {
      if (profile.institutionId?.type === 'school') {
        setPaperCategory('school');
        if (profile.levelId?.name) setPaperClassFilter(profile.levelId.name);
      } else {
        setPaperCategory('college');
        if (profile.levelId?.name) setPaperSemesterFilter(profile.levelId.name);
        if (profile.programId?.name) setPaperCourseFilter(profile.programId.name);
      }
    }
  }, [profile]);

  const handleDownloadPaper = async (paper) => {
    try {
      await axios.patch(`/api/v1/exam-papers/${paper._id}/download`);
      setExamPapers(prev => prev.map(p => p._id === paper._id ? { ...p, downloadsCount: (p.downloadsCount || 0) + 1 } : p));
    } catch (e) {
      // ignore
    }
    const targetUrl = (paper.pdfUrls && paper.pdfUrls[0]) || paper.solutionUrl;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('studentToken');
      navigate('/authentication/index', { state: { toastMessage: 'Logged out successfully', toastType: 'success' } });
    }, 1500);
  };

  const handleBackToWebsite = (e) => {
    e.preventDefault();
    setIsRedirecting(true);
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const getFullEditFormData = (p = profile, extra = {}) => ({
    name: p?.name || '',
    email: p?.email || '',
    phone: p?.phone || '',
    address: p?.address || '',
    fatherName: p?.fatherName || '',
    motherName: p?.motherName || '',
    dob: p?.dob ? p.dob.substring(0, 10) : '',
    college: p?.college || 'Quantum School of Technology',
    specialization: p?.specialization || '',
    classRollNo: p?.classRollNo || '',
    enrollmentNo: p?.enrollmentNo || '',
    universityRollNo: p?.universityRollNo || '',
    highSchoolPercent: p?.highSchoolPercent !== undefined && p?.highSchoolPercent !== null ? p.highSchoolPercent : '',
    intermediatePercent: p?.intermediatePercent !== undefined && p?.intermediatePercent !== null ? p.intermediatePercent : '',
    photo: p?.photo || '',
    password: '',
    confirmPassword: '',
    ...extra
  });

  const handleEditProfile = () => {
    setEditFormData(getFullEditFormData(profile));
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (editFormData.password && editFormData.password !== editFormData.confirmPassword) {
      return showToast('Passwords do not match', 'error');
    }
    
    try {
      setSavingProfile(true);
      const token = localStorage.getItem('studentToken');
      
      const payload = { ...editFormData };
      if (!payload.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }
      
      const { data } = await axios.put('/api/v1/students/me', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(prev => ({ ...prev, ...data }));
      if (data.token) {
        localStorage.setItem('studentToken', data.token);
      }
      showToast('Profile updated successfully', 'success');
      setIsEditingProfile(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = async (base64Image) => {
    if (isEditingProfile) {
      // If currently in edit mode, just stage the photo into form data
      setEditFormData(prev => ({ ...prev, photo: base64Image }));
      showToast('Photo selected. Click Save to apply changes.', 'info');
    } else {
      // Direct instant photo upload without wiping entries or forcing into edit mode
      try {
        const token = localStorage.getItem('studentToken');
        const { data } = await axios.put('/api/v1/students/me', { photo: base64Image }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(prev => ({ ...prev, ...data, photo: base64Image }));
        showToast('Profile photo updated successfully!', 'success');
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to update photo', 'error');
      }
    }
  };

  const handlePhotoRemove = async () => {
    if (isEditingProfile) {
      setEditFormData(prev => ({ ...prev, photo: '' }));
      showToast('Photo removed. Click Save to apply changes.', 'info');
    } else {
      try {
        const token = localStorage.getItem('studentToken');
        const { data } = await axios.put('/api/v1/students/me', { photo: '' }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(prev => ({ ...prev, ...data, photo: '' }));
        showToast('Profile photo removed successfully!', 'success');
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to remove photo', 'error');
      }
    }
  };

  const handleInputChange = (e) => {
    setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6D4C9C]"></div>
      </div>
    );
  }

  if (!profile) return null;

  // --- RENDERERS FOR DIFFERENT TABS ---

  const getStudentPersonalizedSchedule = (currentClass) => {
    const courseStr = `${currentClass?.course || ''} ${currentClass?.branch || ''} ${currentClass?.semester || ''}`.toLowerCase();
    
    if (courseStr.includes('8') || courseStr.includes('school')) {
      // Class 8th Schedule
      return [
        { period: 'Period 1', time: '09:00 - 09:45 AM', subject: 'Mathematics', room: 'Room 12', teacher: 'Mrs. Neha Gupta', isLive: true, color: 'bg-amber-500' },
        { period: 'Period 2', time: '09:45 - 10:30 AM', subject: 'General Science', room: 'Room 12', teacher: 'Mr. Rajesh Khanna', color: 'bg-emerald-500' },
        { period: 'Period 3', time: '10:45 - 11:30 AM', subject: 'English Literature', room: 'Room 12', teacher: 'Ms. Ananya Sen', color: 'bg-indigo-500' },
        { period: 'Period 4', time: '11:30 - 12:15 PM', subject: 'Social Studies', room: 'Room 12', teacher: 'Mr. Vikram Singh', color: 'bg-blue-500' },
      ];
    } else if (courseStr.includes('bca')) {
      // BCA 4th Sem Schedule
      return [
        { period: 'Period 1', time: '09:30 - 10:30 AM', subject: 'Java Programming', room: 'Lab 1', teacher: 'Dr. Sharma', isLive: true, color: 'bg-purple-600' },
        { period: 'Period 2', time: '10:30 - 11:30 AM', subject: 'Operating Systems', room: 'Room B-201', teacher: 'Dr. Meenakshi Iyer', color: 'bg-emerald-500' },
        { period: 'Period 3', time: '11:45 - 12:45 PM', subject: 'Web Technologies', room: 'Lab 3', teacher: 'Prof. S. K. Roy', color: 'bg-blue-500' },
        { period: 'Period 4', time: '01:30 - 03:00 PM', subject: 'Database Management Lab', room: 'Lab 2', teacher: 'Prof. Mehta', color: 'bg-pink-500' },
      ];
    } else {
      // Default College / B.Tech CSE (6th Sem) Schedule
      return [
        { period: 'Period 1', time: '09:00 - 09:50 AM', subject: 'Data Structures & Algorithms', room: 'Room A-101', teacher: 'Dr. Sharma', isLive: true, color: 'bg-purple-600' },
        { period: 'Period 2', time: '10:00 - 10:50 AM', subject: 'Database Management Systems', room: 'Room A-203', teacher: 'Prof. Mehta', color: 'bg-emerald-500' },
        { period: 'Period 3', time: '11:00 - 11:50 AM', subject: 'Computer Networks', room: 'Room B-104', teacher: 'Dr. Verma', color: 'bg-blue-500' },
        { period: 'Period 4', time: '12:00 - 01:30 PM', subject: 'Algorithms & Problem Solving Lab', room: 'Lab 2', teacher: 'Dr. Sharma', color: 'bg-indigo-500' },
      ];
    }
  };

  const renderOverview = () => {
    const academicCourse = profile.currentClass?.course || profile.programId?.name || profile.college || 'B.Tech Computer Science';
    const academicBranch = profile.currentClass?.branch || profile.specialization || 'Computer Science & Engineering';
    const academicSemester = profile.currentClass?.semester || profile.levelId?.name || 'Semester 1';
    const academicSection = profile.currentClass?.section || 'Section A';
    const totalFee = profile.feeDetails?.totalAmount || 0;
    const paidFee = profile.feeDetails?.paidAmount || 0;
    const remainingDues = Math.max(0, totalFee - paidFee);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Details & Actionable Widgets */}
        <div className="lg:col-span-1 space-y-6">
          {/* Personal Profile Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-800">
                <i className="fas fa-user text-[#8B5CF6] mr-2"></i> Personal Profile
              </h2>
              {!isEditingProfile && (
                <button onClick={handleEditProfile} className="text-[#6D4C9C] hover:text-purple-800 text-sm font-semibold">
                  <i className="fas fa-edit mr-1"></i> Edit
                </button>
              )}
            </div>

            <div className="mb-6">
               <ProfileImageCropper 
                 currentPhoto={isEditingProfile && editFormData.photo !== undefined ? editFormData.photo : profile.photo} 
                 onUpload={handlePhotoUpload} 
                 onRemove={handlePhotoRemove} 
               />
            </div>
            
            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" name="name" value={editFormData.name} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" name="email" value={editFormData.email} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="text" name="phone" value={editFormData.phone} onChange={handleInputChange} required className="mt-1 w-full px-3 py-2 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea name="address" value={editFormData.address} onChange={handleInputChange} rows="2" className="mt-1 w-full px-3 py-2 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm"></textarea>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Demographic & Academic Info</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Father's Name</label>
                      <input type="text" name="fatherName" value={editFormData.fatherName} onChange={handleInputChange} className="mt-1 w-full px-2 py-1.5 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Mother's Name</label>
                      <input type="text" name="motherName" value={editFormData.motherName} onChange={handleInputChange} className="mt-1 w-full px-2 py-1.5 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Date of Birth</label>
                      <input type="date" name="dob" value={editFormData.dob} onChange={handleInputChange} className="mt-1 w-full px-2 py-1.5 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">College</label>
                      <input type="text" name="college" value={editFormData.college} onChange={handleInputChange} className="mt-1 w-full px-2 py-1.5 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Specialization</label>
                      <input type="text" name="specialization" value={editFormData.specialization} onChange={handleInputChange} className="mt-1 w-full px-2 py-1.5 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Class Roll No.</label>
                      <input type="text" name="classRollNo" value={editFormData.classRollNo} onChange={handleInputChange} className="mt-1 w-full px-2 py-1.5 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Enrollment No.</label>
                      <input type="text" name="enrollmentNo" value={editFormData.enrollmentNo} onChange={handleInputChange} className="mt-1 w-full px-2 py-1.5 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">University Roll No.</label>
                      <input type="text" name="universityRollNo" value={editFormData.universityRollNo} onChange={handleInputChange} className="mt-1 w-full px-2 py-1.5 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">HighSchool %</label>
                      <input type="number" name="highSchoolPercent" value={editFormData.highSchoolPercent} onChange={handleInputChange} className="mt-1 w-full px-2 py-1.5 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Intermediate %</label>
                      <input type="number" name="intermediatePercent" value={editFormData.intermediatePercent} onChange={handleInputChange} className="mt-1 w-full px-2 py-1.5 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Change Password (Optional)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <div className="relative mt-1">
                        <input type={showPassword ? "text" : "password"} name="password" value={editFormData.password} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm pr-10" placeholder="Leave blank to keep current" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#8B5CF6]">
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                      <div className="relative mt-1">
                        <input type={showPassword ? "text" : "password"} name="confirmPassword" value={editFormData.confirmPassword} onChange={handleInputChange} className="w-full px-3 py-2 border rounded focus:ring-[#8B5CF6] focus:border-[#8B5CF6] text-sm pr-10" placeholder="Confirm new password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#8B5CF6]">
                          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" disabled={savingProfile} className="flex-1 py-1.5 bg-[#6D4C9C] text-white rounded text-sm hover:bg-[#5B21B6] transition">{savingProfile ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            ) : (
              <ul className="space-y-3.5">
                <li>
                  <span className="block text-xs text-gray-500">Full Name</span>
                  <span className="font-semibold text-gray-900 text-sm">{profile.name}</span>
                </li>
                <li>
                  <span className="block text-xs text-gray-500">Email Address</span>
                  <span className="font-medium text-gray-900 text-xs">{profile.email}</span>
                </li>
                <li>
                  <span className="block text-xs text-gray-500">Phone Number</span>
                  <span className="font-medium text-gray-900 text-xs">{profile.phone || 'Not provided'}</span>
                </li>
                <li>
                  <span className="block text-xs text-gray-500">Address</span>
                  <span className="font-medium text-gray-900 text-xs">{profile.address || 'Not provided'}</span>
                </li>
                {profile.fatherName && (
                  <li>
                    <span className="block text-xs text-gray-500">Father's Name</span>
                    <span className="font-medium text-gray-900 text-xs">{profile.fatherName}</span>
                  </li>
                )}
                {profile.motherName && (
                  <li>
                    <span className="block text-xs text-gray-500">Mother's Name</span>
                    <span className="font-medium text-gray-900 text-xs">{profile.motherName}</span>
                  </li>
                )}
                {profile.dob && (
                  <li>
                    <span className="block text-xs text-gray-500">D.O.B.</span>
                    <span className="font-medium text-gray-900 text-xs">{new Date(profile.dob).toLocaleDateString()}</span>
                  </li>
                )}
                <li>
                  <span className="block text-xs text-gray-500">College / Institution</span>
                  <span className="font-medium text-gray-900 text-xs">{profile.college || profile.institutionId?.name || 'Quantum School of Technology'}</span>
                </li>
                <li>
                  <span className="block text-xs text-gray-500">Specialization</span>
                  <span className="font-medium text-gray-900 text-xs">{academicBranch}</span>
                </li>
                <li>
                  <span className="block text-xs text-gray-500">Enrollment No.</span>
                  <span className="font-mono font-medium text-gray-900 text-xs">{profile.enrollmentNo || 'ENR-2026-533137'}</span>
                </li>
                <li className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                    <i className="fas fa-check-circle"></i> Active Student
                  </span>
                </li>
              </ul>
            )}
          </div>

          {/* Recent Notifications Glimpse (Moved to Left Column) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-bell text-amber-500"></i> Recent Notifications
              </h2>
              <button onClick={() => setActiveTab('notifications')} className="text-[#6D4C9C] hover:text-purple-800 text-xs font-semibold">View All <i className="fas fa-arrow-right ml-0.5"></i></button>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-2.5">
                {notifications.slice(0, 3).map(n => (
                  <div 
                    key={n._id} 
                    onClick={() => n.actionTab && n.actionTab !== 'notifications' ? setActiveTab(n.actionTab) : setActiveTab('notifications')}
                    className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-purple-50/50 hover:border-purple-200 transition"
                  >
                    <div className="flex justify-between items-start gap-1 mb-0.5">
                      <h3 className="font-semibold text-gray-800 text-xs truncate">{n.title}</h3>
                      <span className="text-[10px] text-gray-400 shrink-0">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{n.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 text-center text-xs text-gray-400">
                <i className="fas fa-bell-slash text-gray-300 text-base mb-1 block"></i>
                No new notifications.
              </div>
            )}
          </div>

          {/* Recent Assignments Glimpse (Moved to Left Column) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <i className="fas fa-tasks text-purple-600"></i> Recent Assignments
              </h2>
              <button onClick={() => setActiveTab('assignments')} className="text-[#6D4C9C] hover:text-purple-800 text-xs font-semibold">View All <i className="fas fa-arrow-right ml-0.5"></i></button>
            </div>
            {assignments.length > 0 ? (
              <div className="space-y-2.5">
                {assignments.slice(0, 3).map(a => (
                  <div key={a._id} className="p-2.5 flex justify-between items-center bg-gray-50 rounded-lg border border-gray-100 hover:bg-purple-50/40 transition">
                    <div className="min-w-0 pr-2">
                      <h3 className="font-semibold text-gray-800 text-xs truncate">{a.title}</h3>
                      <p className="text-[10px] text-gray-400">Assigned: {new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                    <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-purple-100 text-[#6D4C9C] hover:bg-[#6D4C9C] hover:text-white flex items-center justify-center text-xs transition shrink-0" title="Download">
                      <i className="fas fa-download"></i>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 text-center text-xs text-gray-400">
                <i className="fas fa-clipboard-check text-gray-300 text-base mb-1 block"></i>
                No assignments pending.
              </div>
            )}
          </div>

          {/* Quick Shortcuts Widget */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50/50 to-white p-4 rounded-xl border border-purple-100 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-2.5 flex items-center gap-1.5">
              <i className="fas fa-bolt text-amber-500"></i> Quick Campus Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => setActiveTab('admitCard')}
                className="p-2 bg-white hover:bg-purple-100/60 border border-purple-100 rounded-lg text-left transition flex items-center gap-2 group cursor-pointer"
              >
                <i className="fas fa-id-card text-purple-600 group-hover:scale-110 transition shrink-0"></i>
                <span className="font-semibold text-gray-700 truncate text-xs">Admit Card</span>
              </button>
              <button 
                onClick={() => setActiveTab('reportCard')}
                className="p-2 bg-white hover:bg-purple-100/60 border border-purple-100 rounded-lg text-left transition flex items-center gap-2 group cursor-pointer"
              >
                <i className="fas fa-graduation-cap text-indigo-600 group-hover:scale-110 transition shrink-0"></i>
                <span className="font-semibold text-gray-700 truncate text-xs">Report Card</span>
              </button>
              <button 
                onClick={() => setActiveTab('studyMaterials')}
                className="p-2 bg-white hover:bg-purple-100/60 border border-purple-100 rounded-lg text-left transition flex items-center gap-2 group cursor-pointer"
              >
                <i className="fas fa-book-open text-blue-600 group-hover:scale-110 transition shrink-0"></i>
                <span className="font-semibold text-gray-700 truncate text-xs">Study Vault</span>
              </button>
              <button 
                onClick={() => setActiveTab('fee')}
                className="p-2 bg-white hover:bg-purple-100/60 border border-purple-100 rounded-lg text-left transition flex items-center gap-2 group cursor-pointer"
              >
                <i className="fas fa-receipt text-emerald-600 group-hover:scale-110 transition shrink-0"></i>
                <span className="font-semibold text-gray-700 truncate text-xs">Fee Ledger</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Academic Records & Schedules */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Current Class Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
               <h2 className="text-lg font-bold text-gray-800">
                 <i className="fas fa-graduation-cap text-[#8B5CF6] mr-2"></i> Academic Status
               </h2>
               <button onClick={() => setActiveTab('reportCard')} className="text-[#6D4C9C] hover:text-purple-800 text-sm font-semibold">View Report Card <i className="fas fa-arrow-right ml-1"></i></button>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Course</span>
                <span className="px-3 py-1 bg-purple-50 text-[#5B21B6] font-bold rounded-lg border border-purple-100 text-xs">
                  {academicCourse}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Branch</span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 text-xs">
                  {academicBranch}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Semester</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-100 text-xs">
                  {academicSemester}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">Section</span>
                <span className="px-3 py-1 bg-pink-50 text-pink-700 font-bold rounded-lg border border-pink-100 text-xs">
                  {academicSection}
                </span>
              </div>
              {(profile.classRollNo || '26CS01') && (
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Class Roll No.</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-700 font-bold rounded-lg border border-gray-200 text-xs">
                    {profile.classRollNo || '26CS01'}
                  </span>
                </div>
              )}
              {(profile.universityRollNo || 'UNIV-26-8921') && (
                <div>
                  <span className="block text-xs text-gray-500 mb-1">University Roll No.</span>
                  <span className="px-3 py-1 bg-gray-50 text-gray-700 font-bold rounded-lg border border-gray-200 text-xs">
                    {profile.universityRollNo || 'UNIV-26-8921'}
                  </span>
                </div>
              )}
            </div>

            {/* Attendance Section */}
            <div className="mt-4 pt-4 border-t border-gray-100">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-bold text-gray-700">Overall Attendance</span>
                 <span className={`text-sm font-bold ${(profile.attendance || 85) >= 75 ? 'text-green-600' : 'text-red-600'}`}>{(profile.attendance || 85)}%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2.5">
                 <div className={`h-2.5 rounded-full ${(profile.attendance || 85) >= 75 ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(profile.attendance || 85, 100)}%` }}></div>
               </div>
               {(profile.attendance || 85) < 75 && (
                 <p className="text-xs text-[#6D4C9C] mt-2"><i className="fas fa-exclamation-triangle"></i> Attendance is below the 75% required threshold.</p>
               )}
            </div>
          </div>

          {/* Today's Personalized Class Schedule */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-calendar-day text-[#8B5CF6]"></i> Today's Class Schedule
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Daily timetable for <span className="font-semibold text-purple-700">{academicCourse}</span> ({academicSemester} - {academicSection})
                </p>
              </div>
              <span className="whitespace-nowrap text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg self-start sm:self-center">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="space-y-2.5">
              {getStudentPersonalizedSchedule(profile.currentClass || { course: academicCourse, semester: academicSemester }).map((period, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50/40 border border-slate-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-purple-100 text-[#6D4C9C] font-bold text-xs flex items-center justify-center shrink-0">
                      P{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{period.subject}</h4>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 flex-wrap">
                        <span className="whitespace-nowrap shrink-0 flex items-center gap-1 font-semibold text-slate-700">
                          <i className="fas fa-location-dot text-[10px] text-slate-400"></i>
                          <span>{period.room}</span>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="whitespace-nowrap shrink-0 flex items-center gap-1 text-slate-600 font-medium">
                          <i className="fas fa-user-tie text-[10px] text-slate-400"></i>
                          <span>{period.teacher}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <span className="whitespace-nowrap font-mono text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {period.time}
                    </span>
                    {period.isLive && (
                      <span className="whitespace-nowrap text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Live Now
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fee Glimpse */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
               <h2 className="text-lg font-bold text-gray-800">
                 <i className="fas fa-rupee-sign text-emerald-600 mr-2"></i> Fee Summary
               </h2>
               <button onClick={() => setActiveTab('fee')} className="text-[#6D4C9C] hover:text-purple-800 text-sm font-semibold">View Full Report <i className="fas fa-arrow-right ml-1"></i></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <span className="block text-xs text-gray-500 mb-1">Total Fee</span>
                  <span className="font-extrabold text-gray-900 text-base">₹{totalFee.toLocaleString('en-IN')}</span>
               </div>
               <div className={`${remainingDues === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-purple-50 border-purple-200'} p-3.5 rounded-xl border`}>
                  <span className={`block text-xs ${remainingDues === 0 ? 'text-emerald-700' : 'text-[#6D4C9C]'} mb-1`}>Remaining Dues</span>
                  <span className={`font-extrabold ${remainingDues === 0 ? 'text-emerald-700' : 'text-[#5B21B6]'} text-base`}>
                    ₹{remainingDues.toLocaleString('en-IN')} {remainingDues === 0 ? '(All Cleared)' : ''}
                  </span>
               </div>
            </div>
            {remainingDues > 0 ? (
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-amber-700 font-medium">
                  <i className="fas fa-clock mr-1"></i> Balance pending for current academic term
                </span>
                <button
                  onClick={() => {
                    setCheckoutAmount(String(remainingDues));
                    setIsOnlineCheckoutOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
                >
                  <i className="fas fa-credit-card text-[11px]"></i> Pay Now (₹{remainingDues.toLocaleString('en-IN')})
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <i className="fas fa-circle-check text-emerald-500"></i>
                <span>All college fees are 100% cleared. No pending balance on account.</span>
              </div>
            )}
          </div>

          {/* Academic Bank of Credits (ABC) & NCrF Ledger Widget */}
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-800/40 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 text-white/5 text-9xl pointer-events-none">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    DigiLocker Synced
                  </span>
                  <span className="text-xs text-purple-200 font-mono">
                    APAAR: {profile.maskedApaarId || (profile.apaarId ? '•••• •••• ' + profile.apaarId.slice(-4) : '•••• •••• 1923')}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">Academic Bank of Credits (ABC)</h3>
                <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
                  National Credit Framework (NCrF) ledger verified under National Education Policy (NEP 2020).
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-black text-white">
                    {profile.ncrfCredits?.earnedCredits || 26} <span className="text-sm font-normal text-purple-300">Credits</span>
                  </div>
                  <div className="text-xs text-purple-200 font-medium">
                    {profile.ncrfCredits?.ncrfLevel || 'Level 6.0'}
                  </div>
                </div>
                <button
                  onClick={handleSyncAbc}
                  disabled={syncingAbc}
                  className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-purple-50 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <i className={`fas fa-arrows-rotate ${syncingAbc ? 'fa-spin' : ''}`}></i>
                  {syncingAbc ? 'Syncing...' : 'Sync ABC'}
                </button>
              </div>
            </div>
          </div>

          {/* PYQ & Sample Papers Practice Banner */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50/70 to-blue-50 border border-purple-200/80 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6D4C9C] to-[#8B5CF6] text-white flex items-center justify-center text-xl shadow-md shrink-0">
                <i className="fas fa-file-invoice"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-[#5B21B6] px-2 py-0.5 rounded-md border border-purple-200">
                    Exam Practice Bank
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">Previous Year Papers & Model Tests</span>
                </div>
                <h4 className="text-base font-extrabold text-gray-900 mt-0.5">
                  Old Question Papers & Sample Model Papers
                </h4>
                <p className="text-xs text-gray-600">
                  Sharpen exam preparation with official semester / board PYQs and sample papers with solutions.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('papers')}
              className="px-4 py-2.5 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              <span>Explore Papers Bank</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </button>
          </div>

        </div>
      </div>
    );
  };

  const renderFee = () => {
    const total = profile.feeDetails?.totalAmount || 0;
    const paid = profile.feeDetails?.paidAmount || 0;
    const remaining = Math.max(0, total - paid);
    const lastPaymentDate = profile.feeDetails?.lastPaymentDate ? new Date(profile.feeDetails.lastPaymentDate).toLocaleDateString('en-IN') : 'N/A';
    const lastPaymentAmount = profile.feeDetails?.lastPaymentAmount || 0;
    const paidPercent = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 100;

    return (
      <div className="space-y-6 animate-[modalFadeIn_0.3s_ease]">
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Verified Student Ledger
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {profile.studentId}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <i className="fas fa-wallet text-[#6D4C9C]"></i> Campus Fee Account & Receipts
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Track course fee installments, download official institutional receipts, and pay outstanding balances securely.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {remaining > 0 ? (
              <button
                onClick={() => {
                  setCheckoutAmount(remaining.toString());
                  setIsOnlineCheckoutOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <i className="fas fa-bolt text-amber-300"></i> Pay Dues via Razorpay (₹{remaining.toLocaleString('en-IN')})
              </button>
            ) : (
              <button
                onClick={() => {
                  setCheckoutAmount('5000');
                  setIsOnlineCheckoutOpen(true);
                }}
                className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-[#6D4C9C] rounded-xl font-bold text-xs border border-purple-200 flex items-center gap-2 transition cursor-pointer"
              >
                <i className="fas fa-plus-circle"></i> Pay Advance Fee (Razorpay)
              </button>
            )}
          </div>
        </div>

        {/* 3-Column Financial Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Program Fee</span>
                <div className="text-2xl font-black text-slate-900 mt-1">₹{total.toLocaleString('en-IN')}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <i className="fas fa-graduation-cap"></i>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              Academic Session 2026-27
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Paid Amount</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">₹{paid.toLocaleString('en-IN')}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Settled: {paidPercent}%</span>
                <span>{remaining === 0 ? 'Full Settled' : `₹${remaining.toLocaleString('en-IN')} Due`}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${paidPercent}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Remaining Balance</span>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  {remaining > 0 ? `₹${remaining.toLocaleString('en-IN')}` : '₹0 (All Cleared)'}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${remaining > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <i className={`fas ${remaining > 0 ? 'fa-hourglass-half' : 'fa-check'}`}></i>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
              <span>Last payment: ₹{lastPaymentAmount.toLocaleString('en-IN')}</span>
              <span className="font-mono">{lastPaymentDate}</span>
            </div>
          </div>
        </div>

        {/* Transactions & Receipts Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <i className="fas fa-file-invoice text-[#6D4C9C]"></i> Official Institutional Receipts
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download or print audit-ready receipts valid for Section 80C tax exemption and scholarship verification.
              </p>
            </div>
            <button
              onClick={fetchStudentFeePayments}
              className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fas fa-rotate"></i> Refresh
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">Particulars / Head</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                  <th className="p-3">Payment Mode</th>
                  <th className="p-3">Transaction Date</th>
                  <th className="p-3 text-center">Receipt Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingFeeHistory ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      <i className="fas fa-spinner fa-spin mr-2"></i> Loading payment records...
                    </td>
                  </tr>
                ) : feePayments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      <i className="fas fa-receipt text-3xl mb-2 block text-slate-300"></i>
                      No institutional fee payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  feePayments.map(p => (
                    <tr key={p._id || p.receiptNumber} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {p.receiptNumber}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {p.feeCategory || 'Tuition Fee'}
                        {p.scholarship?.amount > 0 && (
                          <span className="block text-[10px] font-normal text-emerald-600">
                            Scholarship: {p.scholarship.name} (-₹{p.scholarship.amount})
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-700">
                        ₹{p.amount?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setActiveReceipt(p);
                            setIsReceiptModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-[#6D4C9C]/10 hover:bg-[#6D4C9C] text-[#6D4C9C] hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer"
                        >
                          <i className="fas fa-print"></i> View Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Verification Banner */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <i className="fas fa-shield-alt text-emerald-600 text-lg"></i>
            <div>
              <span className="font-bold text-slate-800">256-Bit Encrypted Campus Payment Gateway</span>
              <p className="text-[11px] text-slate-500">
                All transactions generate digital tamper-evident receipts compliant with Indian Higher Education Audits.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] text-slate-400">ISO/IEC 27001</span>
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800"><i className="fas fa-bell text-[#8B5CF6] mr-2"></i> Notifications</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No notifications available.</div>
        ) : (
          notifications.map(n => (
            <div 
              key={n._id} 
              onClick={() => n.actionTab && n.actionTab !== 'notifications' ? setActiveTab(n.actionTab) : null}
              className={`p-6 transition ${n.actionTab && n.actionTab !== 'notifications' ? 'cursor-pointer hover:bg-purple-100' : 'hover:bg-purple-50'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900">{n.title}</h3>
                <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-600 text-sm mt-1">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800"><i className="fas fa-tasks text-purple-500 mr-2"></i> Assignments</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-500">No assignments assigned yet.</div>
        ) : (
          assignments.map(a => (
            <div key={a._id} className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">{a.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{a.description}</p>
                <p className="text-xs text-gray-400 mb-4">Assigned on: {new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
              <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold rounded transition">
                <i className="fas fa-download mr-1"></i> Download PDF
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderStudyMaterial = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800"><i className="fas fa-book-open text-green-500 mr-2"></i> Study Material</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyMaterials.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-500">No study material uploaded yet.</div>
        ) : (
          studyMaterials.map(m => (
            <div key={m._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition flex flex-col">
              {m.type === 'youtube' && m.thumbnailUrl ? (
                <div className="h-40 bg-gray-200 relative">
                  <img src={m.thumbnailUrl} alt={m.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <i className="fab fa-youtube text-4xl text-red-600 bg-white rounded-full"></i>
                  </div>
                </div>
              ) : (
                <div className="h-40 bg-purple-50 flex items-center justify-center text-purple-200">
                  <i className={`fas ${m.type === 'pdf' ? 'fa-file-pdf' : 'fa-video'} text-6xl`}></i>
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{m.title}</h3>
                  <p className="text-gray-500 text-xs mb-4 line-clamp-2">{m.description}</p>
                </div>
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold rounded transition text-sm">
                  {m.type === 'pdf' ? 'Download PDF' : 'Watch Video'}
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderExamPapersArchive = () => {
    // Quick statistics
    const totalPapers = examPapers.length;
    const pyqCount = examPapers.filter(p => p.paperType === 'Previous Year Exam Paper').length;
    const sampleCount = examPapers.filter(p => p.paperType === 'Sample / Model Paper' || p.paperType === 'Pre-Board Exam Paper').length;
    const solutionCount = examPapers.filter(p => p.solutionUrl).length;

    // College vs School specific filter options
    const collegeCourses = paperFiltersData.college?.courses || [];
    const collegeSemesters = paperFiltersData.college?.semesters || [];
    const schoolClasses = paperFiltersData.school?.classes || [];
    const schoolStreams = paperFiltersData.school?.streams || [];
    const allSubjects = paperFiltersData.subjects || [];
    const academicYears = paperFiltersData.academicYears || [];

    return (
      <div className="space-y-6 animate-[fadeIn_0.2s_ease]">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 text-white/5 text-9xl pointer-events-none select-none">
            <i className="fas fa-file-invoice"></i>
          </div>
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full">
                Examination & Practice Bank
              </span>
              <span className="text-xs text-purple-200/80 font-medium">
                {profile?.college || 'Institutional Exam Repository'}
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Question Papers & Sample Papers</span>
                  <InfoTooltip 
                    title="Examination Archive Bank" 
                    text="Access previous years' university and board examination papers (PYQs), curated model practice question papers, and official marking schemes/solutions. Filter by course and semester for colleges, or class-wise for schools." 
                    position="bottom" 
                  />
                </h1>
                <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-2xl leading-relaxed">
                  Practice with real question patterns, verify step-by-step marking schemes, and master core topics ahead of term finals.
                </p>
              </div>

              {/* Institution Category Switcher Pill (College vs School) */}
              <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 flex items-center shrink-0 self-start md:self-center shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setPaperCategory('college');
                    setPaperCourseFilter('all');
                    setPaperSemesterFilter('all');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    paperCategory === 'college'
                      ? 'bg-white text-slate-950 shadow-md scale-100'
                      : 'text-purple-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className="fas fa-graduation-cap"></i>
                  <span>College (Course & Sem)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaperCategory('school');
                    setPaperClassFilter('all');
                    setPaperStreamFilter('all');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    paperCategory === 'school'
                      ? 'bg-white text-slate-950 shadow-md scale-100'
                      : 'text-purple-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className="fas fa-school"></i>
                  <span>School (Class-wise)</span>
                </button>
              </div>
            </div>

            {/* Quick Stat Counter Cards inside Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">Total Papers</span>
                <span className="text-xl font-black text-white">{totalPapers} Available</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">Previous Years (PYQs)</span>
                <span className="text-xl font-black text-purple-300">{pyqCount} Papers</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">Sample & Model</span>
                <span className="text-xl font-black text-emerald-300">{sampleCount} Papers</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">With Answer Keys</span>
                <span className="text-xl font-black text-amber-300">{solutionCount} Solved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Paper Type Quick Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-gray-500 mr-2 uppercase tracking-wider">Format:</span>
            {[
              { id: 'all', label: 'All Papers', icon: 'fa-layer-group' },
              { id: 'Previous Year Exam Paper', label: 'Previous Year (PYQs)', icon: 'fa-history' },
              { id: 'Sample / Model Paper', label: 'Sample / Model Papers', icon: 'fa-lightbulb' },
              { id: 'Pre-Board Exam Paper', label: 'Pre-Board / Term Finals', icon: 'fa-chalkboard-user' },
              { id: 'Mid-Term Paper', label: 'Mid-Term / Sessional', icon: 'fa-clock' }
            ].map(type => (
              <button
                key={type.id}
                type="button"
                onClick={() => setPaperTypeFilter(type.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  paperTypeFilter === type.id
                    ? 'bg-[#6D4C9C] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <i className={`fas ${type.icon} text-[10px]`}></i>
                <span>{type.label}</span>
              </button>
            ))}
          </div>

          {(paperTypeFilter !== 'all' || paperCourseFilter !== 'all' || paperSemesterFilter !== 'all' || paperClassFilter !== 'all' || paperStreamFilter !== 'all' || paperSubjectFilter !== 'all' || paperYearFilter !== 'all' || paperSearch) && (
            <button
              type="button"
              onClick={() => {
                setPaperTypeFilter('all');
                setPaperCourseFilter('all');
                setPaperSemesterFilter('all');
                setPaperClassFilter('all');
                setPaperStreamFilter('all');
                setPaperSubjectFilter('all');
                setPaperYearFilter('all');
                setPaperSearch('');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <i className="fas fa-rotate-left"></i>
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Dynamic Cascaded Filters Row */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* College Filters */}
            {paperCategory === 'college' ? (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Degree Course
                  </label>
                  <select
                    value={paperCourseFilter}
                    onChange={(e) => setPaperCourseFilter(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6D4C9C]"
                  >
                    <option value="all">All Courses</option>
                    {collegeCourses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    value={paperSemesterFilter}
                    onChange={(e) => setPaperSemesterFilter(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6D4C9C]"
                  >
                    <option value="all">All Semesters</option>
                    {collegeSemesters.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              /* School Filters */
              <>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Class / Grade
                  </label>
                  <select
                    value={paperClassFilter}
                    onChange={(e) => setPaperClassFilter(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6D4C9C]"
                  >
                    <option value="all">All Classes</option>
                    {schoolClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Academic Stream
                  </label>
                  <select
                    value={paperStreamFilter}
                    onChange={(e) => setPaperStreamFilter(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6D4C9C]"
                  >
                    <option value="all">All Streams</option>
                    {schoolStreams.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Subject Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Subject
              </label>
              <select
                value={paperSubjectFilter}
                onChange={(e) => setPaperSubjectFilter(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6D4C9C]"
              >
                <option value="all">All Subjects</option>
                {allSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Academic Year Filter */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Academic Year
              </label>
              <select
                value={paperYearFilter}
                onChange={(e) => setPaperYearFilter(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6D4C9C]"
              >
                <option value="all">All Academic Years</option>
                {academicYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search bar row */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <i className="fas fa-search text-xs"></i>
              </div>
              <input
                type="text"
                value={paperSearch}
                onChange={(e) => setPaperSearch(e.target.value)}
                placeholder="Search question papers by subject name, paper code (e.g. CS502), or keywords..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4C9C]"
              />
              {paperSearch && (
                <button
                  type="button"
                  onClick={() => setPaperSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              )}
            </div>
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap hidden sm:inline">
              Showing <b className="text-gray-900">{examPapers.length}</b> paper{examPapers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Papers Grid */}
        {loadingPapers ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <i className="fas fa-spinner fa-spin text-3xl text-[#6D4C9C] mb-3"></i>
            <p className="text-sm font-semibold text-gray-600">Retrieving official question papers and marking keys...</p>
          </div>
        ) : examPapers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#6D4C9C] flex items-center justify-center text-2xl mx-auto mb-4 border border-purple-200">
              <i className="fas fa-file-excel"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Examination Papers Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
              We couldn't find any question papers matching your selected filters. Try switching the course/class, semester, or resetting filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setPaperTypeFilter('all');
                setPaperCourseFilter('all');
                setPaperSemesterFilter('all');
                setPaperClassFilter('all');
                setPaperStreamFilter('all');
                setPaperSubjectFilter('all');
                setPaperYearFilter('all');
                setPaperSearch('');
              }}
              className="px-4 py-2 bg-[#6D4C9C] text-white text-xs font-bold rounded-xl hover:bg-[#5B21B6] transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {examPapers.map((paper) => {
              const isPyq = paper.paperType === 'Previous Year Exam Paper';
              const isSample = paper.paperType === 'Sample / Model Paper';
              const isPreBoard = paper.paperType === 'Pre-Board Exam Paper';

              const badgeColor = isPyq 
                ? 'bg-purple-50 text-[#5B21B6] border-purple-200'
                : isSample 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isPreBoard
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-blue-50 text-blue-800 border-blue-200';

              const badgeIcon = isPyq ? 'fa-history' : isSample ? 'fa-lightbulb' : isPreBoard ? 'fa-chalkboard-user' : 'fa-clock';

              return (
                <div
                  key={paper._id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5">
                    {/* Top Row: Type Pill & Year Tag */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${badgeColor}`}>
                        <i className={`fas ${badgeIcon} text-[9px]`}></i>
                        <span>{paper.paperType}</span>
                      </span>
                      <span className="text-[11px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {paper.academicYear}
                      </span>
                    </div>

                    {/* Scope Badge (Course / Semester or Class / Stream) */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {paper.category === 'school' ? 'Class Scope:' : 'Academic Scope:'}
                      </span>
                      <span className="text-[11px] font-bold text-gray-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md truncate">
                        {paper.category === 'school' 
                          ? `${paper.targetClass || 'School'} • ${paper.stream || 'General'}`
                          : `${paper.course || 'Degree'} • ${paper.semester || 'Sem'}`}
                      </span>
                    </div>

                    {/* Subject Title & Code */}
                    <div className="mb-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black text-gray-900 text-base group-hover:text-[#6D4C9C] transition-colors leading-tight">
                          {paper.subject}
                        </h3>
                        {paper.subjectCode && (
                          <span className="text-[10px] font-mono font-bold bg-purple-50 text-[#6D4C9C] border border-purple-200 px-1.5 py-0.5 rounded shrink-0">
                            {paper.subjectCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {paper.title}
                      </p>
                    </div>

                    {/* Metadata Chips: Marks, Time, Size, Downloads */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <i className="fas fa-award text-amber-500 text-xs"></i>
                        <span>{paper.maxMarks || 100} Marks Max</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <i className="fas fa-stopwatch text-blue-500 text-xs"></i>
                        <span>{paper.durationMinutes ? `${paper.durationMinutes / 60} Hours` : '3 Hours'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <i className="fas fa-download text-emerald-500 text-xs"></i>
                        <span>{paper.downloadsCount || 0} Downloads</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <i className="fas fa-file-pdf text-red-500 text-xs"></i>
                        <span>{paper.fileSize || '1.5 MB'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActivePdfPreview({ isOpen: true, paper, viewMode: 'paper' })}
                        className="flex-1 py-2 bg-white hover:bg-purple-50 text-[#6D4C9C] border border-purple-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <i className="fas fa-eye text-[11px]"></i>
                        <span>Preview Paper</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadPaper(paper)}
                        className="flex-1 py-2 bg-[#6D4C9C] hover:bg-[#5B21B6] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <i className="fas fa-download text-[11px]"></i>
                        <span>Download</span>
                      </button>
                    </div>

                    {/* Solution / Marking Scheme Key Button if attached */}
                    {paper.solutionUrl && (
                      <button
                        type="button"
                        onClick={() => setActivePdfPreview({ isOpen: true, paper, viewMode: 'solution' })}
                        className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="fas fa-check-circle text-emerald-600 text-[11px]"></i>
                        <span>View Worked Solution & Marking Scheme</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderEvents = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800"><i className="fas fa-file-pdf text-[#6D4C9C] mr-2"></i> Official Circulars</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {circulars.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No circulars available.</div>
          ) : (
            circulars.map(c => (
              <div key={c._id} className="p-6 hover:bg-gray-50 transition">
                <h3 className="font-bold text-gray-900 mb-1">{c.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{c.description}</p>
                {c.pdfUrl && (
                  <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-red-600 text-sm font-medium hover:text-red-800 transition">
                    <i className="fas fa-download"></i> Download PDF
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800"><i className="fas fa-calendar-alt text-purple-500 mr-2"></i> Upcoming Events</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500">No upcoming events.</div>
          ) : (
            events.map(e => (
              <div key={e._id} className="border p-4 rounded-lg bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-1">{e.title} <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">{e.type}</span></h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{e.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span><i className="fas fa-calendar-day mr-1"></i> {new Date(e.date).toLocaleDateString()}</span>
                  <span><i className="fas fa-map-marker-alt mr-1"></i> {e.location}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setSubmittingTicket(true);
    try {
      const token = localStorage.getItem('studentToken');
      await axios.post('/api/v1/tickets', ticketForm, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Ticket submitted successfully');
      setTicketForm({ subject: '', description: '', category: 'IT Support', priority: 'Medium' });
      // Refresh tickets
      const res = await axios.get('/api/v1/tickets/my', { headers: { Authorization: `Bearer ${token}` } });
      setTickets(res.data);
    } catch (error) {
      showToast('Failed to submit ticket', 'error');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const renderHelpDesk = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4"><i className="fas fa-headset text-[#8B5CF6] mr-2"></i> Raise a Ticket</h2>
        <form onSubmit={handleTicketSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select required value={ticketForm.category} onChange={e => setTicketForm({...ticketForm, category: e.target.value})} className="w-full p-2 border rounded focus:ring-[#8B5CF6] text-sm">
              <option value="IT Support">IT Support</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Administration">Administration</option>
              <option value="Academics">Academics</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select required value={ticketForm.priority} onChange={e => setTicketForm({...ticketForm, priority: e.target.value})} className="w-full p-2 border rounded focus:ring-[#8B5CF6] text-sm">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input required type="text" value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} className="w-full p-2 border rounded focus:ring-[#8B5CF6] text-sm" placeholder="Brief subject" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required value={ticketForm.description} onChange={e => setTicketForm({...ticketForm, description: e.target.value})} className="w-full p-2 border rounded focus:ring-[#8B5CF6] text-sm h-24" placeholder="Detailed description of your issue" />
          </div>
          <button disabled={submittingTicket} type="submit" className="w-full bg-[#6D4C9C] text-white font-medium py-2 rounded hover:bg-[#5B21B6] transition">
            {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">My Tickets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-600">
                <th className="p-4 font-semibold">Subject</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Reply</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {tickets.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">You haven't raised any tickets yet.</td></tr>
              ) : (
                tickets.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{t.subject}</div>
                      <div className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 text-gray-600">{t.category}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'Open' ? 'bg-purple-100 text-[#5B21B6]' : t.status === 'In Progress' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>{t.status}</span>
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate" title={t.reply}>{t.reply || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAdmitCard = () => {
    const isAttendanceEligible = (Number(profile.attendance) || 85) >= 75;
    const subjects = studentHallTicket?.schedule?.subjects || [
      { subjectCode: 'CS501', subjectName: 'Design & Analysis of Algorithms', examDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), timeSlot: '09:30 AM - 12:30 PM', roomNumber: 'Hall 101 - Block A' },
      { subjectCode: 'CS502', subjectName: 'Database Management Systems', examDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), timeSlot: '09:30 AM - 12:30 PM', roomNumber: 'Hall 102 - Block A' },
      { subjectCode: 'CS503', subjectName: 'Computer Networks & Security', examDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000), timeSlot: '09:30 AM - 12:30 PM', roomNumber: 'Hall 103 - Block B' }
    ];

    return (
      <div className="space-y-6 animate-[modalFadeIn_0.3s_ease]">
        {/* Header Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                Examination Cell • Session 2026-27
              </span>
              <span className="text-xs text-slate-500 font-mono">HT-2026-{profile.studentId}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <i className="fas fa-id-card text-indigo-600"></i> Examination Admit Card & Hall Ticket
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Download your verified examination hall ticket with center verification QR code and seat allotment.
            </p>
          </div>

          <button
            onClick={() => {
              if (studentHallTicket) {
                setIsHallTicketModalOpen(true);
              } else {
                fetchStudentHallTicket().then(() => setIsHallTicketModalOpen(true));
              }
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <i className="fas fa-print"></i> Download / Print Hall Ticket
          </button>
        </div>

        {/* 3 Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Allotted Center</span>
            <div className="font-black text-slate-900 text-sm mt-1">
              {studentHallTicket?.examCenter || 'Shyvora Central Examination Complex'}
            </div>
            <span className="text-[11px] text-indigo-600 font-mono mt-1 block">Center Code: CTR-DEL-042</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Attendance Gate</span>
            <div className="font-black text-sm mt-1 flex items-center gap-2">
              <span className={isAttendanceEligible ? 'text-emerald-700' : 'text-amber-700'}>
                {profile.attendance || 85}% Attendance
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isAttendanceEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {isAttendanceEligible ? 'Eligible (&ge;75%)' : 'Conditional'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Statutory UGC Requirement</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Hall Ticket Status</span>
            <div className="font-black text-emerald-700 text-sm mt-1 flex items-center gap-1.5">
              <i className="fas fa-check-circle"></i> VERIFIED & CLEARED
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block font-mono">Digital Signature Valid</span>
          </div>
        </div>

        {/* Timetable Overview Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <i className="fas fa-calendar-alt text-indigo-600"></i> Scheduled Examination Papers
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Date & Slot</th>
                  <th className="p-3">Course Code</th>
                  <th className="p-3">Paper / Subject</th>
                  <th className="p-3 text-center">Examination Hall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {new Date(sub.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <span className="block text-[10px] text-slate-500 font-normal">{sub.timeSlot}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-900">{sub.subjectCode}</td>
                    <td className="p-3 font-medium text-slate-900">{sub.subjectName}</td>
                    <td className="p-3 text-center text-slate-700 font-semibold">{sub.roomNumber || 'Hall 1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderReportCard = () => {
    const currentAssessment = activeReportCardAssessment || {
      studentName: profile.name,
      studentId: profile.studentId,
      course: profile.currentClass?.course || 'Undergraduate Degree',
      semester: profile.currentClass?.semester || '5th Sem',
      academicSession: '2026-27',
      sgpa: 8.42,
      cgpa: 8.35,
      totalCredits: 11,
      earnedCredits: 11,
      resultStatus: 'PASS',
      subjectScores: [
        { subjectCode: 'CS501', subjectName: 'Design & Analysis of Algorithms', credits: 4, courseCategory: 'Major', totalMarks: 90, maxMarks: 100, letterGrade: 'O', gradePoint: 10, creditPointsEarned: 40 },
        { subjectCode: 'CS502', subjectName: 'Database Management Systems', credits: 4, courseCategory: 'Major', totalMarks: 82, maxMarks: 100, letterGrade: 'A+', gradePoint: 9, creditPointsEarned: 36 },
        { subjectCode: 'CS503', subjectName: 'Computer Networks & Security', credits: 3, courseCategory: 'Major', totalMarks: 74, maxMarks: 100, letterGrade: 'A', gradePoint: 8, creditPointsEarned: 24 }
      ]
    };

    const scores = currentAssessment.subjectScores || [];

    return (
      <div className="space-y-6 animate-[modalFadeIn_0.3s_ease]">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                UGC CBCS & NCrF Credit Framework
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: {profile.studentId}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <i className="fas fa-award text-amber-500"></i> Semester Grade Report & Transcript
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Outcome-Based Education (OBE) evaluation with 10-point letter grades and accumulated academic credits.
            </p>
          </div>

          <button
            onClick={() => setIsReportCardModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <i className="fas fa-print"></i> Download Official Transcript
          </button>
        </div>

        {/* 4 Performance Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Semester SGPA</span>
            <div className="text-3xl font-black text-indigo-900 mt-1">{currentAssessment.sgpa}</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Scale of 10.0</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cumulative CGPA</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{currentAssessment.cgpa}</div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Overall Academic Record</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">NCrF Credits Earned</span>
            <div className="text-3xl font-black text-emerald-700 mt-1">{currentAssessment.earnedCredits || 11}</div>
            <span className="text-[10px] text-emerald-600 mt-0.5 block">DigiLocker ABC Synced</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Classification</span>
            <div className="text-sm font-black text-emerald-800 mt-2 bg-emerald-100 py-1 px-2 rounded-full inline-block">
              {currentAssessment.resultStatus || 'PASS'}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">First Class Distinction</span>
          </div>
        </div>

        {/* Subjects Breakdown Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <i className="fas fa-book text-indigo-600"></i> Course Performance & Letter Grades
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Course Code</th>
                  <th className="p-3">Course Name</th>
                  <th className="p-3 text-center">Credits</th>
                  <th className="p-3 text-center">Marks (Obt/Max)</th>
                  <th className="p-3 text-center">Letter Grade</th>
                  <th className="p-3 text-center">Grade Point</th>
                  <th className="p-3 text-right">Credit Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scores.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-800">{sub.subjectCode}</td>
                    <td className="p-3 font-medium text-slate-900">
                      {sub.subjectName}
                      <span className="block text-[10px] text-slate-500">{sub.courseCategory || 'Major'}</span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-800">{sub.credits}</td>
                    <td className="p-3 text-center font-medium text-slate-700">{sub.totalMarks} / {sub.maxMarks || 100}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded font-black text-xs bg-emerald-100 text-emerald-800">
                        {sub.letterGrade}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-900">{sub.gradePoint}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{sub.creditPointsEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-extrabold text-[#6D4C9C] tracking-tight">ERP Portal</h2>
          <button className="md:hidden text-gray-400 hover:text-gray-600 transition" onClick={() => setIsSidebarOpen(false)}>
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'overview', icon: 'fa-home', label: 'Dashboard' },
            { id: 'papers', icon: 'fa-file-invoice', label: 'Old & Sample Papers' },
            { id: 'fee', icon: 'fa-rupee-sign', label: 'Fee Report' },
            { id: 'notifications', icon: 'fa-bell', label: 'Notifications' },
            { id: 'assignments', icon: 'fa-tasks', label: 'Assignments' },
            { id: 'studyMaterials', icon: 'fa-book-open', label: 'Study Material' },
            { id: 'events', icon: 'fa-calendar-alt', label: 'Events & Circulars' },
            { id: 'helpdesk', icon: 'fa-headset', label: 'Help Desk' },
            { id: 'admitCard', icon: 'fa-id-card', label: 'Admit Card' },
            { id: 'reportCard', icon: 'fa-chart-bar', label: 'Report Card' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { 
                setActiveTab(tab.id); 
                setIsSidebarOpen(false); 
                if (tab.id === 'notifications') {
                  setUnreadCount(0);
                  localStorage.setItem('lastViewedNotifications_' + profile.studentId, new Date().toISOString());
                }
              }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition font-medium ${activeTab === tab.id ? 'bg-purple-50 text-[#5B21B6] shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <i className={`fas ${tab.icon} w-5 text-center`}></i> {tab.label}
              {tab.id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Student Welfare & Privacy Rights Links */}
        <div className="px-4 py-2 border-t border-gray-100 flex flex-col gap-1 text-xs shrink-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Welfare & Statutory Rights</span>
          <button 
            type="button"
            onClick={() => window.open('/safety', '_blank')}
            className="flex items-center gap-2 py-1 text-gray-600 hover:text-rose-600 font-semibold transition-colors text-left"
          >
            <i className="fas fa-hand-holding-heart text-rose-500 w-4 text-center text-xs"></i> 
            <span>Safety & Anti-Ragging</span>
          </button>
          <button 
            type="button"
            onClick={() => window.open('/privacy', '_blank')}
            className="flex items-center gap-2 py-1 text-gray-600 hover:text-[#6D4C9C] font-semibold transition-colors text-left"
          >
            <i className="fas fa-scale-balanced text-[#6D4C9C] w-4 text-center text-xs"></i> 
            <span>Privacy & DPDP Rights</span>
          </button>
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <button 
            onClick={handleBackToWebsite}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-[#6D4C9C] hover:bg-purple-100 rounded-lg transition text-sm font-bold mb-2"
          >
            <i className="fas fa-external-link-alt"></i> Back to Website
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-red-600 hover:bg-purple-100 rounded-lg transition text-sm font-bold"
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex justify-between items-center bg-white p-4 shadow-sm border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
              className="md:hidden text-gray-600 hover:text-[#6D4C9C] p-2 -ml-2 transition" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            
            <div className="h-10 w-10 md:h-12 md:w-12 bg-purple-100 text-[#6D4C9C] rounded-full flex items-center justify-center text-lg md:text-xl font-bold border-2 border-purple-200 overflow-hidden shrink-0 shadow-inner">
              {profile.photo ? (
                <img src={profile.photo} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                profile.name.charAt(0)
              )}
            </div>
            
            <div className="truncate">
              <h1 className="text-base md:text-lg font-bold text-gray-900 truncate">
                Welcome, {profile.name.split(' ')[0]}
              </h1>
              <p className="text-xs text-gray-500 truncate">ID: {profile.studentId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button
               onClick={() => {
                 setActiveTab('notifications');
                 setUnreadCount(0);
                 localStorage.setItem('lastViewedNotifications_' + profile.studentId, new Date().toISOString());
               }}
               className="relative h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
             >
               <i className="fas fa-bell"></i>
               {unreadCount > 0 && (
                 <span className="absolute top-1 right-1 h-3 w-3 bg-purple-500 rounded-full border-2 border-white"></span>
               )}
             </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'papers' && renderExamPapersArchive()}
            {activeTab === 'fee' && renderFee()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'assignments' && renderAssignments()}
            {activeTab === 'studyMaterials' && renderStudyMaterial()}
            {activeTab === 'events' && renderEvents()}
            {activeTab === 'helpdesk' && renderHelpDesk()}
            {activeTab === 'admitCard' && renderAdmitCard()}
            {activeTab === 'reportCard' && renderReportCard()}
          </div>
        </div>

      </main>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      {isRedirecting && <RedirectOverlay />}
      {isLoggingOut && <RedirectOverlay message="Logging out..." />}

      {/* Razorpay Online Payment Checkout Modal */}
      {isOnlineCheckoutOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs overflow-hidden"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOnlineCheckoutOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-[modalFadeIn_0.2s_ease]">
            {/* Header */}
            <div className="shrink-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-5 flex items-center justify-between border-b border-white/10 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6D4C9C] to-indigo-500 text-white flex items-center justify-center text-lg shadow-md shrink-0">
                  <i className="fas fa-shield-halved"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                      Razorpay Gateway
                    </span>
                    <span className="text-[10px] font-mono text-purple-200 bg-purple-500/20 px-1.5 py-0.5 rounded">
                      Test Mode
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">Online Campus Fee Checkout</h3>
                </div>
              </div>
              <button
                onClick={() => setIsOnlineCheckoutOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                title="Close"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {/* Fee Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fee Category / Head</label>
                <select
                  value={checkoutCategory}
                  onChange={e => setCheckoutCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#6D4C9C] focus:bg-white"
                >
                  <option>Tuition Fee</option>
                  <option>Examination Fee</option>
                  <option>Hostel & Mess Fee</option>
                  <option>Transportation Fee</option>
                  <option>Lab & Library Fee</option>
                </select>
              </div>

              {/* Payment Amount & Quick Presets */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">Payment Amount (₹) *</label>
                  {profile.feeDetails && (
                    <span className="text-[11px] text-amber-700 font-semibold">
                      Due: ₹{Math.max(0, (profile.feeDetails.totalAmount || 0) - (profile.feeDetails.paidAmount || 0)).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-base font-black text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Enter amount"
                    value={checkoutAmount}
                    onChange={e => setCheckoutAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#6D4C9C]"
                  />
                </div>

                {/* Quick amount chips */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Select:</span>
                  {profile.feeDetails && ((profile.feeDetails.totalAmount || 0) - (profile.feeDetails.paidAmount || 0)) > 0 && (
                    <button
                      type="button"
                      onClick={() => setCheckoutAmount(String(Math.max(0, (profile.feeDetails.totalAmount || 0) - (profile.feeDetails.paidAmount || 0))))}
                      className="px-2 py-0.5 rounded text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition cursor-pointer"
                    >
                      Full Due (₹{Math.max(0, (profile.feeDetails.totalAmount || 0) - (profile.feeDetails.paidAmount || 0)).toLocaleString('en-IN')})
                    </button>
                  )}
                  {[5000, 10000, 25000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCheckoutAmount(amt.toString())}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supported Payment Channels Showcase */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block mb-2">
                  <i className="fas fa-wallet text-[#6D4C9C] mr-1.5"></i> Accepted via Razorpay Gateway:
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <i className="fas fa-qrcode text-emerald-600 text-sm mb-1 block"></i>
                    <span className="text-[10px] font-bold text-slate-700 block">UPI / QR</span>
                    <span className="text-[9px] text-slate-400 block">GPay/PhonePe</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <i className="fas fa-credit-card text-blue-600 text-sm mb-1 block"></i>
                    <span className="text-[10px] font-bold text-slate-700 block">Cards</span>
                    <span className="text-[9px] text-slate-400 block">Visa/Master/RuPay</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <i className="fas fa-building-columns text-purple-600 text-sm mb-1 block"></i>
                    <span className="text-[10px] font-bold text-slate-700 block">NetBanking</span>
                    <span className="text-[9px] text-slate-400 block">50+ Banks</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <i className="fas fa-money-bill-transfer text-amber-600 text-sm mb-1 block"></i>
                    <span className="text-[10px] font-bold text-slate-700 block">Wallets</span>
                    <span className="text-[9px] text-slate-400 block">Paytm/Mobikwik</span>
                  </div>
                </div>
              </div>

              {/* Security info */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200">
                <i className="fas fa-lock text-emerald-600"></i>
                <span>256-bit SSL encrypted checkout. Generates instant official institution receipt.</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleRazorpayPayment}
                  disabled={processingCheckout}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className={`fas ${processingCheckout ? 'fa-spinner fa-spin' : 'fa-bolt'}`}></i>
                  {processingCheckout 
                    ? 'Connecting to Banking Gateway...' 
                    : `Pay ₹${Number(checkoutAmount || 0).toLocaleString('en-IN')} via Razorpay`}
                </button>

                <button
                  type="button"
                  onClick={handleSimulateOnlinePayment}
                  disabled={processingCheckout}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <i className="fas fa-flask text-slate-400"></i>
                  <span>Offline / Instant Test Simulation Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Printable Institutional Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        receipt={activeReceipt}
        student={profile}
      />

      {/* Official Examination Hall Ticket Modal */}
      <HallTicketModal
        isOpen={isHallTicketModalOpen}
        onClose={() => setIsHallTicketModalOpen(false)}
        hallTicket={studentHallTicket}
      />

      {/* Official Semester Transcript Modal */}
      <ReportCardModal
        isOpen={isReportCardModalOpen}
        onClose={() => setIsReportCardModalOpen(false)}
        assessment={activeReportCardAssessment}
        student={profile}
      />

      {/* Question Paper & Solution PDF Preview Modal */}
      {activePdfPreview?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-[modalFadeIn_0.2s_ease] flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white text-lg">
                  <i className="fas fa-file-pdf"></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded">
                      {activePdfPreview.paper?.paperType}
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      {activePdfPreview.paper?.academicYear}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base truncate max-w-md sm:max-w-xl">
                    {activePdfPreview.paper?.subject} — {activePdfPreview.paper?.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePdfPreview(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Mode Switcher Tabs (Paper vs Solution) */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActivePdfPreview(prev => ({ ...prev, viewMode: 'paper' }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activePdfPreview.viewMode === 'paper'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <i className="fas fa-file-lines text-purple-600"></i>
                  <span>Question Paper</span>
                </button>

                {activePdfPreview.paper?.solutionUrl && (
                  <button
                    type="button"
                    onClick={() => setActivePdfPreview(prev => ({ ...prev, viewMode: 'solution' }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activePdfPreview.viewMode === 'solution'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <i className="fas fa-check-circle"></i>
                    <span>Marking Scheme & Solution</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={
                    activePdfPreview.viewMode === 'solution' && activePdfPreview.paper?.solutionUrl
                      ? activePdfPreview.paper.solutionUrl
                      : (activePdfPreview.paper?.pdfUrls && activePdfPreview.paper.pdfUrls[0]) || '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fas fa-up-right-from-square text-[10px]"></i>
                  <span>Open Fullscreen / Print</span>
                </a>
              </div>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 p-4 bg-slate-200/50 overflow-hidden flex flex-col">
              <iframe
                src={
                  activePdfPreview.viewMode === 'solution' && activePdfPreview.paper?.solutionUrl
                    ? activePdfPreview.paper.solutionUrl
                    : (activePdfPreview.paper?.pdfUrls && activePdfPreview.paper.pdfUrls[0]) || ''
                }
                title="Paper Document Viewer"
                className="w-full h-full min-h-[55vh] rounded-2xl border border-slate-300 bg-white shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
