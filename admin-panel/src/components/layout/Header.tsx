import { useState, useEffect, useRef } from 'react';
import adminAvatar from '../../assets/admin_avatar.png';
import { useRoleAccess } from '../../context/RoleAccessContext';
import { useNavigate } from 'react-router-dom';
import { usePayments } from '../../pages/Payments/PaymentsContext';
import { useTickets } from '../../pages/Tickets/TicketsContext';

interface HeaderProps {
  setIsSidebarOpen: (open: boolean) => void;
  onLogout?: () => void;
}

export default function Header({ setIsSidebarOpen, onLogout }: HeaderProps) {
  const { activeRole } = useRoleAccess();
  const navigate = useNavigate();
  
  const { notifications } = usePayments();
  const { tickets } = useTickets();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role?: { name: string } } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing adminUser from localStorage:", e);
      }
    }
  }, []);

  const totalNotifications = notifications.length;
  const activeTicketsCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;

  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white/80 border-b border-[#E0E0E0] shadow-xs backdrop-blur-md sticky top-0 z-30 select-none">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg text-[#797979] hover:bg-[#F6F6F6] cursor-pointer"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#797979]/70">
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search analytics, orders, or customers..."
            className="w-full bg-[#F6F6F6] hover:bg-[#F6F6F6]/80 focus:bg-white text-sm text-[#242424] placeholder-[#6B7280] rounded-xl pl-11 pr-4 py-2 border border-[#E0E0E0] focus:border-[#F8B057] focus:ring-1 focus:ring-[#F8B057] outline-none transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5 ml-4">
        {}
        <button 
          onClick={() => navigate('/dashboard/tickets')}
          className="p-2 rounded-xl text-[#797979] hover:bg-[#F6F6F6] relative transition-colors duration-150 cursor-pointer"
          aria-label="View tickets"
        >
          <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {activeTicketsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#F8B057] text-[9px] font-bold text-[#401900] ring-2 ring-white">
              {activeTicketsCount}
            </span>
          )}
        </button>

        {}
        <button 
          onClick={() => navigate('/dashboard/payments/notifications')}
          className="p-2 rounded-xl text-[#797979] hover:bg-[#F6F6F6] relative transition-colors duration-150 cursor-pointer"
          aria-label="View notifications"
        >
          <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#BA1A1A] text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
              {totalNotifications}
            </span>
          )}
        </button>

        <div className="w-[1px] h-8 bg-[#E0E0E0] my-1 hidden sm:block"></div>

        {}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 hover:bg-[#F6F6F6]/80 p-1.5 rounded-xl transition-all duration-200 cursor-pointer select-none text-left border border-transparent hover:border-[#E0E0E0]"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs font-bold text-[#242424]">{currentUser?.name || 'Admin User'}</span>
              <span className="text-[9px] font-bold text-[#00522E] tracking-widest uppercase mt-0.5">
                {currentUser?.role?.name || activeRole}
              </span>
            </div>
            <img
              src={adminAvatar}
              alt="Avatar"
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#E0E0E0]"
            />
          </button>

          {}
          {isMenuOpen && (
            <div className="hidden sm:block absolute right-0 mt-2 w-72 bg-white border border-[#E0E0E0] rounded-2xl shadow-xl z-50 animate-fade-in divide-y divide-gray-100 overflow-hidden">
              {}
              <div className="p-4 flex items-center gap-3">
                <img
                  src={adminAvatar}
                  alt="Avatar"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#F8B057]"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[#242424] truncate">{currentUser?.name || 'Admin User'}</span>
                  <span className="text-xs text-[#797979] truncate">{currentUser?.email || 'admin@fashionstore.com'}</span>
                  <span className="inline-flex self-start mt-1.5 items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#E2F2E3] text-[#00522E] border border-[#00522E]/20">
                    {currentUser?.role?.name || activeRole}
                  </span>
                </div>
              </div>

              {}
              <div className="p-2 space-y-0.5 bg-[#F6F6F6]/50">
                <button
                  onClick={() => {
                    if (onLogout) {
                      onLogout();
                    } else {
                      navigate('/login');
                    }
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#BA1A1A] hover:bg-[#BA1A1A]/10 rounded-lg transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {}
          {isMenuOpen && (
            <div
              className="sm:hidden fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 animate-fade-in"
              onClick={() => setIsMenuOpen(false)}
            >
              <div
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl z-50 flex flex-col max-h-[85vh] animate-slide-up"
                onClick={(e) => e.stopPropagation()}
              >
                {}
                <div className="flex justify-center py-3 flex-shrink-0">
                  <div className="w-12 h-1.5 bg-[#E0E0E0] rounded-full"></div>
                </div>

                {}
                <div className="px-5 pb-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={adminAvatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#F8B057]"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-[#242424]">{currentUser?.name || 'Admin User'}</span>
                      <span className="text-xs text-[#797979]">{currentUser?.email || 'admin@fashionstore.com'}</span>
                      <span className="inline-flex self-start mt-1 items-center px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider bg-[#E2F2E3] text-[#00522E] border border-[#00522E]/20 mt-1">
                        {currentUser?.role?.name || activeRole}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 rounded-full hover:bg-[#F6F6F6] text-[#797979]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {}
                <div className="p-4 bg-[#F6F6F6] border-t border-gray-100 flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      if (onLogout) {
                        onLogout();
                      } else {
                        navigate('/login');
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#BA1A1A]/10 text-xs font-bold text-[#BA1A1A] rounded-xl transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
