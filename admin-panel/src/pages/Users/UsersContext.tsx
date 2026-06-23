import React, { createContext, useContext, useState, useEffect } from 'react';
import { USERS, USER_ACTIVITIES } from '../../data/mockDb';

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
  addUser: (user: Omit<User, 'id' | 'createdDate' | 'orders' | 'spent'>) => void;
  updateUser: (id: string, updatedFields: Partial<User>) => void;
  deleteUser: (id: string) => void;
  bulkActivate: (ids: string[]) => void;
  bulkDeactivate: (ids: string[]) => void;
  bulkDelete: (ids: string[]) => void;
  saveNotificationPreferences: (pref: NotificationPreference) => void;
  logActivity: (userId: string, userName: string, action: string, category: UserActivity['category'], status?: 'Success' | 'Failed') => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

const initialUsers: User[] = USERS as User[];
const initialActivities: UserActivity[] = USER_ACTIVITIES as UserActivity[];

const initialNotifications: NotificationPreference = {
  email: { orders: true, shipments: true, promotions: false, security: true },
  push: { orders: true, shipments: false, promotions: false, security: true },
  sms: { orders: false, shipments: false, promotions: false, security: true }
};

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users_data');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [activities, setActivities] = useState<UserActivity[]>(() => {
    const saved = localStorage.getItem('users_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [notificationPref, setNotificationPref] = useState<NotificationPreference>(() => {
    const saved = localStorage.getItem('users_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  useEffect(() => {
    localStorage.setItem('users_data', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('users_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('users_notifications', JSON.stringify(notificationPref));
  }, [notificationPref]);

  const logActivity = (
    userId: string,
    userName: string,
    action: string,
    category: UserActivity['category'],
    status: 'Success' | 'Failed' = 'Success'
  ) => {
    const newAct: UserActivity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      userName,
      action,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1',
      device: 'Admin Dashboard / Web',
      status,
      category
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const addUser = (userData: Omit<User, 'id' | 'createdDate' | 'orders' | 'spent'>) => {
    const newId = String(Math.floor(10000 + Math.random() * 90000));
    const newUser: User = {
      ...userData,
      id: newId,
      orders: 0,
      spent: 0,
      createdDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      })
    };
    setUsers(prev => [newUser, ...prev]);
    logActivity(newId, newUser.name, `Created user account (${newUser.role})`, 'Profile');
  };

  const updateUser = (id: string, updatedFields: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { ...u, ...updatedFields };
          // Log changes
          if (updatedFields.status && updatedFields.status !== u.status) {
            logActivity(id, u.name, `Changed account status to ${updatedFields.status}`, 'Security');
          } else {
            logActivity(id, u.name, 'Updated profile information', 'Profile');
          }
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (userToDelete) {
      logActivity(id, userToDelete.name, 'Deleted user account permanently', 'Security');
    }
  };

  const bulkActivate = (ids: string[]) => {
    setUsers(prev =>
      prev.map(u => {
        if (ids.includes(u.id)) {
          if (u.status !== 'Active') {
            logActivity(u.id, u.name, 'Activated account (Bulk)', 'Security');
          }
          return { ...u, status: 'Active' };
        }
        return u;
      })
    );
  };

  const bulkDeactivate = (ids: string[]) => {
    setUsers(prev =>
      prev.map(u => {
        if (ids.includes(u.id)) {
          if (u.status !== 'Blocked') {
            logActivity(u.id, u.name, 'Blocked account (Bulk)', 'Security');
          }
          return { ...u, status: 'Blocked' };
        }
        return u;
      })
    );
  };

  const bulkDelete = (ids: string[]) => {
    const deletedUsers = users.filter(u => ids.includes(u.id));
    setUsers(prev => prev.filter(u => !ids.includes(u.id)));
    deletedUsers.forEach(u => {
      logActivity(u.id, u.name, 'Deleted user account permanently (Bulk)', 'Security');
    });
  };

  const saveNotificationPreferences = (pref: NotificationPreference) => {
    setNotificationPref(pref);
    logActivity('admin', 'Admin', 'Updated system notification preferences', 'Security');
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        activities,
        notificationPref,
        addUser,
        updateUser,
        deleteUser,
        bulkActivate,
        bulkDeactivate,
        bulkDelete,
        saveNotificationPreferences,
        logActivity
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
