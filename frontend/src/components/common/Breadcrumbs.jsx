import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

/**
 * Route Dictionary mapping route paths to their human-friendly page titles,
 * parent sections, and theme icons.
 */
const ROUTE_CONFIG = {
  // Overview
  '/admin/dashboard': { title: 'Dashboard', section: 'Overview', icon: 'fa-table-columns' },
  '/admin/early-warning': { title: 'AI Early Warning & Outcome Radar', section: 'Overview', icon: 'fa-brain' },
  '/admin/soc-security': { title: 'Security & SOC Console', section: 'Overview', icon: 'fa-shield-halved' },
  '/admin/audit-logs': { title: 'SOC Audit Trail & System Logs', section: 'Overview', icon: 'fa-list-check' },

  // Academics
  '/admin/courses': { title: 'Courses & Programs Hierarchy', section: 'Academics', icon: 'fa-book-bookmark' },
  '/admin/subjects': { title: 'Subjects & Curriculum Directory', section: 'Academics', icon: 'fa-book-open-reader' },
  '/admin/students': { title: 'Students Directory & APAAR Registry', section: 'Academics', icon: 'fa-user-graduate' },
  '/admin/erp-attendance': { title: 'Daily Biometric & Roll Call Attendance', section: 'Academics', icon: 'fa-clipboard-user' },
  '/admin/teacher-portal': { title: 'Teacher Attendance Roll Call', section: 'Academics', icon: 'fa-chalkboard-user' },
  '/admin/exam-controller': { title: 'Exam Controller & OBE Questions', section: 'Academics', icon: 'fa-award' },
  '/admin/erp-assignments': { title: 'Assignments Management', section: 'Academics', icon: 'fa-tasks' },
  '/admin/erp-study-materials': { title: 'Study Materials & Courseware', section: 'Academics', icon: 'fa-book-open' },
  '/admin/erp-notifications': { title: 'Campus Announcements & Notices', section: 'Academics', icon: 'fa-bell' },

  // People & HR
  '/admin/staff': { title: 'Faculty & Staff Roster', section: 'People & HR', icon: 'fa-users-gear' },
  '/admin/sessions': { title: 'Active Device Sessions', section: 'People & HR', icon: 'fa-laptop-code' },

  // Campus Operations
  '/admin/admission-portal': { title: 'Admissions & Inquiry CRM', section: 'Campus Operations', icon: 'fa-user-plus' },
  '/admin/fee-portal': { title: 'Fee & Cashier Portal', section: 'Campus Operations', icon: 'fa-indian-rupee-sign' },
  '/admin/treasury': { title: 'Campus Treasury & Financial Accounts', section: 'Campus Operations', icon: 'fa-vault' },
  '/admin/finance-accounts': { title: 'Campus Treasury & Financial Accounts', section: 'Campus Operations', icon: 'fa-vault' },
  '/admin/librarian-portal': { title: 'Library Management System', section: 'Campus Operations', icon: 'fa-book' },
  '/admin/inventory': { title: 'Campus Assets & Inventory', section: 'Campus Operations', icon: 'fa-boxes-stacked' },
  '/admin/hostel': { title: 'Hostel & Residential Facilities', section: 'Campus Operations', icon: 'fa-building' },
  '/admin/transport': { title: 'Transport & Fleet Management', section: 'Campus Operations', icon: 'fa-bus' },

  // Safety & Compliance
  '/admin/privacy': { title: 'Privacy Center (DPDP Compliance)', section: 'Safety & Compliance', icon: 'fa-scale-balanced' },
  '/admin/safety': { title: 'Campus Safety & Anti-Ragging', section: 'Safety & Compliance', icon: 'fa-hand-holding-heart' },
  '/admin/helpdesk': { title: 'Help Desk Grievance Tickets', section: 'Safety & Compliance', icon: 'fa-headset' },

  // Administration
  '/admin/roles': { title: 'Role Permissions & Access Control', section: 'Administration', icon: 'fa-lock' },
  '/admin/users': { title: 'User Management', section: 'Administration', icon: 'fa-users' },
  '/admin/profile': { title: 'My Administrator Profile', section: 'Administration', icon: 'fa-user' },
  '/admin/help': { title: 'Admin Playbooks & Help Support', section: 'Administration', icon: 'fa-circle-question' },
};

/**
 * Universal Breadcrumbs & Back Navigation Component
 * Provides clean back button and full breadcrumb path on desktop, tablet, and mobile.
 */
const Breadcrumbs = ({ customTitle = null, customSection = null }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.replace(/\/$/, '');

  // Hide on root dashboard since it is the root home
  if (currentPath === '/admin/dashboard' || currentPath === '/admin') {
    return null;
  }

  // Lookup route metadata or auto-generate
  const routeMeta = ROUTE_CONFIG[currentPath] || {
    title: customTitle || currentPath.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    section: customSection || 'Portal',
    icon: 'fa-folder'
  };

  const pageTitle = customTitle || routeMeta.title;
  const sectionName = customSection || routeMeta.section;

  // Smart back navigation (checks history or falls back to dashboard)
  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <nav 
      aria-label="Breadcrumb navigation"
      className="bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xs mb-4 flex items-center justify-between gap-2.5 text-xs select-none animate-[modalFadeIn_0.15s_ease-out]"
    >
      {/* Left: Back Button + Breadcrumb Trail */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 overflow-x-auto no-scrollbar py-0.5">
        
        {/* Responsive Touch-Friendly Back Button */}
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 active:bg-purple-100 text-slate-700 hover:text-[#6D4C9C] border border-slate-200/90 hover:border-purple-300 shadow-2xs text-xs font-bold transition-all cursor-pointer group shrink-0 active:scale-95"
          title="Go back to previous page"
        >
          <i className="fas fa-arrow-left text-[11px] text-[#6D4C9C] group-hover:-translate-x-0.5 transition-transform"></i>
          <span className="font-semibold">Back</span>
        </button>

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-slate-200/90 shrink-0"></div>

        {/* Trail Items */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs min-w-0">
          
          {/* Home / Dashboard Link */}
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#6D4C9C] font-semibold transition-colors shrink-0 group py-1"
            title="Return to Main Dashboard"
          >
            <i className="fas fa-house text-[11px] text-slate-400 group-hover:text-[#6D4C9C] transition-colors"></i>
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Chevron Separator */}
          <i className="fas fa-chevron-right text-[9px] text-slate-300 shrink-0"></i>

          {/* Section Category (Tablet & Desktop) */}
          {sectionName && (
            <>
              <span className="text-slate-400 font-medium shrink-0 hidden md:inline">
                {sectionName}
              </span>
              <i className="fas fa-chevron-right text-[9px] text-slate-300 shrink-0 hidden md:inline"></i>
            </>
          )}

          {/* Current Active Page Pill */}
          <div className="flex items-center gap-1.5 min-w-0 shrink truncate">
            <span className="font-bold text-[#6D4C9C] bg-purple-50 border border-purple-200/70 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              <i className={`fas ${routeMeta.icon} text-[10px] mr-1.5 text-[#6D4C9C] hidden xs:inline`}></i>
              {pageTitle}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Action Pill (Tablet & Desktop) */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <Link
          to="/admin/dashboard"
          className="text-[11px] font-semibold text-slate-500 hover:text-[#6D4C9C] flex items-center gap-1 hover:bg-slate-100/70 px-2.5 py-1 rounded-lg transition-colors"
          title="Return to Dashboard Overview"
        >
          <i className="fas fa-table-columns text-[10px]"></i>
          <span className="hidden md:inline">Dashboard</span>
        </Link>
      </div>
    </nav>
  );
};

export default Breadcrumbs;

