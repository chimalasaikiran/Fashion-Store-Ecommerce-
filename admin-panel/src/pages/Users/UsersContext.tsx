import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com/api' : 'http://localhost:5000/api');

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  status: 'Active' | 'Blocked' | 'Pending';
  role: 'Customer' | 'Admin' | 'Super Admin';
  createdDate: string;
  blockReason?: string;
  blockedAt?: string | null;
}

export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  status: 'Success' | 'Failed';
  category: 'Auth' | 'Transaction' | 'Profile' | 'Security';
}

export interface NotificationPreference {
  email: {
    orders: boolean;
    shipments: boolean;
    promotions: boolean;
    security: boolean;
  };
  push: {
    orders: boolean;
    shipments: boolean;
    promotions: boolean;
    security: boolean;
  };
  sms: {
    orders: boolean;
    shipments: boolean;
    promotions: boolean;
    security: boolean;
  };
}

interface UsersContextType {
  users: User[];
  activities: UserActivity[];
  notificationPref: NotificationPreference;
  loading: boolean;
  addUser: (user: Omit<User, 'id' | 'createdDate' | 'orders' | 'spent'>) => Promise<boolean>;
  updateUser: (id: string, updatedFields: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  blockUser: (id: string, reason: string) => Promise<boolean>;
  unblockUser: (id: string, reason: string) => Promise<boolean>;
  bulkActivate: (ids: string[]) => Promise<void>;
  bulkDeactivate: (ids: string[], reason?: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  saveNotificationPreferences: (pref: NotificationPreference) => Promise<boolean>;
  logActivity: (userId: string, userName: string, action: string, category: UserActivity['category'], status?: 'Success' | 'Failed') => void;
  fetchUsers: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

const initialNotifications: NotificationPreference = {
  email: { orders: true, shipments: true, promotions: false, security: true },
  push: { orders: true, shipments: false, promotions: false, security: true },
  sms: { orders: false, shipments: false, promotions: false, security: true }
};

const getHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const UsersProvider: React.FC<{ children: React.ReactNode; isLoggedIn?: boolean }> = ({ children, isLoggedIn }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [notificationPref, setNotificationPref] = useState<NotificationPreference>(initialNotifications);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUsers = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/users?limit=1000`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchActivities = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/users/activity/logs`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        const formatted = data.data.map((log: any) => ({
          id: log._id,
          userId: log.userId,
          userName: log.userName,
          action: log.action,
          timestamp: log.timestamp,
          ipAddress: log.ipAddress,
          device: log.device,
          status: log.status,
          category: log.category
        }));
        setActivities(formatted);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };

  const fetchPreferences = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/users/preferences/notifications`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setNotificationPref(data.data);
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchActivities(), fetchPreferences()]);
      setLoading(false);
    };

    const loggedIn = isLoggedIn || localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) {
      loadAll();
    }
  }, [isLoggedIn]);

  const logActivity = (
    userId: string,
    userName: string,
    action: string,
    category: UserActivity['category'],
    status: 'Success' | 'Failed' = 'Success'
  ) => {
    // Backend logs activities automatically, but keeping this local hook for immediate feedback/fallback
    const newAct: UserActivity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      userName,
      action,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
      device: 'Admin Dashboard / Web',
      status,
      category
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdDate' | 'orders' | 'spent'>): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (data.success) {
        await Promise.all([fetchUsers(), fetchActivities()]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error creating user:', err);
      return false;
    }
  };

  const updateUser = async (id: string, updatedFields: Partial<User>): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        await Promise.all([fetchUsers(), fetchActivities()]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating user:', err);
      return false;
    }
  };

  const blockUser = async (id: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/users/${id}/block`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        await Promise.all([fetchUsers(), fetchActivities()]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error blocking user:', err);
      return false;
    }
  };

  const unblockUser = async (id: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/users/${id}/unblock`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        await Promise.all([fetchUsers(), fetchActivities()]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error unblocking user:', err);
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        await Promise.all([fetchUsers(), fetchActivities()]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting user:', err);
      return false;
    }
  };

  const bulkActivate = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => 
        fetch(`${API_URL}/users/${id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ status: 'Active' })
        })
      ));
      await Promise.all([fetchUsers(), fetchActivities()]);
    } catch (err) {
      console.error('Error bulk activating:', err);
    }
  };

  const bulkDeactivate = async (ids: string[], reason?: string) => {
    try {
      const blockReasonText = reason || 'Bulk block by administrator';
      await Promise.all(ids.map(id => 
        fetch(`${API_URL}/users/${id}/block`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ reason: blockReasonText })
        })
      ));
      await Promise.all([fetchUsers(), fetchActivities()]);
    } catch (err) {
      console.error('Error bulk deactivating:', err);
    }
  };

  const bulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => 
        fetch(`${API_URL}/users/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        })
      ));
      await Promise.all([fetchUsers(), fetchActivities()]);
    } catch (err) {
      console.error('Error bulk deleting:', err);
    }
  };

  const saveNotificationPreferences = async (pref: NotificationPreference): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/users/preferences/notifications`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(pref)
      });
      const data = await res.json();
      if (data.success) {
        setNotificationPref(data.data);
        await fetchActivities();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      return false;
    }
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        activities,
        notificationPref,
        loading,
        addUser,
        updateUser,
        deleteUser,
        blockUser,
        unblockUser,
        bulkActivate,
        bulkDeactivate,
        bulkDelete,
        saveNotificationPreferences,
        logActivity,
        fetchUsers,
        fetchActivities,
        fetchPreferences
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
