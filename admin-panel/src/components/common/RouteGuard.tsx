import React from 'react';
import { useRoleAccess } from '../../context/RoleAccessContext';
import AccessDenied from './AccessDenied';

interface RouteGuardProps {
  module: string;
  subpage: string;
  children: React.ReactNode;
}

export default function RouteGuard({ module, subpage, children }: RouteGuardProps) {
  const { hasPermission, currentRoleData, activeRole } = useRoleAccess();

  const isModuleEnabled = currentRoleData?.permissions[module]?.enabled ?? false;

  // If the module itself is disabled at the top level, access is denied
  if (!isModuleEnabled && activeRole !== 'Super Admin') {
    return <AccessDenied moduleName={module} subpageName={subpage} />;
  }

  // Flexible checking for lists and dashboards
  let isAllowed = hasPermission(module, subpage, 'view');

  if (activeRole === 'Super Admin') {
    isAllowed = true;
  } else if (module === 'roles') {
    // Only Admin, Super Admin, or System Admin can access Roles & Access Management
    isAllowed = activeRole === 'Admin' || activeRole === 'System Admin';
  } else if (module === 'orders' && subpage === 'Order List') {
    // Allowed if has ANY order permission
    const orderPerms = currentRoleData?.permissions.orders?.subpages || {};
    isAllowed = Object.values(orderPerms).some(p => p.view || p.create || p.edit || p.approve || p.export);
  } else if (module === 'orders' && subpage === 'Order Details') {
    // Allowed if has Order Details, Refund Management, or Order List
    isAllowed = hasPermission('orders', 'Order Details', 'view') || 
                hasPermission('orders', 'Order List', 'view') ||
                hasPermission('orders', 'Refund Management', 'view');
  } else if (module === 'tickets' && subpage === 'Ticket Dashboard') {
    // Allowed if has ANY ticket permission
    const ticketPerms = currentRoleData?.permissions.tickets?.subpages || {};
    isAllowed = hasPermission('tickets', 'Full Ticket Access', 'view') ||
                Object.values(ticketPerms).some(p => p.view);
  } else if (module === 'tickets' && subpage === 'Ticket Details') {
    isAllowed = hasPermission('tickets', 'Ticket Details', 'view') || 
                hasPermission('tickets', 'Full Ticket Access', 'view');
  } else if (module === 'tickets' && subpage === 'Ticket Escalation') {
    isAllowed = hasPermission('tickets', 'Ticket Escalation', 'view') || 
                hasPermission('tickets', 'Full Ticket Access', 'view');
  } else if (module === 'tickets' && subpage === 'Ticket Closure') {
    isAllowed = hasPermission('tickets', 'Ticket Closure', 'view') || 
                hasPermission('tickets', 'Full Ticket Access', 'view');
  }

  if (!isAllowed) {
    return <AccessDenied moduleName={module} subpageName={subpage} />;
  }

  return <>{children}</>;
}

