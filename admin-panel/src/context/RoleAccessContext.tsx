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
  _id?: string;
  name: string;
  description: string;
  permissions: RolePermissions;
  status: 'Active' | 'Inactive';
  isCustom?: boolean;
  createdBy?: string;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: RoleData;
  status: 'Active' | 'Inactive';
  lastLogin: string | null;
  createdAt: string;
}

interface RoleAccessContextType {
  roles: RoleData[];
  activeRole: string;
  currentRoleData: RoleData | undefined;
  auditLogs: AuditLog[];
  admins: AdminUser[];
  loading: boolean;
  rolesLoading: boolean;
  rolesError: string | null;
  setActiveRole: (roleName: string) => void;
  updateRolePermissions: (roleName: string, permissions: RolePermissions) => Promise<boolean>;
  createRole: (roleName: string, description: string, copyFromRole?: string) => Promise<boolean>;
  editRoleName: (oldName: string, newName: string, description: string) => Promise<boolean>;
  duplicateRole: (roleName: string, newRoleName: string) => Promise<boolean>;
  deleteRole: (roleName: string) => Promise<boolean>;
  resetPermissions: (roleName: string) => Promise<boolean>;
  hasPermission: (moduleName: string, subpageName: string, action?: keyof PermissionActions) => boolean;
  logAction: (action: string, details: string) => void;
  fetchRoles: () => Promise<void>;
  fetchAdmins: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  createAdminUser: (adminData: any) => Promise<{ success: boolean; message?: string }>;
  updateAdminUser: (id: string, adminData: any) => Promise<{ success: boolean; message?: string }>;
  deleteAdminUser: (id: string) => Promise<{ success: boolean; message?: string }>;
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
  dashboard: {
    label: 'Dashboard Module',
    subpages: ['Dashboard View']
  },
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
  },
  customers: {
    label: 'Customers Module',
    subpages: ['User List', 'User Details', 'Activity Log', 'Notification Preferences']
  },
  settings: {
    label: 'Settings Module',
    subpages: ['General Settings']
  },
  roles: {
    label: 'Roles & Access Module',
    subpages: ['Role & Access Management']
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
    permissions.dashboard.enabled = true;
    enableSubpage('Dashboard View', { view: true });

    permissions.products.enabled = true;
    enableSubpage('Category List', { view: true, create: true, edit: true, export: true });
    enableSubpage('Product List', { view: true, create: true, edit: true, export: true });
    enableSubpage('Product Detail', { view: true, create: true, edit: true, export: true });
    enableSubpage('Product Show / Hide', { view: true, create: true, edit: true, export: true });
    enableSubpage('Bulk Product Visibility', { view: true, create: true, edit: true, export: true });
    enableSubpage('Inventory Management', { view: true, create: true, edit: true, export: true });
  } else if (roleName === 'Order Manager') {
    permissions.dashboard.enabled = true;
    enableSubpage('Dashboard View', { view: true });

    permissions.orders.enabled = true;
    enableSubpage('Order List', { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage('Order Details', { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage('Pending Orders', { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage('Processing Orders', { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage('Delivered Orders', { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage('Cancelled Orders', { view: true, create: true, edit: true, approve: true, export: true });
  } else if (roleName === 'Customer Support') {
    permissions.dashboard.enabled = true;
    enableSubpage('Dashboard View', { view: true });

    permissions.tickets.enabled = true;
    enableSubpage('Ticket Dashboard', { view: true, create: true, edit: true, approve: true });
    enableSubpage('Ticket Details', { view: true, create: true, edit: true, approve: true });
    enableSubpage('Ticket Closure', { view: true, create: true, edit: true, approve: true });
  }

  return permissions;
};

const API_URL = 'http://localhost:5000/api';

export const RoleAccessProvider: React.FC<{ children: React.ReactNode; isLoggedIn?: boolean }> = ({ children, isLoggedIn }) => {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rolesLoading, setRolesLoading] = useState<boolean>(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  // Read active role from logged in user profile
  const [activeRole, setActiveRoleState] = useState<string>(() => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.role?.name || 'Super Admin';
      } catch (e) {
        return 'Super Admin';
      }
    }
    return 'Super Admin';
  });

  // Sync activeRole with localStorage when loggedIn state changes
  useEffect(() => {
    const loggedIn = isLoggedIn ?? (localStorage.getItem('isLoggedIn') === 'true');
    if (loggedIn) {
      const userStr = localStorage.getItem('adminUser');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role?.name) {
            setActiveRoleState(user.role.name);
          }
        } catch (e) {
          console.error("Error parsing adminUser from localStorage:", e);
        }
      }
    } else {
      setActiveRoleState('Super Admin');
    }
  }, [isLoggedIn]);


  const getHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchRoles = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setRolesLoading(true);
    setRolesError(null);
    try {
      const res = await fetch(`${API_URL}/roles`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch roles: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setRoles(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch roles');
      }
    } catch (err: any) {
      console.error('Failed to fetch roles from database:', err);
      setRolesError(err.message || 'Failed to fetch roles');
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchAdmins = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/admins`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    }
  };

  const fetchAuditLogs = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/audit-logs`, {
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        const formatted = data.data.map((log: any) => ({
          id: log._id,
          timestamp: log.timestamp,
          user: log.user,
          action: log.action,
          details: log.details
        }));
        setAuditLogs(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([fetchRoles(), fetchAdmins(), fetchAuditLogs()]);
      setLoading(false);
    };
    
    // Check if logged in before making API calls
    const loggedIn = isLoggedIn ?? (localStorage.getItem('isLoggedIn') === 'true');
    if (loggedIn) {
      loadAllData();
    } else {
      setRoles([]);
      setAdmins([]);
      setAuditLogs([]);
      setLoading(false);
    }
  }, [isLoggedIn, activeRole]); // Reload if logged in state or acting role changes (for simulation)

  const logAction = (action: string, details: string) => {
    // Audit logs are now written on the backend upon changes,
    // but we can support local simulated log triggers if needed.
    console.log(`Action logged: ${action} - ${details}`);
  };

  const setActiveRole = (roleName: string) => {
    setActiveRoleState(roleName);
  };

  const updateRolePermissions = async (roleName: string, updatedPermissions: RolePermissions): Promise<boolean> => {
    const role = roles.find((r) => r.name === roleName);
    if (!role || !role._id) return false;

    try {
      const res = await fetch(`${API_URL}/roles/${role._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ permissions: updatedPermissions })
      });
      const data = await res.json();
      if (data.success) {
        setRoles((prev) => prev.map((r) => r.name === roleName ? data.data : r));
        await fetchAuditLogs();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to update role permissions:', err);
      return false;
    }
  };

  const createRole = async (roleName: string, description: string, copyFromRole?: string): Promise<boolean> => {
    const copySource = copyFromRole ? roles.find((r) => r.name === copyFromRole) : null;
    const permissions = copySource
      ? JSON.parse(JSON.stringify(copySource.permissions))
      : getDefaultRolePermissions('Super Admin');

    try {
      const res = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: roleName, description, permissions })
      });
      const data = await res.json();
      if (data.success) {
        await fetchRoles();
        await fetchAuditLogs();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to create role:', err);
      return false;
    }
  };

  const editRoleName = async (oldName: string, newName: string, description: string): Promise<boolean> => {
    const role = roles.find((r) => r.name === oldName);
    if (!role || !role._id) return false;

    try {
      const res = await fetch(`${API_URL}/roles/${role._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name: newName, description })
      });
      const data = await res.json();
      if (data.success) {
        setRoles((prev) => prev.map((r) => r.name === oldName ? data.data : r));
        if (activeRole === oldName) {
          setActiveRoleState(newName);
        }
        await fetchAuditLogs();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to edit role details:', err);
      return false;
    }
  };

  const duplicateRole = async (roleName: string, newRoleName: string): Promise<boolean> => {
    const sourceRole = roles.find((r) => r.name === roleName);
    if (!sourceRole) return false;

    try {
      const res = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          name: newRoleName,
          description: `Duplicate of ${roleName}. ${sourceRole.description}`,
          permissions: sourceRole.permissions
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchRoles();
        await fetchAuditLogs();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to duplicate role:', err);
      return false;
    }
  };

  const deleteRole = async (roleName: string): Promise<boolean> => {
    const role = roles.find((r) => r.name === roleName);
    if (!role || !role._id) return false;

    try {
      const res = await fetch(`${API_URL}/roles/${role._id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setRoles((prev) => prev.filter((r) => r.name !== roleName));
        if (activeRole === roleName) {
          setActiveRoleState('Super Admin');
        }
        await fetchAuditLogs();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete role:', err);
      return false;
    }
  };

  const resetPermissions = async (roleName: string): Promise<boolean> => {
    const defaults = getDefaultRolePermissions(roleName);
    return await updateRolePermissions(roleName, defaults);
  };

  const currentRoleData = roles.find((r) => r.name === activeRole) || (() => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role && user.role.name === activeRole) {
        return user.role;
      }
    }
    return undefined;
  })();

  const hasPermission = (moduleName: string, subpageName: string, action: keyof PermissionActions = 'view'): boolean => {
    if (!currentRoleData) return false;

    if (activeRole === 'Super Admin') return true;

    const modulePerm = currentRoleData.permissions[moduleName];
    if (!modulePerm || !modulePerm.enabled) return false;

    const subpageActions = modulePerm.subpages[subpageName];
    if (!subpageActions) return false;

    return subpageActions[action] === true;
  };

  // Admin Users Management APIs
  const createAdminUser = async (adminData: any) => {
    try {
      const res = await fetch(`${API_URL}/admins`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(adminData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchAdmins();
        await fetchAuditLogs();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Failed to create admin:', err);
      return { success: false, message: 'Server connection failed' };
    }
  };

  const updateAdminUser = async (id: string, adminData: any) => {
    try {
      const res = await fetch(`${API_URL}/admins/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(adminData)
      });
      const data = await res.json();
      if (data.success) {
        await fetchAdmins();
        await fetchAuditLogs();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Failed to update admin:', err);
      return { success: false, message: 'Server connection failed' };
    }
  };

  const deleteAdminUser = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admins/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        await fetchAdmins();
        await fetchAuditLogs();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Failed to delete admin:', err);
      return { success: false, message: 'Server connection failed' };
    }
  };

  return (
    <RoleAccessContext.Provider
      value={{
        roles,
        activeRole,
        currentRoleData,
        auditLogs,
        admins,
        loading,
        rolesLoading,
        rolesError,
        setActiveRole,
        updateRolePermissions,
        createRole,
        editRoleName,
        duplicateRole,
        deleteRole,
        resetPermissions,
        hasPermission,
        logAction,
        fetchRoles,
        fetchAdmins,
        fetchAuditLogs,
        createAdminUser,
        updateAdminUser,
        deleteAdminUser
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
