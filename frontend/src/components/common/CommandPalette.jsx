import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const commands = [
    // Direct Navigation
    { name: 'Dashboard Overview', category: 'Navigation', icon: 'fa-table-columns', path: '/admin/dashboard', shortcut: 'G D' },
    { name: 'AI Early Warning Risk Engine', category: 'AI & Outcomes', icon: 'fa-brain', path: '/admin/early-warning', badge: 'AI Engine', shortcut: 'G E' },
    { name: 'Public Safety & Grievance Portal', category: 'Public', icon: 'fa-hand-holding-heart', path: '/safety', badge: 'Public' },
    { name: 'Public Privacy & DPDP Rights Portal', category: 'Public', icon: 'fa-scale-balanced', path: '/privacy', badge: 'Public' },
    { name: 'Security & SOC Console', category: 'Security', icon: 'fa-shield-halved', path: '/admin/soc-security', badge: 'CERT-In' },
    { name: 'Audit Trail Logs', category: 'Security', icon: 'fa-list-check', path: '/admin/audit-logs' },
    { name: 'Active Login Sessions', category: 'Security', icon: 'fa-laptop-code', path: '/admin/sessions' },
    { name: 'Privacy Center (DPDP)', category: 'Compliance', icon: 'fa-scale-balanced', path: '/admin/privacy', badge: 'DPDP' },
    { name: 'Safety & Welfare Center', category: 'Compliance', icon: 'fa-hand-holding-heart', path: '/admin/safety', badge: 'UGC' },
    { name: 'Students Directory', category: 'Academics', icon: 'fa-user-graduate', path: '/admin/students' },
    { name: 'Courses & Programs', category: 'Academics', icon: 'fa-book-bookmark', path: '/admin/courses' },
    { name: 'Daily Student Attendance', category: 'Academics', icon: 'fa-clipboard-user', path: '/admin/erp-attendance' },
    { name: 'Assignments Manager', category: 'Academics', icon: 'fa-tasks', path: '/admin/erp-assignments' },
    { name: 'Study Materials', category: 'Academics', icon: 'fa-book-open', path: '/admin/erp-study-materials' },
    { name: 'Staff & HR Payroll', category: 'People', icon: 'fa-users-gear', path: '/admin/staff' },
    { name: 'Admissions CRM Portal', category: 'Campus', icon: 'fa-user-plus', path: '/admin/admission-portal' },
    { name: 'Fee & Cashier Portal', category: 'Campus', icon: 'fa-indian-rupee-sign', path: '/admin/fee-portal' },
    { name: 'Campus Treasury & Bank Accounts', category: 'Finance', icon: 'fa-vault', path: '/admin/treasury', badge: 'Treasury' },
    { name: 'Library Management', category: 'Campus', icon: 'fa-book', path: '/admin/librarian-portal' },
    { name: 'Inventory & Assets', category: 'Campus', icon: 'fa-boxes-stacked', path: '/admin/inventory' },
    { name: 'Hostel Management', category: 'Campus', icon: 'fa-building', path: '/admin/hostel' },
    { name: 'Transport & Fleet', category: 'Campus', icon: 'fa-bus', path: '/admin/transport' },
    { name: 'Role Permissions (RBAC)', category: 'Admin', icon: 'fa-lock', path: '/admin/roles' },
    { name: 'System User Accounts', category: 'Admin', icon: 'fa-users', path: '/admin/users' },
    { name: 'Help Desk Tickets', category: 'Support', icon: 'fa-headset', path: '/admin/helpdesk' },
    { name: 'My Profile & Credentials', category: 'Account', icon: 'fa-user', path: '/admin/profile' },
  ];

  // Filter commands by query
  const filteredCommands = query.trim() === ''
    ? commands.slice(0, 8)
    : commands.filter(cmd => 
        cmd.name.toLowerCase().includes(query.toLowerCase()) || 
        cmd.category.toLowerCase().includes(query.toLowerCase())
      );

  // Global key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (cmd) => {
    setIsOpen(false);
    navigate(cmd.path);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.15s_ease]">
      <div 
        className="fixed inset-0" 
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 animate-[modalFadeIn_0.2s_ease]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-gray-100 bg-white">
          <i className="fas fa-magnifying-glass text-gray-400 text-base mr-3"></i>
          <input
            ref={inputRef}
            type="text"
            className="w-full py-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
            placeholder="Search Shyvora ERP... (Type 'students', 'audit', 'fees', 'dpdp')"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
          />
          <kbd className="hidden sm:inline-block text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded border border-gray-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 style-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              <i className="fas fa-search-minus text-2xl mb-2 opacity-50 block"></i>
              No commands or pages matching "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {query ? 'Search Results' : 'Suggested Fast Actions'}
              </div>
              {filteredCommands.map((cmd, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={cmd.name}
                    type="button"
                    onClick={() => handleSelect(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs transition-colors ${
                      isSelected ? 'bg-purple-50 text-[#6D4C9C] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                        isSelected ? 'bg-[#6D4C9C] text-white shadow-sm' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <i className={`fas ${cmd.icon}`}></i>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold">{cmd.name}</span>
                        <span className="block text-[10px] text-gray-400">{cmd.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cmd.badge && (
                        <span className="text-[10px] bg-purple-100 text-[#6D4C9C] px-2 py-0.5 rounded-full font-bold">
                          {cmd.badge}
                        </span>
                      )}
                      <i className={`fas fa-arrow-turn-down-left text-[11px] ${isSelected ? 'text-[#6D4C9C]' : 'opacity-0'}`}></i>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-white border rounded px-1 text-[10px]">↑</kbd> <kbd className="bg-white border rounded px-1 text-[10px]">↓</kbd> Navigate</span>
            <span><kbd className="bg-white border rounded px-1 text-[10px]">↵</kbd> Select</span>
          </div>
          <span className="font-semibold text-[#6D4C9C]">Shyvora Command Palette</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
