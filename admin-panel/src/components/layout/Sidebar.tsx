import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import fashionLogo from '../../assets/fashion_logo.png';
import { useRoleAccess } from '../../context/RoleAccessContext';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
}

interface SubLinkItem {
  name: string;
  path: string;
}

interface NavLinkItem {
  name: string;
  path: string;
  icon: string;
  isDropdown?: boolean;
  subLinks?: SubLinkItem[];
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, currentRoleData, activeRole } = useRoleAccess();

  const [isUsersOpen, setIsUsersOpen] = useState(() => {
    return location.pathname.startsWith('/dashboard/users');
  });

  const [isProductsOpen, setIsProductsOpen] = useState(() => {
    return location.pathname.startsWith('/dashboard/products');
  });

  const [isOrdersOpen, setIsOrdersOpen] = useState(() => {
    return location.pathname.startsWith('/dashboard/orders');
  });

  const [isShipmentsOpen, setIsShipmentsOpen] = useState(() => {
    return location.pathname.startsWith('/dashboard/shipments');
  });

  const [isTicketsOpen, setIsTicketsOpen] = useState(() => {
    return location.pathname.startsWith('/dashboard/tickets');
  });

  const [isPaymentsOpen, setIsPaymentsOpen] = useState(() => {
    return location.pathname.startsWith('/dashboard/payments');
  });

  // Keep dropdown open if user navigating in users, products, orders, shipments, tickets, or payments subpages
  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/users')) {
      setIsUsersOpen(true);
    }
    if (location.pathname.startsWith('/dashboard/products')) {
      setIsProductsOpen(true);
    }
    if (location.pathname.startsWith('/dashboard/orders')) {
      setIsOrdersOpen(true);
    }
    if (location.pathname.startsWith('/dashboard/shipments')) {
      setIsShipmentsOpen(true);
    }
    if (location.pathname.startsWith('/dashboard/tickets')) {
      setIsTicketsOpen(true);
    }
    if (location.pathname.startsWith('/dashboard/payments')) {
      setIsPaymentsOpen(true);
    }
  }, [location.pathname]);

  const handleSignOut = () => {
    onLogout();
    navigate('/login');
  };

  const getModuleForLink = (name: string): string => {
    switch (name) {
      case 'Products': return 'products';
      case 'Orders': return 'orders';
      case 'Shipments': return 'shipments';
      case 'Tickets': return 'tickets';
      case 'Payments': return 'payments';
      case 'Users': return 'customers';
      case 'Settings': return 'settings';
      case 'Role & Access Management': return 'roles';
      case 'Dashboard': return 'dashboard';
      default: return '';
    }
  };

  const getSubpageForLinkName = (moduleName: string, name: string): string => {
    if (moduleName === 'customers') {
      if (name === 'User List') return 'User List';
      if (name === 'User Details') return 'User Details';
      if (name === 'Activity Log') return 'Activity Log';
      if (name === 'Notification Preferences') return 'Notification Preferences';
    }
    if (moduleName === 'products') {
      if (name === 'Category List') return 'Category List';
      if (name === 'Product List') return 'Product List';
      if (name === 'Product Detail') return 'Product Detail';
      if (name === 'Inventory Management') return 'Inventory Management';
    }
    if (moduleName === 'orders') {
      if (name === 'Order List') return 'Order List';
      if (name === 'Order Details') return 'Order Details';
    }
    if (moduleName === 'shipments') {
      if (name === 'Shipment Creation') return 'Shipment Creation';
      if (name === 'Track Shipments') return 'Track Shipments';
      if (name === 'Return Requests') return 'Return Requests';
      if (name === 'Refund Processing') return 'Refund Processing';
      if (name === 'Replacement Orders') return 'Replacement Orders';
    }
    if (moduleName === 'tickets') {
      if (name === 'Ticket Dashboard') return 'Ticket Dashboard';
      if (name === 'Ticket Details') return 'Ticket Details';
      if (name === 'Ticket Escalation') return 'Ticket Escalation';
      if (name === 'Ticket Closure') return 'Ticket Closure';
    }
    if (moduleName === 'payments') {
      if (name === 'Payment Logs') return 'Payment Logs';
      if (name === 'Invoice Management') return 'Invoice Management';
      if (name === 'Credit Notes') return 'Credit Notes';
      if (name === 'Status Notifications') return 'Status Notifications';
    }
    return name;
  };

  const navLinks: NavLinkItem[] = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' 
    },
     { 
      name: 'Role & Access Management', 
      path: '/dashboard/roles', 
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' 
    },
    { 
      name: 'Users', 
      path: '/dashboard/users', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      isDropdown: true,
      subLinks: [
        { name: 'User List', path: '/dashboard/users' },
        { name: 'User Details', path: '/dashboard/users/details' },
        { name: 'Activity Log', path: '/dashboard/users/activity' },
        { name: 'Notification Preferences', path: '/dashboard/users/notifications' }
      ]
    },
   
    { 
      name: 'Products', 
      path: '/dashboard/products', 
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      isDropdown: true,
      subLinks: [
        { name: 'Category List', path: '/dashboard/products/categories' },
        { name: 'Product List', path: '/dashboard/products' },
        { name: 'Product Detail', path: '/dashboard/products/details' },
        { name: 'Inventory Management', path: '/dashboard/products/inventory' }
      ]
    },
    { 
      name: 'Orders', 
      path: '/dashboard/orders', 
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      isDropdown: true,
      subLinks: [
        { name: 'Order List', path: '/dashboard/orders' },
        { name: 'Order Details', path: '/dashboard/orders/details' },
      ]
    },
    { 
      name: 'Shipments', 
      path: '/dashboard/shipments', 
      icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 9h4l3 3v4H3V9h10z',
      isDropdown: true,
      subLinks: [
        { name: 'Shipment Creation', path: '/dashboard/shipments/creation' },
        { name: 'Track Shipments', path: '/dashboard/shipments/track' },
        { name: 'Return Requests', path: '/dashboard/shipments/returns' },
        { name: 'Refund Processing', path: '/dashboard/shipments/refunds' },
        { name: 'Replacement Orders', path: '/dashboard/shipments/replacements' }
      ]
    },
    { 
      name: 'Tickets', 
      path: '/dashboard/tickets', 
      icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
      isDropdown: true,
      subLinks: [
        { name: 'Ticket Dashboard', path: '/dashboard/tickets' },
        { name: 'Ticket Details', path: '/dashboard/tickets/details' },
        { name: 'Ticket Escalation', path: '/dashboard/tickets/escalation' },
        { name: 'Ticket Closure', path: '/dashboard/tickets/closure' }
      ]
    },
    { 
      name: 'Payments', 
      path: '/dashboard/payments', 
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      isDropdown: true,
      subLinks: [
        { name: 'Payment Logs', path: '/dashboard/payments/logs' },
        { name: 'Invoice Management', path: '/dashboard/payments/invoices' },
        { name: 'Credit Notes', path: '/dashboard/payments/credit-notes' },
        { name: 'Status Notifications', path: '/dashboard/payments/notifications' }
      ]
    },
    { 
      name: 'Settings', 
      path: '/dashboard/settings', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' 
    },
  ];

  // Dynamic Filtering based on active permissions
  const filteredNavLinks = navLinks.map(link => {
    const modKey = getModuleForLink(link.name);
    if (!modKey) return link;

    const isModEnabled = activeRole === 'Super Admin' || (currentRoleData?.permissions[modKey]?.enabled ?? false);
    if (!isModEnabled) return null;

    if (link.isDropdown && link.subLinks) {
      const filteredSub = link.subLinks.filter(sub => {
        const subpageName = getSubpageForLinkName(modKey, sub.name);

        if (modKey === 'orders' && sub.name === 'Order List') {
          const orderPerms = currentRoleData?.permissions.orders?.subpages || {};
          return activeRole === 'Super Admin' || Object.values(orderPerms).some(p => p.view);
        }
        if (modKey === 'tickets' && sub.name === 'Ticket Dashboard') {
          return activeRole === 'Super Admin' || 
                 hasPermission('tickets', 'Ticket Dashboard', 'view') ||
                 hasPermission('tickets', 'Full Ticket Access', 'view');
        }

        return activeRole === 'Super Admin' || hasPermission(modKey, subpageName, 'view');
      });

      if (filteredSub.length === 0) return null;

      return {
        ...link,
        subLinks: filteredSub
      };
    }

    // For single links, verify view permission at subpage/feature level
    if (link.name === 'Role & Access Management') {
      return activeRole === 'Super Admin' || hasPermission('roles', 'Role & Access Management', 'view') ? link : null;
    }
    if (link.name === 'Settings') {
      return activeRole === 'Super Admin' || hasPermission('settings', 'General Settings', 'view') ? link : null;
    }
    if (link.name === 'Dashboard') {
      return activeRole === 'Super Admin' || hasPermission('dashboard', 'Dashboard View', 'view') ? link : null;
    }

    return link;
  }).filter((l): l is NavLinkItem => l !== null);

  const renderLinks = (onClickCallback?: () => void) => {
    return filteredNavLinks.map((link) => {
      if (link.isDropdown) {
        const isSubActive = location.pathname.startsWith(link.path);
        const isOpen = 
          link.name === 'Products' ? isProductsOpen : 
          link.name === 'Orders' ? isOrdersOpen : 
          link.name === 'Shipments' ? isShipmentsOpen : 
          link.name === 'Tickets' ? isTicketsOpen : 
          link.name === 'Payments' ? isPaymentsOpen :
          isUsersOpen;
        const setIsOpen = 
          link.name === 'Products' ? setIsProductsOpen : 
          link.name === 'Orders' ? setIsOrdersOpen : 
          link.name === 'Shipments' ? setIsShipmentsOpen : 
          link.name === 'Tickets' ? setIsTicketsOpen : 
          link.name === 'Payments' ? setIsPaymentsOpen :
          setIsUsersOpen;
        
        return (
          <div key={link.name} className="flex flex-col gap-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                isSubActive
                  ? 'bg-[#E2F2E3] border-r-4 border-[#00522E] text-[#00522E]'
                  : 'text-[#797979] hover:bg-[#F6F6F6] hover:text-[#401900]'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
                <span>{link.name}</span>
              </div>
              <svg
                className={`w-4 h-4 text-current transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && link.subLinks && (
              <div className="flex flex-col gap-1.5 pl-10 mt-1">
                {link.subLinks.map((sub) => {
                  const isCurrentSub = sub.path === link.path 
                    ? location.pathname === link.path
                    : location.pathname.startsWith(sub.path);
                  
                  return (
                    <Link
                      key={sub.name}
                      to={sub.path}
                      onClick={onClickCallback}
                      className={`block px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 ${
                        isCurrentSub
                          ? 'bg-[#00522E]/10 text-[#00522E]'
                          : 'text-[#797979] hover:bg-[#F6F6F6] hover:text-[#00522E]'
                      }`}
                    >
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
      const isGreenTheme = link.path === '/dashboard' || link.path === '/dashboard/roles';
      return (
        <Link
          key={link.name}
          to={link.path}
          onClick={onClickCallback}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 ${
            isActive
              ? (isGreenTheme ? 'bg-[#00522E]/10 border-r-4 border-[#00522E] text-[#00522E]' : 'bg-[#F8B057]/10 border-r-4 border-[#401900] text-[#401900]')
              : (isGreenTheme ? 'text-[#797979] hover:bg-[#F6F6F6] hover:text-[#00522E]' : 'text-[#797979] hover:bg-[#F6F6F6] hover:text-[#401900]')
          }`}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
          </svg>
          <span>{link.name}</span>
        </Link>
      );
    });
  };

  return (
    <>
      {/* Desktop Sidebar (Permanent Drawer) */}
      <aside className="hidden lg:flex w-[240px] flex-shrink-0 flex-col justify-between bg-white border-r border-[#E0E0E0] h-full select-none py-6 overflow-y-auto">
        <div className="flex flex-col gap-8 px-6">
          <header className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <img src={fashionLogo} alt="Logo" className="w-8 h-8 object-contain" />
              <h1 className="text-xl font-bold tracking-tight text-[#401900]">Admin Panel</h1>
            </div>
            <span className="text-[11px] font-semibold text-[#797979] tracking-wider uppercase opacity-70">
              Enterprise Admin
            </span>
          </header>

          <nav className="flex flex-col gap-1.5">
            {renderLinks()}
          </nav>
        </div>

        <div className="px-6 mt-auto">
          <hr className="border-[#E0E0E0] mb-4" />
          <Link
            to="/dashboard/help"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 mb-4 ${
              location.pathname === '/dashboard/help'
                ? 'bg-[#F8B057]/10 border-r-4 border-[#401900] text-[#401900]'
                : 'text-[#797979] hover:bg-[#F6F6F6] hover:text-[#401900]'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            <span>Help Center</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#401900] hover:bg-[#00361E] text-white text-sm font-bold tracking-wider rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 transition-opacity lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <aside
            className="w-[240px] flex flex-col justify-between bg-white border-r border-[#E0E0E0] h-full p-6 select-none animate-slide-in-left overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-8">
              <header className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={fashionLogo} alt="Logo" className="w-8 h-8 object-contain" />
                    <h1 className="text-xl font-bold tracking-tight text-[#401900]">Admin Panel</h1>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-[#797979] p-1 rounded-full hover:bg-[#F6F6F6]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <span className="text-[11px] font-semibold text-[#797979] tracking-wider uppercase opacity-70">
                  Enterprise Admin
                </span>
              </header>

              <nav className="flex flex-col gap-1">
                {renderLinks(() => setIsSidebarOpen(false))}
              </nav>
            </div>

            <div className="mt-auto">
              <hr className="border-[#E0E0E0] mb-4" />
              <Link
                to="/dashboard/help"
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 mb-4 ${
                  location.pathname === '/dashboard/help'
                    ? 'bg-[#F8B057]/10 border-r-4 border-[#401900] text-[#401900]'
                    : 'text-[#797979] hover:bg-[#F6F6F6] hover:text-[#401900]'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <span>Help Center</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#401900] hover:bg-[#00361E] text-white text-sm font-bold tracking-wider rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
