import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import RedirectOverlay from '../../../components/common/RedirectOverlay';
import shyvoraLogo from '../../../assets/images/shyvora_s_logo.png';
import InfoTooltip from '../../../components/common/InfoTooltip';

const Sidebar = ({ isOpen, toggleSidebar, isCollapsed, toggleCollapse }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('userPermissions');
      navigate('/authentication/index', { state: { toastMessage: 'Logged out successfully', toastType: 'success' } });
    }, 1200);
  };

  const adminRole = localStorage.getItem('adminRole') || 'SuperAdmin';
  const permissions = JSON.parse(localStorage.getItem('userPermissions') || '{}');

  const navSections = [
    {
      id: 'overview',
      title: 'Overview',
      badgeColor: 'bg-purple-100 text-[#6D4C9C]',
      icon: 'fa-chart-pie',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: 'fa-table-columns', permission: 'dashboard' },
        { name: 'AI Early Warning', path: '/admin/early-warning', icon: 'fa-brain', permission: 'students' },
        { name: 'Security & SOC', path: '/admin/soc-security', icon: 'fa-shield-halved', permission: 'soc-security' },
        { name: 'Audit Trail', path: '/admin/audit-logs', icon: 'fa-list-check', permission: 'audit-logs' },
      ]
    },
    {
      id: 'academics',
      title: 'Academics',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      icon: 'fa-graduation-cap',
      items: [
        { name: 'Courses & Programs', path: '/admin/courses', icon: 'fa-book-bookmark', permission: 'courses' },
        { name: 'Subjects & Curriculum', path: '/admin/subjects', icon: 'fa-book-open-reader', permission: 'courses' },
        { name: 'Students Directory', path: '/admin/students', icon: 'fa-user-graduate', permission: 'students' },
        { name: 'Daily Attendance', path: '/admin/erp-attendance', icon: 'fa-clipboard-user', permission: 'erp-attendance' },
        { name: 'Teacher Roll Call', path: '/admin/teacher-portal', icon: 'fa-chalkboard-user', permission: 'teacher-portal' },
        { name: 'Exam & OBE Controller', path: '/admin/exam-controller', icon: 'fa-award', permission: 'exam-controller' },
        { name: 'Assignments', path: '/admin/erp-assignments', icon: 'fa-tasks', permission: 'erp-assignments' },
        { name: 'Study Materials', path: '/admin/erp-study-materials', icon: 'fa-book-open', permission: 'erp-study-materials' },
        { name: 'Announcements', path: '/admin/erp-notifications', icon: 'fa-bell', permission: 'erp-notifications' },
      ]
    },
    {
      id: 'people',
      title: 'People & HR',
      badgeColor: 'bg-sky-100 text-sky-700',
      icon: 'fa-users',
      items: [
        { name: 'Staff & Payroll', path: '/admin/staff', icon: 'fa-users-gear', permission: 'staff' },
        { name: 'Active Sessions', path: '/admin/sessions', icon: 'fa-laptop-code', permission: 'sessions' },
      ]
    },
    {
      id: 'campus',
      title: 'Campus Operations',
      badgeColor: 'bg-amber-100 text-amber-700',
      icon: 'fa-building-columns',
      items: [
        { name: 'Admissions CRM', path: '/admin/admission-portal', icon: 'fa-user-plus', permission: 'admission-portal' },
        { name: 'Fee & Cashier', path: '/admin/fee-portal', icon: 'fa-indian-rupee-sign', permission: 'fee-portal' },
        { name: 'Treasury & Accounts', path: '/admin/treasury', icon: 'fa-vault', permission: 'fee-portal' },
        { name: 'Library Portal', path: '/admin/librarian-portal', icon: 'fa-book', permission: 'librarian-portal' },
        { name: 'Inventory & Assets', path: '/admin/inventory', icon: 'fa-boxes-stacked', permission: 'inventory' },
        { name: 'Hostel Management', path: '/admin/hostel', icon: 'fa-building', permission: 'hostel' },
        { name: 'Transport & Fleet', path: '/admin/transport', icon: 'fa-bus', permission: 'transport' },
      ]
    },
    {
      id: 'compliance',
      title: 'Safety & Compliance',
      badgeColor: 'bg-rose-100 text-rose-700',
      icon: 'fa-user-shield',
      items: [
        { name: 'Privacy Center (DPDP)', path: '/admin/privacy', icon: 'fa-scale-balanced', permission: 'privacy' },
        { name: 'Safety & Welfare (UGC)', path: '/admin/safety', icon: 'fa-hand-holding-heart', permission: 'safety' },
        { name: 'Help Desk Tickets', path: '/admin/helpdesk', icon: 'fa-headset', permission: 'helpdesk' },
      ]
    },
    {
      id: 'administration',
      title: 'Administration',
      badgeColor: 'bg-purple-100 text-purple-700',
      icon: 'fa-gear',
      items: [
        { name: 'Role Permissions', path: '/admin/roles', icon: 'fa-lock', permission: 'roles' },
        { name: 'System Users', path: '/admin/users', icon: 'fa-users', permission: 'users' },
        { name: 'My Profile', path: '/admin/profile', icon: 'fa-user', permission: 'profile' },
        { name: 'Help & Playbooks', path: '/admin/help', icon: 'fa-book-open-reader', permission: 'help' },
      ]
    }
  ];

  const hasPermission = (itemPermission) => {
    if (!itemPermission || itemPermission === 'dashboard') return true;
    if (adminRole === 'SuperAdmin' || adminRole === 'Admin') return true;
    if (permissions?.all?.read) return true;
    return Boolean(permissions?.[itemPermission]?.read);
  };

  const filteredSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => hasPermission(item.permission))
    }))
    .filter(section => section.items.length > 0);

  // Single active accordion ID
  const [activeAccordion, setActiveAccordion] = useState(() => {
    for (const sec of navSections) {
      if (sec.items.some(item => location.pathname === item.path)) {
        return sec.id;
      }
    }
    return 'overview';
  });

  // Automatically switch open accordion to match current route
  useEffect(() => {
    for (const sec of filteredSections) {
      if (sec.items.some(item => location.pathname === item.path)) {
        setActiveAccordion(sec.id);
        break;
      }
    }
  }, [location.pathname]);

  const toggleAccordion = (sectionId) => {
    setActiveAccordion(prev => prev === sectionId ? null : sectionId);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-[2000] md:hidden transition-opacity backdrop-blur-xs"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container - Width increased to w-72 for breathable comfort */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen bg-white/95 backdrop-blur-md border-r border-slate-200/80 z-[2010] flex flex-col transition-all duration-300 ease-in-out shadow-lg shadow-slate-200/50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-72'} w-72`}
      >
        {/* Brand Header */}
        <div className={`h-18 flex items-center border-b border-slate-100 flex-shrink-0 ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
        }`}>
          {isCollapsed ? (
            <button 
              onClick={toggleCollapse}
              title="Expand sidebar"
              className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              <img src={shyvoraLogo} alt="Shyvora ERP Logo" className="w-full h-full object-contain" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 p-1.5 flex items-center justify-center shadow-md shadow-purple-500/10 shrink-0">
                  <img src={shyvoraLogo} alt="Shyvora ERP Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-base font-black text-slate-900 tracking-tight block leading-tight">Shyvora ERP</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-purple-700 bg-purple-50 font-bold uppercase tracking-wider px-1.5 py-0.2 rounded">
                      Campus OS
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={toggleCollapse} 
                  title="Collapse sidebar"
                  className="hidden md:flex text-slate-400 hover:text-slate-700 w-8 h-8 items-center justify-center rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>
                <button className="md:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100" onClick={toggleSidebar}>
                  <i className="fas fa-times text-base"></i>
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Navigation List */}
        <div className={`flex-1 py-4 px-3 ${
          isCollapsed 
            ? 'overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden' 
            : 'overflow-y-auto style-scrollbar'
        }`}>
          {isCollapsed ? (
            /* Mini-Rail Mode (Desktop Collapsed) */
            <div className="flex flex-col items-center space-y-3">
              {filteredSections.map((section) => (
                <div key={section.id} className="w-full flex flex-col items-center gap-2 py-2 border-b border-slate-100 last:border-0">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        title={`${section.title}: ${item.name}`}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                          isActive 
                            ? 'bg-gradient-to-br from-[#6D4C9C] to-indigo-600 text-white shadow-md shadow-purple-500/30 font-bold scale-105' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <i className={`fas ${item.icon} text-base`}></i>
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            /* Expanded Mode: Large, comfortable, colorful category cards */
            <div className="space-y-2">
              {filteredSections.map((section) => {
                const isOpenSection = activeAccordion === section.id;
                const hasActiveChild = section.items.some(item => location.pathname === item.path);

                return (
                  <div key={section.id} className="rounded-2xl overflow-hidden transition-all duration-200">
                    {/* Category Header */}
                    <button
                      type="button"
                      onClick={() => toggleAccordion(section.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-bold rounded-2xl transition-all cursor-pointer ${
                        hasActiveChild || isOpenSection
                          ? 'text-slate-900 bg-slate-100/80 font-black' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shadow-2xs ${section.badgeColor}`}>
                          <i className={`fas ${section.icon}`}></i>
                        </div>
                        <span className="tracking-tight text-sm">{section.title}</span>
                      </div>
                      <i className={`fas fa-chevron-down text-xs text-slate-400 transition-transform duration-200 ${isOpenSection ? 'rotate-180 text-purple-600' : ''}`}></i>
                    </button>

                    {/* Submenu Links - Comfortable 14px size with generous padding */}
                    {isOpenSection && (
                      <nav className="mt-1 pl-2 pr-1 py-1 space-y-1">
                        {section.items.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) => 
                              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                isActive 
                                  ? 'bg-gradient-to-r from-[#6D4C9C] to-indigo-600 text-white shadow-md shadow-purple-500/25 font-bold translate-x-1' 
                                  : 'text-slate-600 hover:bg-purple-50/70 hover:text-[#6D4C9C]'
                              }`
                            }
                            onClick={() => {
                              if (window.innerWidth < 768) {
                                toggleSidebar();
                              }
                            }}
                          >
                            <i className={`fas ${item.icon} w-5 text-center text-sm ${location.pathname === item.path ? 'text-white' : 'text-slate-400'}`}></i>
                            <span className="truncate">{item.name}</span>
                          </NavLink>
                        ))}
                      </nav>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Quick Playbooks & Sign Out */}
        <div className={`p-4 border-t border-slate-100 flex-shrink-0 flex flex-col gap-2.5 bg-slate-50/60 ${
          isCollapsed ? 'items-center p-2' : ''
        }`}>
          {!isCollapsed && (
            <Link
              to="/admin/help"
              className="p-2.5 rounded-xl bg-purple-100/70 hover:bg-purple-100 text-[#6D4C9C] font-bold text-xs flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2">
                <i className="fas fa-book-open-reader text-sm"></i>
                <span>Admin Playbooks & FAQs</span>
              </div>
              <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
            </Link>
          )}

          {!isCollapsed && (
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Campus Data Protected</span>
                <InfoTooltip
                  title="What is Campus Data Protected?"
                  text="It means all your school's student files, fee records, and teacher data are completely private and isolated. No other school or organization can see your records."
                  tip="Your school has its own private data vault."
                />
              </span>
              <span className="font-mono text-slate-400 text-[10px]">v2.4</span>
            </div>
          )}

          <button 
            onClick={handleLogout}
            title="Sign Out"
            className={`flex items-center gap-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer ${
              isCollapsed ? 'w-11 h-11 justify-center p-0' : 'px-3.5 py-2.5 w-full text-left'
            }`}
          >
            <i className="fas fa-arrow-right-from-bracket text-sm text-slate-400 group-hover:text-red-600"></i>
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
      
      {isLoggingOut && <RedirectOverlay message="Signing out safely..." />}
    </>
  );
};

export default Sidebar;
