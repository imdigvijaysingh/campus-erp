import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import Breadcrumbs from '../../../components/common/Breadcrumbs';
import Toast from '../../../components/common/Toast';
import GlobalLoader from '../../../components/common/GlobalLoader';
import ConfirmModal from '../../../components/common/ConfirmModal';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [toast, setToast] = useState(null);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

  useEffect(() => {
    if (location.state?.toastMessage) {
      setToast({ message: location.state.toastMessage, type: location.state.toastType || 'success' });
      const newState = { ...location.state };
      delete newState.toastMessage;
      delete newState.toastType;
      navigate(location.pathname, { replace: true, state: newState });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
      navigate('/authentication/index');
    }
  }, [navigate]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => setToast(null);

  const showLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setIsGlobalLoading(true);
  };

  const hideLoading = () => {
    setIsGlobalLoading(false);
  };

  const showConfirm = (message, onConfirm, options = {}) => {
    setConfirmDialog({
      isOpen: true,
      message,
      onConfirm,
      title: options.title || 'Confirm Action',
      confirmText: options.confirmText || 'Confirm',
      confirmType: options.confirmType || 'danger'
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    setConfirmDialog({ isOpen: false });
  };

  const handleCancelConfirm = () => {
    setConfirmDialog({ isOpen: false });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-slate-800 relative selection:bg-purple-500 selection:text-white">
      {/* Ambient Radial Lights (Never boring, creates luxury backdrop for glass cards) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-purple-400/10 to-indigo-500/10 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[5%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-pink-400/8 to-purple-400/8 blur-3xl"></div>
        <div className="absolute top-[35%] right-[25%] w-[450px] h-[450px] rounded-full bg-indigo-300/5 blur-3xl"></div>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={toggleCollapse}
      />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        <TopNavbar 
          toggleSidebar={toggleSidebar} 
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={toggleCollapse}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto w-full">
            {/* Universal Breadcrumbs & Mobile/Tablet Back Navigation */}
            <Breadcrumbs />

            {/* Outlet context passes the showToast function to all child routes */}
            <Outlet context={{ showToast, showLoading, hideLoading, showConfirm }} />
          </div>
        </main>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
      
      {isGlobalLoading && <GlobalLoader message={loadingMessage} />}

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        confirmType={confirmDialog.confirmType}
        onConfirm={handleConfirm}
        onClose={handleCancelConfirm}
      />
    </div>
  );
};

export default AdminLayout;
