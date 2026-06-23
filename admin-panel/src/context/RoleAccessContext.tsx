import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PermissionActions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
}

export interface ModulePermission {
  enabled: boolean;
  subpages: {
    [subpageName: string]: PermissionActions;
  };
}

export interface RolePermissions {
  [moduleName: string]: ModulePermission;
}

export interface RoleData {
  name: string;
  description: string;
  permissions: RolePermissions;
  isCustom?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

interface RoleAccessContextType {
  roles: RoleData[];
  activeRole: string;
  auditLogs: AuditLog[];
  setActiveRole: (roleName: string) => void;
  updateRolePermissions: (roleName: string, permissions: RolePermissions) => void;
  createRole: (roleName: string, description: string, copyFromRole?: string) => void;
  editRoleName: (oldName: string, newName: string, description: string) => void;
  duplicateRole: (roleName: string, newRoleName: string) => void;
  deleteRole: (roleName: string) => void;
  resetPermissions: (roleName: string) => void;
  hasPermission: (moduleName: string, subpageName: string, action?: keyof PermissionActions) => boolean;
  logAction: (action: string, details: string) => void;
}

const RoleAccessContext = createContext<RoleAccessContextType | undefined>(undefined);

const createEmptyPermissions = (allEnabled = false): PermissionActions => ({
  view: allEnabled,
  create: allEnabled,
  edit: allEnabled,
  delete: allEnabled,
  approve: allEnabled,
  export: allEnabled,
});

export const MODULES_CONFIG = {
  products: {
    label: 'Products Module',
    subpages: [
      'Category List',
      'Product List',
      'Product Detail',
      'Product Show / Hide',
      'Bulk Product Visibility',
      'Inventory Management'
    ]
  },
  orders: {
    label: 'Orders Module',
    subpages: [
      'Order List',
      'Order Details',
      'Pending Orders',
      'Processing Orders',
      'Delivered Orders',
      'Cancelled Orders',
      'Shipped Orders',
      'Returned Orders',
      'Refund Management'
    ]
  },
  shipments: {
    label: 'Shipments Module',
    subpages: [
      'Shipment Creation',
      'Track Shipments',
      'Return Requests',
      'Refund Processing',
      'Replacement Orders'
    ]
  },
  tickets: {
    label: 'Tickets Module',
    subpages: [
      'Ticket Dashboard',
      'Ticket Details',
      'Ticket Closure',
      'Ticket Escalation',
      'Full Ticket Access'
    ]
  },
  payments: {
    label: 'Payments Module',
    subpages: [
      'Payment Logs',
      'Transaction Details',
      'Invoice Management',
      'Credit Notes',
      'Status Notifications'
    ]
  }
};

const getModuleForSubpage = (subpageName: string): string | null => {
  for (const [mod, config] of Object.entries(MODULES_CONFIG)) {
    if (config.subpages.includes(subpageName)) {
      return mod;
    }
  }
  return null;
};

const getDefaultRolePermissions = (roleName: string): RolePermissions => {
  const permissions: RolePermissions = {};
  
  Object.keys(MODULES_CONFIG).forEach((moduleKey) => {
    permissions[moduleKey] = {
      enabled: false,
      subpages: {}
    };
    MODULES_CONFIG[moduleKey as keyof typeof MODULES_CONFIG].subpages.forEach((sub) => {
      permissions[moduleKey].subpages[sub] = createEmptyPermissions(false);
    });
  });

  const enableAllInModule = (moduleKey: string) => {
    permissions[moduleKey].enabled = true;
    MODULES_CONFIG[moduleKey as keyof typeof MODULES_CONFIG].subpages.forEach((sub) => {
      permissions[moduleKey].subpages[sub] = createEmptyPermissions(true);
    });
  };

  const enableSubpage = (subpageName: string, actions: Partial<PermissionActions>) => {
    const mod = getModuleForSubpage(subpageName);
    if (mod) {
      permissions[mod].enabled = true;
      permissions[mod].subpages[subpageName] = {
        ...permissions[mod].subpages[subpageName],
        ...actions
      };
    }
  };

  if (roleName === 'Super Admin' || roleName === 'Admin') {
    Object.keys(MODULES_CONFIG).forEach((mod) => enableAllInModule(mod));
  } else if (roleName === 'Product Manager') {
    permissions.products.enabled = true;
    enableSubpage('Category List', { view: true, create: true, edit: true, export: true });
    enableSubpage('Product List', { view: true, create: true, edit: true, export: true });
    enableSubpage('Product Detail', { view: true, create: true, edit: true, export: true });
    enableSubpage('Product Show / Hide', { view: true, create: true, edit: true, export: true });
    enableSubpage('Bulk Product Visibility', { view: true, create: true, edit: true, export: true });
  } else if (roleName === 'Inventory Manager') {
    permissions.products.enabled = true;
    enableSubpage('Inventory Management', { view: true, create: true, edit: true, export: true });
  } else if (roleName === 'Order Manager') {
    permissions.orders.enabled = true;
    enableSubpage('Order List', { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage('Order Details', { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage('Pending Orders', { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage('Processing Orders', { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage('Delivered Orders', { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage('Cancelled Orders', { view: true, create: true, edit: true, approve: true, export: true });
  } else if (roleName === 'Fulfillment Manager') {
    permissions.orders.enabled = true;
    enableSubpage('Shipped Orders', { view: true, create: true, edit: true, approve: true });
  } else if (roleName === 'Logistics Manager') {
    permissions.shipments.enabled = true;
    enableSubpage('Shipment Creation', { view: true, create: true, edit: true, approve: true });
    enableSubpage('Track Shipments', { view: true, create: true, edit: true, approve: true });
  } else if (roleName === 'Support Team') {
    permissions.tickets.enabled = true;
    enableSubpage('Ticket Dashboard', { view: true, create: true, edit: true, approve: true });
    enableSubpage('Ticket Details', { view: true, create: true, edit: true, approve: true });
    enableSubpage('Ticket Closure', { view: true, create: true, edit: true, approve: true });
  } else if (roleName === 'Support Manager') {
    permissions.orders.enabled = true;
    permissions.shipments.enabled = true;
    permissions.tickets.enabled = true;
    enableSubpage('Returned Orders', { view: true, create: true, edit: true, approve: true });
    enableSubpage('Return Requests', { view: true, create: true, edit: true, approve: true });
    enableSubpage('Ticket Escalation', { view: true, create: true, edit: true, approve: true });
  } else if (roleName === 'Finance Manager') {
    permissions.orders.enabled = true;
    permissions.shipments.enabled = true;
    enableSubpage('Refund Management', { view: true, create: true, edit: true, approve: true });
    enableSubpage('Refund Processing', { view: true, create: true, edit: true, approve: true });
  } else if (roleName === 'Finance Team') {
    permissions.payments.enabled = true;
    enableSubpage('Payment Logs', { view: true, create: true, edit: true, export: true });
    enableSubpage('Transaction Details', { view: true, create: true, edit: true, export: true });
    enableSubpage('Invoice Management', { view: true, create: true, edit: true, export: true });
    enableSubpage('Credit Notes', { view: true, create: true, edit: true, export: true });
  } else if (roleName === 'Operations Manager') {
    permissions.shipments.enabled = true;
    enableSubpage('Replacement Orders', { view: true, create: true, edit: true, approve: true });
  } else if (roleName === 'System Admin') {
    Object.keys(MODULES_CONFIG).forEach((mod) => enableAllInModule(mod));
    enableSubpage('Status Notifications', { view: true, create: true, edit: true, approve: true });
  }

  return permissions;
};

const DEFAULT_ROLES: RoleData[] = [
  { name: 'Super Admin', description: 'Complete system access, controls all pages and configurations.', permissions: getDefaultRolePermissions('Super Admin') },
  { name: 'Admin', description: 'Full access to operations, orders, tickets, and user configuration.', permissions: getDefaultRolePermissions('Admin') },
  { name: 'Product Manager', description: 'Manages categories, products, visibility controls.', permissions: getDefaultRolePermissions('Product Manager') },
  { name: 'Inventory Manager', description: 'Monitors product inventory, movements, and alerts.', permissions: getDefaultRolePermissions('Inventory Manager') },
  { name: 'Order Manager', description: 'Handles order listing, detailed views, processing operations.', permissions: getDefaultRolePermissions('Order Manager') },
  { name: 'Fulfillment Manager', description: 'Dispatches products, manages shipment status, and coordinates logs.', permissions: getDefaultRolePermissions('Fulfillment Manager') },
  { name: 'Logistics Manager', description: 'Creates and tracks shipments, operates delivery schedules.', permissions: getDefaultRolePermissions('Logistics Manager') },
  { name: 'Support Team', description: 'Monitors customer feedback and grievance ticket logs.', permissions: getDefaultRolePermissions('Support Team') },
  { name: 'Support Manager', description: 'Escalates tickets, logs return orders and shipment complaints.', permissions: getDefaultRolePermissions('Support Manager') },
  { name: 'Finance Manager', description: 'Approves refunds, registers invoices, logs transactions.', permissions: getDefaultRolePermissions('Finance Manager') },
  { name: 'Finance Team', description: 'Monitors credit notes, payment logs, invoice templates.', permissions: getDefaultRolePermissions('Finance Team') },
  { name: 'Operations Manager', description: 'Manages replacement orders, customer profiles, operations activity.', permissions: getDefaultRolePermissions('Operations Manager') },
  { name: 'System Admin', description: 'Oversees notifications configurations, error logs, and system statuses.', permissions: getDefaultRolePermissions('System Admin') },
];

export const RoleAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<RoleData[]>(() => {
    const saved = localStorage.getItem('rbac_roles');
    return saved ? JSON.parse(saved) : DEFAULT_ROLES;
  });

  const [activeRole, setActiveRoleState] = useState<string>(() => {
    return localStorage.getItem('rbac_active_role') || 'Super Admin';
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('rbac_audit_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        user: 'System Admin',
        action: 'Initialize RBAC',
        details: 'Initial configuration loaded with default ecommerce module permissions.'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('rbac_roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('rbac_active_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('rbac_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const logAction = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: 'Super Admin',
      action,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const setActiveRole = (roleName: string) => {
    setActiveRoleState(roleName);
    logAction('Switch Simulated Role', `Changed active acting role to: ${roleName}`);
  };

  const updateRolePermissions = (roleName: string, updatedPermissions: RolePermissions) => {
    setRoles((prev) =>
      prev.map((role) =>
        role.name === roleName ? { ...role, permissions: updatedPermissions } : role
      )
    );
    logAction('Modify Permissions', `Updated permissions matrix for role: ${roleName}`);
  };

  const createRole = (roleName: string, description: string, copyFromRole?: string) => {
    const permissions = copyFromRole
      ? JSON.parse(JSON.stringify(roles.find((r) => r.name === copyFromRole)?.permissions || getDefaultRolePermissions('Super Admin')))
      : getDefaultRolePermissions('Super Admin');

    const newRole: RoleData = {
      name: roleName,
      description,
      permissions,
      isCustom: true,
    };

    setRoles((prev) => [...prev, newRole]);
    logAction('Create Role', `Created new security role: ${roleName} ${copyFromRole ? `(copied from ${copyFromRole})` : ''}`);
  };

  const editRoleName = (oldName: string, newName: string, description: string) => {
    setRoles((prev) =>
      prev.map((role) =>
        role.name === oldName
          ? { ...role, name: newName, description }
          : role
      )
    );
    if (activeRole === oldName) {
      setActiveRoleState(newName);
    }
    logAction('Edit Role Details', `Renamed role ${oldName} to ${newName} and updated description.`);
  };

  const duplicateRole = (roleName: string, newRoleName: string) => {
    const sourceRole = roles.find((r) => r.name === roleName);
    if (!sourceRole) return;

    const duplicated: RoleData = {
      name: newRoleName,
      description: `Duplicate of ${roleName}. ${sourceRole.description}`,
      permissions: JSON.parse(JSON.stringify(sourceRole.permissions)),
      isCustom: true,
    };

    setRoles((prev) => [...prev, duplicated]);
    logAction('Duplicate Role', `Duplicated role: ${roleName} as: ${newRoleName}`);
  };

  const deleteRole = (roleName: string) => {
    setRoles((prev) => prev.filter((r) => r.name !== roleName));
    if (activeRole === roleName) {
      setActiveRoleState('Super Admin');
    }
    logAction('Delete Role', `Deleted security role: ${roleName}`);
  };

  const resetPermissions = (roleName: string) => {
    const defaults = getDefaultRolePermissions(roleName);
    setRoles((prev) =>
      prev.map((role) =>
        role.name === roleName ? { ...role, permissions: defaults } : role
      )
    );
    logAction('Reset Permissions', `Reverted permissions for ${roleName} to default config.`);
  };

  const hasPermission = (moduleName: string, subpageName: string, action: keyof PermissionActions = 'view'): boolean => {
    const activeRoleData = roles.find((r) => r.name === activeRole);
    if (!activeRoleData) return false;

    if (activeRole === 'Super Admin') return true;

    const modulePerm = activeRoleData.permissions[moduleName];
    if (!modulePerm || !modulePerm.enabled) return false;

    const subpageActions = modulePerm.subpages[subpageName];
    if (!subpageActions) return false;

    return subpageActions[action] === true;
  };

  return (
    <RoleAccessContext.Provider
      value={{
        roles,
        activeRole,
        auditLogs,
        setActiveRole,
        updateRolePermissions,
        createRole,
        editRoleName,
        duplicateRole,
        deleteRole,
        resetPermissions,
        hasPermission,
        logAction
      }}
    >
      {children}
    </RoleAccessContext.Provider>
  );
};

export const useRoleAccess = () => {
  const context = useContext(RoleAccessContext);
  if (!context) {
    throw new Error('useRoleAccess must be used within a RoleAccessProvider');
  }
  return context;
};

