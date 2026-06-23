import adminAvatar from '../../assets/admin_avatar.png';
import { useRoleAccess } from '../../context/RoleAccessContext';
import { useNavigate } from 'react-router-dom';
import { usePayments } from '../../pages/Payments/PaymentsContext';
import { useTickets } from '../../pages/Tickets/TicketsContext';

interface HeaderProps {
  setIsSidebarOpen: (open: boolean) => void;
}

export default function Header({ setIsSidebarOpen }: HeaderProps) {
  const { roles, activeRole, setActiveRole } = useRoleAccess();
  const navigate = useNavigate();
  
  const { notifications } = usePayments();
  const { tickets } = useTickets();

  const totalNotifications = notifications.length;
  const activeTicketsCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;

  return (
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white/80 border-b border-[#E0E0E0] shadow-xs backdrop-blur-md sticky top-0 z-30 select-none">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {/* Hamburger Button for mobile */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg text-[#797979] hover:bg-[#F6F6F6] cursor-pointer"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Search Input */}
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
        {/* Message Action */}
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

        {/* Notification Action */}
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

        {/* User Profile Info with Dynamic Role Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex select-none">
            <span className="text-xs font-bold text-[#242424]">Admin User</span>
            <div className="relative mt-0.5">
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value)}
                className="appearance-none bg-transparent hover:bg-gray-100/50 text-[9px] font-bold text-[#401900] tracking-widest uppercase border border-[#E0E0E0] rounded-md pl-2 pr-6 py-0.5 outline-none cursor-pointer focus:ring-1 focus:ring-[#F8B057]"
              >
                {roles.map(r => (
                  <option key={r.name} value={r.name} className="text-xs font-sans tracking-normal capitalize font-medium text-left text-gray-700">
                    {r.name.toUpperCase()}
                  </option>
                ))}
              </select>
              <span className="absolute inset-y-0 right-1.5 flex items-center pointer-events-none text-[#401900]">
                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </span>
            </div>
          </div>
          <img
            src={adminAvatar}
            alt="Avatar"
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#E0E0E0] select-none pointer-events-none"
          />
        </div>
      </div>
    </header>
  );
}
