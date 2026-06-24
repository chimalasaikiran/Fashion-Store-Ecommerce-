import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, type User } from './UsersContext';
import { formatCurrency } from '../../data/mockDb';

export default function UserList() {
  const navigate = useNavigate();
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    bulkActivate, 
    bulkDeactivate, 
    bulkDelete 
  } = useUsers();

  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Blocked' | 'Pending'>('All');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Customer' | 'Admin' | 'Super Admin'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'createdDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkConfirmAction, setBulkConfirmAction] = useState<'activate' | 'deactivate' | 'delete' | null>(null);

  
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<User['role']>('Customer');
  const [formStatus, setFormStatus] = useState<User['status']>('Active');
  const [formError, setFormError] = useState('');

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  
  useEffect(() => {
    if (editingUser) {
      setFormName(editingUser.name);
      setFormEmail(editingUser.email);
      setFormPhone(editingUser.phone);
      setFormRole(editingUser.role);
      setFormStatus(editingUser.status);
    }
  }, [editingUser]);

  
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.includes(query) ||
      user.id.includes(query);

    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let fieldA: any = a[sortBy];
    let fieldB: any = b[sortBy];

    if (sortBy === 'name') {
      fieldA = a.name.toLowerCase();
      fieldB = b.name.toLowerCase();
    } else if (sortBy === 'createdDate') {
      fieldA = new Date(a.createdDate).getTime();
      fieldB = new Date(b.createdDate).getTime();
    }

    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  
  const totalItems = sortedUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentIds = paginatedUsers.map(u => u.id);
      setSelectedUserIds(prev => Array.from(new Set([...prev, ...currentIds])));
    } else {
      const currentIds = paginatedUsers.map(u => u.id);
      setSelectedUserIds(prev => prev.filter(id => !currentIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, id]);
    } else {
      setSelectedUserIds(prev => prev.filter(item => item !== id));
    }
  };

  
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Orders', 'Spent', 'Status', 'Role', 'Created Date'];
    const rows = filteredUsers.map(u => [
      u.id,
      u.name,
      u.email,
      u.phone,
      u.orders,
      `₹${u.spent.toFixed(2)}`,
      u.status,
      u.role,
      u.createdDate
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fashion_store_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  
  const validateForm = () => {
    if (!formName.trim()) {
      setFormError('Name is required');
      return false;
    }
    if (!formEmail.trim() || !/\S+@\S+\.\S+/.test(formEmail)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    if (!formPhone.trim()) {
      setFormError('Phone number is required');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    addUser({
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      status: formStatus
    });

    
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('Customer');
    setFormStatus('Active');
    setIsCreateModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !validateForm()) return;

    updateUser(editingUser.id, {
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      status: formStatus
    });

    setEditingUser(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteUser(deleteConfirmId);
      setSelectedUserIds(prev => prev.filter(id => id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const handleBulkAction = () => {
    if (bulkConfirmAction === 'activate') {
      bulkActivate(selectedUserIds);
    } else if (bulkConfirmAction === 'deactivate') {
      bulkDeactivate(selectedUserIds);
    } else if (bulkConfirmAction === 'delete') {
      bulkDelete(selectedUserIds);
      setSelectedUserIds([]);
    }
    setBulkConfirmAction(null);
  };

  
  const activeCount = users.filter(u => u.status === 'Active').length;
  const blockedCount = users.filter(u => u.status === 'Blocked').length;
  const totalCount = users.length;

  const totalStat = totalCount;
  const activeStat = activeCount;
  const blockedStat = blockedCount;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const newStat = users.filter(u => {
    const date = new Date(u.createdDate);
    return !isNaN(date.getTime()) && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16] flex items-center gap-2">
            User Management
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Manage customer accounts and administrative activities across all regions.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F6F6F6] text-[#111E16] border border-[#BEC9BE] rounded-lg text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#111E16]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>
          
          <button
            onClick={() => {
              setFormName('');
              setFormEmail('');
              setFormPhone('');
              setFormRole('Customer');
              setFormStatus('Active');
              setFormError('');
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-sm font-bold shadow-xs hover:shadow-md cursor-pointer transition-all"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
            </svg>
            <span>Create User</span>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-[#00522E]/10 rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-[#E8F8E9] text-[#00522E]">
              +4.5%
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Customers</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111E16] tracking-tight block">{totalStat.toLocaleString()}</span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-[#00522E]/10 rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#00522E]">Active Now</span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Active</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111E16] tracking-tight block">{activeStat.toLocaleString()}</span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-red-50 rounded-lg flex items-center justify-center text-[#BA1A1A]">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#BA1A1A]">Review Required</span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Blocked</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111E16] tracking-tight block">{blockedStat.toLocaleString()}</span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-[#00522E]/10 rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#00522E]">Growth Focus</span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">New This Month</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-[#111E16] tracking-tight block">+{newStat.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border border-[#BEC9BE] rounded-t-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#6F7A70]">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#E8F8E9] text-sm text-[#111E16] placeholder-[#6F7A70] rounded-lg pl-10 pr-4 py-2 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
            />
          </div>

          {}
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
              <option value="Pending">Pending</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6F7A70]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          {}
          <div className="relative w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
            >
              <option value="All">All Roles</option>
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6F7A70]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold text-[#6F7A70] w-full md:w-auto text-right">
          Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} matches
        </div>
      </div>

      {}
      <div className="bg-white border-x border-b border-[#BEC9BE] rounded-b-xl shadow-xs overflow-hidden relative min-h-[300px]">
        {}
        {selectedUserIds.length > 0 && (
          <div className="absolute top-0 inset-x-0 h-14 bg-[#E8F8E9] z-20 flex items-center justify-between px-6 border-b border-[#BEC9BE] animate-slide-in">
            <span className="text-sm font-bold text-[#00522E]">
              {selectedUserIds.length} user{selectedUserIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBulkConfirmAction('activate')}
                className="px-3.5 py-1.5 bg-white hover:bg-[#F6F6F6] text-[#00522E] border border-[#BEC9BE] rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Activate Selected
              </button>
              <button
                onClick={() => setBulkConfirmAction('deactivate')}
                className="px-3.5 py-1.5 bg-white hover:bg-[#F6F6F6] text-amber-700 border border-[#BEC9BE] rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Block Selected
              </button>
              <button
                onClick={() => setBulkConfirmAction('delete')}
                className="px-3.5 py-1.5 bg-[#BA1A1A] hover:bg-[#930006] text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedUserIds([])}
                className="text-xs font-bold text-[#6F7A70] hover:text-[#111E16] ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm min-w-[1000px]">
            <thead>
              <tr className="bg-[#E8F8E9]/50 text-[#6F7A70] border-b border-[#BEC9BE]/60 select-none">
                <th className="py-4 px-6 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUserIds.includes(u.id))}
                    onChange={handleSelectAll}
                    className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E]"
                  />
                </th>
                <th 
                  className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E]"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer</span>
                    {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Contact</th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Role</th>
                <th 
                  className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E] text-center"
                  onClick={() => toggleSort('orders')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Orders</span>
                    {sortBy === 'orders' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th 
                  className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E] text-right"
                  onClick={() => toggleSort('spent')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Spent</span>
                    {sortBy === 'spent' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Status</th>
                <th 
                  className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E]"
                  onClick={() => toggleSort('createdDate')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Created Date</span>
                    {sortBy === 'createdDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="py-4 px-6 font-bold text-xs tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#BEC9BE]/30">
              {isLoading ? (
                
                Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="py-4 px-6 text-center">
                      <div className="w-4 h-4 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="w-24 h-4 bg-gray-200 rounded"></div>
                          <div className="w-12 h-3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="w-36 h-3 bg-gray-200 rounded"></div>
                        <div className="w-24 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-8 h-4 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="w-14 h-4 bg-gray-200 rounded ml-auto"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="w-16 h-8 bg-gray-200 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedUsers.length === 0 ? (
                
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-16 h-16 bg-[#00522E]/10 rounded-full flex items-center justify-center text-[#00522E] mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-[#111E16]">No users found</h4>
                      <p className="text-sm text-[#6F7A70]">
                        We couldn't find any users matching your filters or search query "{searchQuery}".
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('All');
                          setRoleFilter('All');
                        }}
                        className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // User rows
                paginatedUsers.map((user) => {
                  const isChecked = selectedUserIds.includes(user.id);
                  const firstInitial = user.name.charAt(0);
                  
                  // Status badge styles
                  let badgeClass = '';
                  if (user.status === 'Active') badgeClass = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                  else if (user.status === 'Blocked') badgeClass = 'bg-red-50 border-red-200 text-red-800';
                  else badgeClass = 'bg-amber-50 border-amber-200 text-amber-800';

                  return (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-[#E8F8E9]/20 transition-colors duration-100 ${isChecked ? 'bg-[#00522E]/5' : ''}`}
                    >
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(user.id, e.target.checked)}
                          className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E]"
                        />
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-[#00522E] bg-[#E8F8E9] border border-[#BEC9BE]/60 select-none">
                            {firstInitial}
                          </span>
                          <div>
                            <span 
                              onClick={() => navigate(`details/${user.id}`)}
                              className="font-bold text-[#111E16] hover:text-[#00522E] cursor-pointer hover:underline"
                            >
                              {user.name}
                            </span>
                            <span className="text-xs text-[#6F7A70] block">ID: #{user.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-xs space-y-0.5">
                          <span className="text-[#111E16] block font-medium">{user.email}</span>
                          <span className="text-[#6F7A70] block">{user.phone}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs font-semibold text-[#111E16]">
                        {user.role}
                      </td>

                      {/* Orders */}
                      <td className="py-4 px-4 whitespace-nowrap text-center font-mono font-bold text-[#111E16]">
                        {user.orders}
                      </td>

                      {/* Spent */}
                      <td className="py-4 px-4 whitespace-nowrap text-right font-mono font-bold text-[#00522E]">
                        {formatCurrency(user.spent)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                          {user.status}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-[#111E16] font-medium">
                        {user.createdDate}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 whitespace-nowrap text-right text-xs font-bold">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`details/${user.id}`)}
                            title="View details"
                            className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded-lg transition-all cursor-pointer"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditModalOpen(true);
                            }}
                            title="Edit profile"
                            className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded-lg transition-all cursor-pointer"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(user.id)}
                            title="Delete account"
                            className="p-1.5 text-[#6F7A70] hover:text-[#BA1A1A] hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        <div className="bg-white border-t border-[#BEC9BE] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className={`flex items-center gap-1.5 px-4 py-2 border border-[#BEC9BE] rounded-lg text-sm font-semibold transition-all ${
              currentPage === 1 || isLoading
                ? 'opacity-40 cursor-not-allowed text-[#6F7A70]'
                : 'text-[#111E16] hover:bg-[#F6F6F6] cursor-pointer'
            }`}
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#00522E] text-white shadow-xs'
                      : 'text-[#111E16] hover:bg-[#F6F6F6]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || isLoading}
            className={`flex items-center gap-1.5 px-4 py-2 border border-[#BEC9BE] rounded-lg text-sm font-semibold transition-all ${
              currentPage === totalPages || isLoading
                ? 'opacity-40 cursor-not-allowed text-[#6F7A70]'
                : 'text-[#111E16] hover:bg-[#F6F6F6] cursor-pointer'
            }`}
          >
            <span>Next</span>
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-md shadow-xl animate-scale-up overflow-hidden">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00522E]">Create New User Account</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-[#BA1A1A] border border-red-200 text-xs font-bold rounded-lg p-3">
                  {formError}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +1 555-0100"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">System Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Initial Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#BEC9BE]/50 flex items-center justify-end gap-3 select-none">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] text-[#111E16] rounded-lg text-sm font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-sm font-bold cursor-pointer transition-all"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-md shadow-xl animate-scale-up overflow-hidden">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00522E]">Modify User Profile</h3>
              <button 
                onClick={() => {
                  setEditingUser(null);
                  setIsEditModalOpen(false);
                }}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-[#BA1A1A] border border-red-200 text-xs font-bold rounded-lg p-3">
                  {formError}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +1 555-0100"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">System Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111E16] uppercase tracking-wider block">Account Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#F6F6F6] text-sm text-[#111E16] rounded-xl px-4 py-2.5 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#BEC9BE]/50 flex items-center justify-end gap-3 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] text-[#111E16] rounded-lg text-sm font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-sm font-bold cursor-pointer transition-all"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl w-full max-w-sm shadow-xl p-6 space-y-4">
            <h4 className="text-lg font-bold text-[#BA1A1A]">Delete User Account?</h4>
            <p className="text-sm text-[#6F7A70]">
              Are you sure you want to permanently delete this user? This action is destructive and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 select-none">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] text-[#111E16] rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                No, Keep
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#930006] text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM BULK ACTION DIALOG */}
      {bulkConfirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl w-full max-w-sm shadow-xl p-6 space-y-4">
            <h4 className="text-lg font-bold text-[#111E16] capitalize">
              {bulkConfirmAction} {selectedUserIds.length} Account{selectedUserIds.length > 1 ? 's' : ''}?
            </h4>
            <p className="text-sm text-[#6F7A70]">
              Are you sure you want to perform this operation on all selected user accounts?
            </p>
            <div className="flex items-center justify-end gap-3 select-none">
              <button
                onClick={() => setBulkConfirmAction(null)}
                className="px-4 py-2 bg-white border border-[#BEC9BE] rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  bulkConfirmAction === 'delete' 
                    ? 'bg-[#BA1A1A] hover:bg-[#930006] text-white' 
                    : 'bg-[#00522E] hover:bg-[#003B21] text-white'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
