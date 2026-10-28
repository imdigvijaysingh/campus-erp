import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Route, Routes, Navigate } from 'react-router-dom'
import UnifiedLogin from './pages/UnifiedLogin'
import AdminLayout from './pages/admin/layout/AdminLayout'
import DashboardOverview from './pages/admin/DashboardOverview'
import CoursesHierarchyManager from './pages/admin/CoursesHierarchyManager'
import SubjectsManager from './pages/admin/SubjectsManager'
import StudentsManager from './pages/admin/StudentsManager'
import Users from './pages/admin/Users'
import TeacherAttendancePortal from './pages/admin/TeacherAttendancePortal'
import LibrarianPortal from './pages/admin/LibrarianPortal'
import FeeCashierPortal from './pages/admin/FeeCashierPortal'
import ExamControllerPortal from './pages/admin/ExamControllerPortal'
import AdmissionPortal from './pages/admin/AdmissionPortal'
import MyProfile from './pages/admin/MyProfile'
import HelpSupport from './pages/admin/HelpSupport'
import SessionExpiryModal from './components/common/SessionExpiryModal'

import StudentSignup from './pages/erp/StudentSignup'
import StudentDashboard from './pages/erp/StudentDashboard'
import ErpNotificationsManager from './pages/admin/ErpNotificationsManager'
import ErpAssignmentsManager from './pages/admin/ErpAssignmentsManager'
import ErpStudyMaterialsManager from './pages/admin/ErpStudyMaterialsManager'
import ErpAttendanceManager from './pages/admin/ErpAttendanceManager'
import StaffManager from './pages/admin/StaffManager'
import InventoryManager from './pages/admin/InventoryManager'
import HostelManager from './pages/admin/HostelManager'
import TransportManager from './pages/admin/TransportManager'
import HelpDeskManager from './pages/admin/HelpDeskManager'
import RoleManager from './pages/admin/RoleManager'
import CommandPalette from './components/common/CommandPalette'
import SocSecurityConsole from './pages/admin/SocSecurityConsole'
import AuditLogsViewer from './pages/admin/AuditLogsViewer'
import DeviceSessionsManager from './pages/admin/DeviceSessionsManager'
import PrivacyCenter from './pages/admin/PrivacyCenter'
import SafetyCenter from './pages/admin/SafetyCenter'
import PublicSafetyPortal from './pages/public/PublicSafetyPortal'
import PublicPrivacyPortal from './pages/public/PublicPrivacyPortal'
import CampusTreasuryAccounts from './pages/admin/CampusTreasuryAccounts'
import EarlyWarningEngine from './pages/admin/EarlyWarningEngine'

const RoleRoute = ({ requiredPermission, children }) => {
  const adminRole = localStorage.getItem('adminRole');
  const permissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');
  
  const hasAccess = 
    adminRole === 'SuperAdmin' || 
    adminRole === 'Admin' || 
    Boolean(permissions?.all?.read) || 
    (!requiredPermission || Boolean(permissions?.[requiredPermission]?.read));

  if (!hasAccess) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

const App = () => {
  return (
    <div>
      <Toaster position="top-right" />
      <SessionExpiryModal />
      <CommandPalette />
      <Routes>
        {/* Root redirect */}
        <Route path='/' element={<Navigate to="/authentication/index" replace />} />
        
        {/* Unified Login Route & /login alias */}
        <Route path='/authentication/index' element={<UnifiedLogin />} />
        <Route path='/login' element={<Navigate to="/authentication/index" replace />} />

        {/* Public Statutory Compliance Portals (Accessible without login) */}
        <Route path='/safety' element={<PublicSafetyPortal />} />
        <Route path='/privacy' element={<PublicPrivacyPortal />} />

        {/* ERP Routes without MainLayout */}
        <Route path='/erp/signup' element={<StudentSignup />} />
        <Route path='/erp/dashboard' element={<StudentDashboard />} />
        
        {/* Admin CMS Layout Routes */}
        <Route path='/admin' element={<AdminLayout />}>
          <Route path='dashboard' element={<DashboardOverview />} />
          <Route path='early-warning' element={<RoleRoute requiredPermission="students"><EarlyWarningEngine /></RoleRoute>} />
          <Route path='soc-security' element={<SocSecurityConsole />} />
          <Route path='audit-logs' element={<AuditLogsViewer />} />
          <Route path='sessions' element={<DeviceSessionsManager />} />
          <Route path='privacy' element={<PrivacyCenter />} />
          <Route path='safety' element={<SafetyCenter />} />
          <Route path='courses' element={<RoleRoute requiredPermission="courses"><CoursesHierarchyManager /></RoleRoute>} />
          <Route path='subjects' element={<RoleRoute requiredPermission="courses"><SubjectsManager /></RoleRoute>} />
          <Route path='students' element={<RoleRoute requiredPermission="students"><StudentsManager /></RoleRoute>} />
          <Route path='teacher-portal' element={<RoleRoute requiredPermission="teacher-portal"><TeacherAttendancePortal /></RoleRoute>} />
          <Route path='librarian-portal' element={<RoleRoute requiredPermission="librarian-portal"><LibrarianPortal /></RoleRoute>} />
          <Route path='fee-portal' element={<RoleRoute requiredPermission="fee-portal"><FeeCashierPortal /></RoleRoute>} />
          <Route path='treasury' element={<CampusTreasuryAccounts />} />
          <Route path='finance-accounts' element={<CampusTreasuryAccounts />} />
          <Route path='exam-controller' element={<RoleRoute requiredPermission="exam-controller"><ExamControllerPortal /></RoleRoute>} />
          <Route path='admission-portal' element={<RoleRoute requiredPermission="admission-portal"><AdmissionPortal /></RoleRoute>} />
          <Route path='erp-notifications' element={<RoleRoute requiredPermission="erp-notifications"><ErpNotificationsManager /></RoleRoute>} />
          <Route path='erp-assignments' element={<RoleRoute requiredPermission="erp-assignments"><ErpAssignmentsManager /></RoleRoute>} />
          <Route path='erp-study-materials' element={<RoleRoute requiredPermission="erp-study-materials"><ErpStudyMaterialsManager /></RoleRoute>} />
          <Route path='erp-attendance' element={<RoleRoute requiredPermission="erp-attendance"><ErpAttendanceManager /></RoleRoute>} />
          <Route path='staff' element={<RoleRoute requiredPermission="staff"><StaffManager /></RoleRoute>} />
          <Route path='inventory' element={<RoleRoute requiredPermission="inventory"><InventoryManager /></RoleRoute>} />
          <Route path='hostel' element={<RoleRoute requiredPermission="hostel"><HostelManager /></RoleRoute>} />
          <Route path='transport' element={<RoleRoute requiredPermission="transport"><TransportManager /></RoleRoute>} />
          <Route path='users' element={<RoleRoute requiredPermission="users"><Users /></RoleRoute>} />
          <Route path='roles' element={<RoleRoute requiredPermission="roles"><RoleManager /></RoleRoute>} />
          <Route path='helpdesk' element={<RoleRoute requiredPermission="helpdesk"><HelpDeskManager /></RoleRoute>} />
          <Route path='profile' element={<MyProfile />} />
          <Route path='help' element={<HelpSupport />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App