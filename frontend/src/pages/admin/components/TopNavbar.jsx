import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RedirectOverlay from '../../../components/common/RedirectOverlay';
import shyvoraLogo from '../../../assets/images/shyvora_s_logo.png';

const TopNavbar = ({ toggleSidebar, isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const adminUsername = localStorage.getItem('adminUsername') || 'instadmin';
  const adminRole = localStorage.getItem('adminRole') || 'Campus Administrator';

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('cms_token');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('userPermissions');
      navigate('/authentication/index', { state: { toastMessage: 'Logged out successfully', toastType: 'success' } });
      setIsLoading(false);
    }, 1200);
  };

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 768) {
      if (toggleCollapse) toggleCollapse();
    } else {
      if (toggleSidebar) toggleSidebar();
    }
  };

  // Live notification items
  const notificationsList = [
    {
      id: 1,
      type: 'attendance',
      icon: 'fa-clipboard-user',
      color: 'bg-red-50 text-red-600 border-red-200',
      title: '3 Students Below 75% Attendance',
      desc: 'Semester hall ticket gate requires advisory review.',
      time: '10m ago',
      link: '/admin/erp-attendance'
    },
    {
      id: 2,
      type: 'fee',
      icon: 'fa-indian-rupee-sign',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      title: '₹3.8L Pending Term Fees',
      desc: '8 student accounts ready for cashier clearance.',
      time: '45m ago',
      link: '/admin/fee-portal'
    },
    {
      id: 3,
      type: 'security',
      icon: 'fa-shield-halved',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'Daily Data Protection Scan Passed',
      desc: 'All student records 100% encrypted and backed up.',
      time: '2h ago',
      link: '/admin/soc-security'
    }
  ];

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-[1000] transition-all">
      {/* Left: Sidebar Toggle + Campus Info */}
      <div className="flex items-center gap-3">
        {/* Sleek Ghost Sidebar Toggle */}
        <button 
          onClick={handleSidebarToggle}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <i className={`fas ${isCollapsed ? 'fa-bars-staggered' : 'fa-bars'} text-sm`}></i>
        </button>

        {/* Subtle, Borderless Campus Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center p-0.5 border border-purple-100/80">
            <img src={shyvoraLogo} alt="Shyvora" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800 tracking-tight">
              Central University
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              AY 2026-27
            </span>
          </div>
        </div>
      </div>

      {/* Center: Clean Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          type="button" 
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="w-full flex items-center justify-between bg-slate-50 hover:bg-white hover:border-slate-300 border border-slate-200/90 rounded-xl px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-600 transition-all cursor-pointer shadow-2xs group"
        >
          <div className="flex items-center gap-2.5 text-slate-500 group-hover:text-slate-700">
            <i className="fas fa-magnifying-glass text-slate-400 group-hover:text-[#6D4C9C] text-xs transition-colors"></i>
            <span className="font-normal">Search students, attendance, fee ledger...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white border border-slate-200 rounded text-slate-400 shadow-2xs group-hover:border-slate-300 group-hover:text-slate-600">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Actions + User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile Search Icon */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Search (Ctrl+K)"
        >
          <i className="fas fa-magnifying-glass text-sm"></i>
        </button>

        {/* Help & Playbooks (Ghost Icon) */}
        <Link
          to="/admin/help"
          title="Playbooks & FAQs"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <i className="far fa-circle-question text-base"></i>
        </Link>

        {/* Notifications Bell */}
        <div className="relative">
          <button 
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            title="Notifications"
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <i className="far fa-bell text-base"></i>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-[1010]" onClick={() => setNotificationsOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 z-[1020] animate-[modalFadeIn_0.15s_ease-out]">
                <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Campus Notifications</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                    3 New
                  </span>
                </div>

                <div className="space-y-1.5 max-h-80 overflow-y-auto">
                  {notificationsList.map((item) => (
                    <Link
                      key={item.id}
                      to={item.link}
                      onClick={() => setNotificationsOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-start gap-3 transition-colors block group"
                    >
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs shrink-0 mt-0.5 ${item.color}`}>
                        <i className={`fas ${item.icon}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-slate-900 group-hover:text-[#6D4C9C] transition-colors truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button 
                    onClick={() => setNotificationsOpen(false)} 
                    className="text-slate-400 hover:text-slate-700 font-medium cursor-pointer"
                  >
                    Dismiss all
                  </button>
                  <Link 
                    to="/admin/audit-logs" 
                    onClick={() => setNotificationsOpen(false)} 
                    className="text-[#6D4C9C] hover:text-purple-800 font-medium"
                  >
                    View audit logs →
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6D4C9C] to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {adminUsername.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>

            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 leading-tight">
                {adminUsername}
              </span>
              <span className="text-[10px] text-purple-600 font-medium leading-tight">
                {adminRole}
              </span>
            </div>

            <i className={`fas fa-chevron-down text-[10px] text-slate-400 group-hover:text-slate-600 transition-transform ml-0.5 ${profileOpen ? 'rotate-180' : ''}`}></i>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-[1010]" onClick={() => setProfileOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-[1020] animate-[modalFadeIn_0.15s_ease-out]">
                {/* Account Header */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#6D4C9C] to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                      {adminUsername.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {adminUsername}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {localStorage.getItem('adminEmail') || (adminRole === 'SuperAdmin' ? 'admin@shyvora.in' : `${adminUsername}@campus.edu`)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Session Active
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold">
                      {adminRole}
                    </span>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-0.5">
                  <Link 
                    to="/admin/profile" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <i className="fas fa-user-gear text-slate-400 w-4 text-center"></i>
                    <span>Profile Settings</span>
                  </Link>

                  <Link 
                    to="/admin/soc-security" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <i className="fas fa-shield-halved text-slate-400 w-4 text-center"></i>
                      <span>Security & Active Sessions</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Safe
                    </span>
                  </Link>

                  <Link 
                    to="/admin/help" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <i className="fas fa-book-open-reader text-slate-400 w-4 text-center"></i>
                      <span>Playbooks & Guides</span>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      6 Guides
                    </span>
                  </Link>

                  <Link 
                    to="/admin/privacy" 
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <i className="fas fa-scale-balanced text-slate-400 w-4 text-center"></i>
                    <span>Privacy & Consents</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 my-1.5"></div>

                {/* Sign Out */}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <i className="fas fa-arrow-right-from-bracket w-4 text-center"></i>
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {isLoading && <RedirectOverlay message="Signing out safely..." />}
    </header>
  );
};

export default TopNavbar;
