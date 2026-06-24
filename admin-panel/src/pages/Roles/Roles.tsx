import React, { useState, useEffect } from 'react';
import { useRoleAccess, MODULES_CONFIG, type RolePermissions, type PermissionActions } from '../../context/RoleAccessContext';

const createEmptyPermissions = (allEnabled = false): PermissionActions => ({
  view: allEnabled,
  create: allEnabled,
  edit: allEnabled,
  delete: allEnabled,
  approve: allEnabled,
  export: allEnabled,
});

export default function Roles() {
  const {
    roles,
    rolesLoading,
    rolesError,
    activeRole,
    auditLogs,
    admins,
    loading,
    updateRolePermissions,
    createRole,
    editRoleName,
    duplicateRole,
    deleteRole,
    resetPermissions,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser
  } = useRoleAccess();

  // Selected Tab: permissions or admins
  const [activeTab, setActiveTab] = useState<'permissions' | 'admins'>('permissions');

  // Selected Role in Left Panel (Defaults to the first role or Super Admin)
  const [selectedRoleName, setSelectedRoleName] = useState<string>('Super Admin');
  
  // Search Filters
  const [searchRoleQuery, setSearchRoleQuery] = useState('');
  const [searchPermissionQuery, setSearchPermissionQuery] = useState('');
  const [searchAdminQuery, setSearchAdminQuery] = useState('');

  // Draft Permissions (Permissions in editing state, committed only on save)
  const [draftPermissions, setDraftPermissions] = useState<RolePermissions>({});
  const [isDirty, setIsDirty] = useState(false);

  // Accordion Expand/Collapse State for Modules
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    products: true,
    orders: true,
    shipments: true,
    tickets: true,
    payments: true,
  });

  // Modal Dialogs States
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [pendingRoleSwitch, setPendingRoleSwitch] = useState<string | null>(null);

  // Admin Modals States
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
  const [isDeleteAdminModalOpen, setIsDeleteAdminModalOpen] = useState(false);

  // Form Fields States
  const [createForm, setCreateForm] = useState({ name: '', description: '', copyFrom: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  // Admin Form Fields States
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', role: '', status: 'Active' });
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [deleteAdminId, setDeleteAdminId] = useState<string>('');

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const selectedRole = roles.find((r) => r.name === selectedRoleName) || roles[0];
  const activeRoles = roles.filter((r) => r.status === 'Active');

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync Draft State with Selected Role's saved permissions
  useEffect(() => {
    if (selectedRole) {
      setDraftPermissions(JSON.parse(JSON.stringify(selectedRole.permissions || {})));
      setIsDirty(false);
    }
  }, [selectedRoleName, roles]);

  // Handle Switch Role with dirty check
  const handleSelectRole = (roleName: string) => {
    if (roleName === selectedRoleName) return;
    if (isDirty) {
      setPendingRoleSwitch(roleName);
      setIsDiscardModalOpen(true);
    } else {
      setSelectedRoleName(roleName);
    }
  };

  const confirmDiscardAndSwitch = () => {
    if (pendingRoleSwitch) {
      setSelectedRoleName(pendingRoleSwitch);
      setPendingRoleSwitch(null);
    }
    setIsDiscardModalOpen(false);
  };

  // Check if draft permissions match original permissions
  const handlePermissionChange = (moduleKey: string, subpage: string, action: keyof PermissionActions, checked: boolean) => {
    const updated = { ...draftPermissions };
    if (!updated[moduleKey]) return;

    updated[moduleKey].subpages[subpage] = {
      ...updated[moduleKey].subpages[subpage],
      [action]: checked,
    };

    setDraftPermissions(updated);
    setIsDirty(true);
  };

  // Toggle Entire Module Access
  const handleModuleToggle = (moduleKey: string, checked: boolean) => {
    const updated = { ...draftPermissions };
    if (!updated[moduleKey]) return;

    updated[moduleKey] = {
      ...updated[moduleKey],
      enabled: checked,
    };

    setDraftPermissions(updated);
    setIsDirty(true);
  };

  // Module Level "Select All" permission actions
  const handleSelectAllModule = (moduleKey: string, checked: boolean) => {
    const updated = { ...draftPermissions };
    if (!updated[moduleKey]) return;

    const subConfig = MODULES_CONFIG[moduleKey as keyof typeof MODULES_CONFIG];
    subConfig.subpages.forEach((sub) => {
      updated[moduleKey].subpages[sub] = {
        view: checked,
        create: checked,
        edit: checked,
        delete: checked,
        approve: checked,
        export: checked,
      };
    });

    setDraftPermissions(updated);
    setIsDirty(true);
  };

  // Filtered Lists
  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchRoleQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchRoleQuery.toLowerCase())
  );

  const filteredAdmins = admins.filter((admin) =>
    admin.name.toLowerCase().includes(searchAdminQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchAdminQuery.toLowerCase()) ||
    admin.role.name.toLowerCase().includes(searchAdminQuery.toLowerCase())
  );

  // Actions Trigger Handlers
  const handleSavePermissions = async () => {
    if (selectedRoleName === 'Super Admin') {
      showToast('Super Admin role must retain all system permissions.', 'error');
      setIsSaveModalOpen(false);
      return;
    }
    const success = await updateRolePermissions(selectedRoleName, draftPermissions);
    setIsSaveModalOpen(false);
    if (success) {
      setIsDirty(false);
      showToast(`Permissions updated successfully for ${selectedRoleName}!`, 'success');
    } else {
      showToast('Failed to update permissions.', 'error');
    }
  };

  const handleResetPermissions = async () => {
    const success = await resetPermissions(selectedRoleName);
    setIsResetModalOpen(false);
    if (success) {
      showToast(`Permissions reset to defaults for ${selectedRoleName}.`, 'info');
    } else {
      showToast('Failed to reset permissions.', 'error');
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole.isCustom) {
      showToast('Default system roles cannot be deleted.', 'error');
      setIsDeleteModalOpen(false);
      return;
    }
    const success = await deleteRole(selectedRoleName);
    setIsDeleteModalOpen(false);
    if (success) {
      setSelectedRoleName('Super Admin');
      showToast(`Role ${selectedRoleName} deleted permanently.`, 'success');
    } else {
      showToast('Failed to delete role.', 'error');
    }
  };

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      showToast('Role Name is required.', 'error');
      return;
    }
    if (roles.some((r) => r.name.toLowerCase() === createForm.name.trim().toLowerCase())) {
      showToast('A role with this name already exists.', 'error');
      return;
    }

    const success = await createRole(createForm.name.trim(), createForm.description.trim(), createForm.copyFrom || undefined);
    setIsCreateModalOpen(false);
    if (success) {
      setSelectedRoleName(createForm.name.trim());
      setCreateForm({ name: '', description: '', copyFrom: '' });
      showToast(`Role ${createForm.name} created successfully!`, 'success');
    } else {
      showToast('Failed to create role.', 'error');
    }
  };

  const handleEditRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      showToast('Role Name is required.', 'error');
      return;
    }
    if (
      editForm.name.trim().toLowerCase() !== selectedRoleName.toLowerCase() &&
      roles.some((r) => r.name.toLowerCase() === editForm.name.trim().toLowerCase())
    ) {
      showToast('A role with this name already exists.', 'error');
      return;
    }

    const success = await editRoleName(selectedRoleName, editForm.name.trim(), editForm.description.trim());
    setIsEditModalOpen(false);
    if (success) {
      setSelectedRoleName(editForm.name.trim());
      showToast('Role details updated successfully.', 'success');
    } else {
      showToast('Failed to update role details.', 'error');
    }
  };

  const handleDuplicateClick = async () => {
    const dupName = `${selectedRoleName} Copy`;
    let uniqueName = dupName;
    let counter = 1;
    while (roles.some((r) => r.name.toLowerCase() === uniqueName.toLowerCase())) {
      uniqueName = `${dupName} ${counter}`;
      counter++;
    }
    const success = await duplicateRole(selectedRoleName, uniqueName);
    if (success) {
      setSelectedRoleName(uniqueName);
      showToast(`Duplicated ${selectedRoleName} as ${uniqueName}!`, 'success');
    } else {
      showToast('Failed to duplicate role.', 'error');
    }
  };

  // Admin account CRUD handlers
  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.name.trim() || !adminForm.email.trim() || !adminForm.password) {
      showToast('All fields are required to register an administrator.', 'error');
      return;
    }
    if (!adminForm.role) {
      showToast('Please select a security role for the administrator.', 'error');
      return;
    }

    const res = await createAdminUser({
      name: adminForm.name.trim(),
      email: adminForm.email.trim(),
      password: adminForm.password,
      role: adminForm.role,
      status: adminForm.status
    });

    if (res.success) {
      setIsCreateAdminModalOpen(false);
      setAdminForm({ name: '', email: '', password: '', role: '', status: 'Active' });
      showToast('Administrator registered successfully!', 'success');
    } else {
      showToast(res.message || 'Failed to register administrator.', 'error');
    }
  };

  const handleEditAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.name.trim() || !adminForm.email.trim()) {
      showToast('Name and Email are required.', 'error');
      return;
    }
    if (!adminForm.role) {
      showToast('Please select a security role.', 'error');
      return;
    }

    const payload: any = {
      name: adminForm.name.trim(),
      email: adminForm.email.trim(),
      role: adminForm.role,
      status: adminForm.status
    };

    if (adminForm.password) {
      payload.password = adminForm.password;
    }

    const res = await updateAdminUser(editingAdmin._id, payload);

    if (res.success) {
      setIsEditAdminModalOpen(false);
      setEditingAdmin(null);
      setAdminForm({ name: '', email: '', password: '', role: '', status: 'Active' });
      showToast('Administrator profile updated successfully.', 'success');
    } else {
      showToast(res.message || 'Failed to update administrator.', 'error');
    }
  };

  const handleDeleteAdminConfirm = async () => {
    const res = await deleteAdminUser(deleteAdminId);
    setIsDeleteAdminModalOpen(false);
    if (res.success) {
      showToast('Administrator account deleted permanently.', 'success');
    } else {
      showToast(res.message || 'Failed to delete administrator account.', 'error');
    }
  };

  const toggleModuleExpand = (moduleKey: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }));
  };

  if (loading) {
    return (
      <div className="w-full min-h-[450px] flex items-center justify-center bg-white rounded-2xl border border-[#E0E0E0]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#00522E]/20 border-t-[#00522E] rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#797979]">Loading roles and credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none relative pb-12">
      {/* Toast Alerts */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 bg-white border border-[#BEC9BE] rounded-xl shadow-xl animate-slide-in-right">
          <div
            className={`w-3 h-3 rounded-full ${
              toast.type === 'success' ? 'bg-[#00522E]' : toast.type === 'error' ? 'bg-[#BA1A1A]' : 'bg-[#10B981]'
            }`}
          ></div>
          <span className="text-sm font-bold text-[#111E16]">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#242424] flex items-center gap-2">
            Roles & Access Management
          </h2>
          <p className="text-sm text-[#797979] mt-1">
            Configure security credentials, user roles, permission limits, and active admin scopes.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-[#E0E0E0] select-none">
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'permissions'
              ? 'border-[#00522E] text-[#00522E]'
              : 'border-transparent text-[#797979] hover:text-[#242424]'
          }`}
        >
          Role Permissions Matrix
        </button>
        <button
          onClick={() => {
            setActiveTab('admins');
            // Do not auto-populate default role to force explicit selection and allow validation
          }}
          className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'admins'
              ? 'border-[#00522E] text-[#00522E]'
              : 'border-transparent text-[#797979] hover:text-[#242424]'
          }`}
        >
          Admin Accounts & Assignments
        </button>
      </div>

      {/* TAB 1: PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: Roles List (col-span 4) */}
          <div className="lg:col-span-4 bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-sm flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#242424] uppercase tracking-wider">Access Roles ({roles.length})</h3>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-3 py-1.5 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Create Role</span>
              </button>
            </div>

            {/* Search Roles */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#797979]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search roles..."
                value={searchRoleQuery}
                onChange={(e) => setSearchRoleQuery(e.target.value)}
                className="w-full bg-[#F6F6F6] text-xs text-[#242424] placeholder-[#797979] rounded-lg pl-9 pr-3 py-2 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all"
              />
            </div>

            {/* Roles List */}
            <div className="flex flex-col gap-1 max-h-[480px] overflow-y-auto pr-1">
              {filteredRoles.map((role) => {
                const isActiveSim = activeRole === role.name;
                const isSelected = selectedRoleName === role.name;
                return (
                  <div
                    key={role.name}
                    onClick={() => handleSelectRole(role.name)}
                    className={`group p-3 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-[#00522E]/5 border-[#00522E] text-[#00522E]'
                        : 'border-transparent hover:bg-[#F6F6F6] text-[#797979]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-[#242424] group-hover:text-[#00522E] transition-colors flex items-center gap-1.5">
                        {role.name}
                        {role.isCustom && (
                          <span className="text-[9px] font-bold bg-[#00522E]/10 text-[#00522E] px-1.5 py-0.5 rounded border border-[#00522E]/20 uppercase">
                            Custom
                          </span>
                        )}
                      </span>
                      {isActiveSim && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-[#00522E] bg-[#E2F2E3] px-1.5 py-0.5 rounded-full border border-[#00522E]/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00522E]"></span>
                          ACTIVE USER
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#797979] break-words">
                      {role.description}
                    </p>
                  </div>
                );
              })}
              {filteredRoles.length === 0 && (
                <div className="text-center py-8 text-xs text-[#797979]">No roles found matching query.</div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Permission Matrix (col-span 8) */}
          <div className="lg:col-span-8 space-y-6 animate-fade-in">
            <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Header controls for selected role */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E0E0] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-[#242424]">{selectedRole?.name} Permissions</h3>
                    {selectedRole?.isCustom ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditForm({ name: selectedRole.name, description: selectedRole.description });
                            setIsEditModalOpen(true);
                          }}
                          className="text-xs font-bold text-[#00522E] hover:underline"
                        >
                          Edit Details
                        </button>
                        <span className="text-[#E0E0E0]">|</span>
                        <button
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="text-xs font-bold text-[#BA1A1A] hover:underline"
                        >
                          Delete Role
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-[#797979] uppercase tracking-wider bg-gray-100 border border-gray-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        SYSTEM STANDARD ROLE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#797979] max-w-lg">{selectedRole?.description}</p>
                </div>

                {/* Actions: Save, Reset, Duplicate */}
                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={handleDuplicateClick}
                    className="px-3 py-2 bg-white hover:bg-[#F6F6F6] text-[#242424] border border-[#E0E0E0] rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    Duplicate Role
                  </button>
                  <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="px-3 py-2 bg-[#F6F6F6] hover:bg-gray-200 text-[#797979] rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                  <button
                    onClick={() => setIsSaveModalOpen(true)}
                    disabled={!isDirty || selectedRoleName === 'Super Admin'}
                    className={`px-4 py-2 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer ${
                      isDirty && selectedRoleName !== 'Super Admin'
                        ? 'bg-[#00522E] hover:bg-[#003B21]'
                        : 'bg-gray-300 cursor-not-allowed opacity-60'
                    }`}
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Permission Search and Filter */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#797979]">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search specific modules or sub-permissions..."
                  value={searchPermissionQuery}
                  onChange={(e) => setSearchPermissionQuery(e.target.value)}
                  className="w-full bg-[#E8F2ED]/30 text-xs text-[#242424] placeholder-[#797979] rounded-xl pl-10 pr-4 py-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              {/* ACCORDION MODULES CONTAINER */}
              <div className="space-y-4">
                {Object.entries(MODULES_CONFIG).map(([moduleKey, config]) => {
                  const isExpanded = expandedModules[moduleKey];
                  const draftMod = draftPermissions[moduleKey];
                  if (!draftMod) return null;

                  // Filter subpages based on query
                  const filteredSubpages = config.subpages.filter((sub) =>
                    sub.toLowerCase().includes(searchPermissionQuery.toLowerCase()) ||
                    config.label.toLowerCase().includes(searchPermissionQuery.toLowerCase())
                  );

                  if (filteredSubpages.length === 0) return null;

                  const isAllSelected = filteredSubpages.every((sub) => {
                    const perm = draftMod.subpages[sub];
                    return perm && perm.view && perm.create && perm.edit && perm.delete && perm.approve && perm.export;
                  });

                  return (
                    <div key={moduleKey} className="border border-[#E0E0E0] rounded-xl overflow-hidden shadow-xs">
                      
                      {/* Module Title Accordion Header */}
                      <div className="bg-[#F6F6F6] px-4 py-3 flex items-center justify-between border-b border-[#E0E0E0]">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleModuleExpand(moduleKey)}
                            className="p-1 rounded-md hover:bg-gray-200 text-[#797979] cursor-pointer"
                          >
                            <svg
                              className={`w-4 h-4 transform transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="2.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <span className="text-xs sm:text-sm font-bold text-[#242424]">{config.label}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Select All */}
                          {draftMod.enabled && (
                            <label className="flex items-center gap-1.5 text-xs text-[#797979] font-medium cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isAllSelected}
                                disabled={selectedRoleName === 'Super Admin'}
                                onChange={(e) => handleSelectAllModule(moduleKey, e.target.checked)}
                                className="rounded border-gray-300 text-[#00522E] focus:ring-[#00522E] cursor-pointer"
                              />
                              <span className="hidden sm:inline">Select All</span>
                            </label>
                          )}

                          {/* Module Enable/Disable Toggle */}
                          <label className="flex items-center gap-1.5 text-xs text-[#242424] font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={draftMod.enabled}
                              disabled={selectedRoleName === 'Super Admin'}
                              onChange={(e) => handleModuleToggle(moduleKey, e.target.checked)}
                              className="rounded border-gray-300 text-[#00522E] focus:ring-[#00522E] cursor-pointer"
                            />
                            <span className="text-[#00522E]">ENABLE</span>
                          </label>
                        </div>
                      </div>

                      {/* Accordion Content Table */}
                      {isExpanded && (
                        <div className="w-full overflow-x-auto">
                          <table className="w-full border-collapse text-left text-xs min-w-[700px]">
                            <thead>
                              <tr className="bg-white border-b border-[#E0E0E0] text-[#797979] sticky top-0 z-10">
                                <th className="py-2.5 px-4 font-bold text-[10px] tracking-wider uppercase w-1/3">Subpage / Feature</th>
                                <th className="py-2.5 px-3 font-bold text-[10px] tracking-wider uppercase text-center w-12">View</th>
                                <th className="py-2.5 px-3 font-bold text-[10px] tracking-wider uppercase text-center w-12">Create</th>
                                <th className="py-2.5 px-3 font-bold text-[10px] tracking-wider uppercase text-center w-12">Edit</th>
                                <th className="py-2.5 px-3 font-bold text-[10px] tracking-wider uppercase text-center w-12">Delete</th>
                                <th className="py-2.5 px-3 font-bold text-[10px] tracking-wider uppercase text-center w-12">Approve</th>
                                <th className="py-2.5 px-3 font-bold text-[10px] tracking-wider uppercase text-center w-12">Export</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E0E0E0]/60">
                              {filteredSubpages.map((sub) => {
                                const actions = draftMod.subpages[sub] || createEmptyPermissions(false);
                                const isModuleActive = draftMod.enabled;

                                const renderCheckbox = (action: keyof PermissionActions) => {
                                  const checked = actions[action];
                                  return (
                                    <td key={action} className="py-3 px-3 text-center">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        disabled={!isModuleActive || selectedRoleName === 'Super Admin'}
                                        onChange={(e) => handlePermissionChange(moduleKey, sub, action, e.target.checked)}
                                        className={`rounded border-gray-300 text-[#00522E] focus:ring-[#00522E] ${
                                          isModuleActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                        }`}
                                      />
                                    </td>
                                  );
                                };

                                return (
                                  <tr
                                    key={sub}
                                    className={`hover:bg-[#F6F6F6]/50 transition-colors ${
                                      isModuleActive ? 'text-[#242424]' : 'text-gray-400 bg-gray-50/50'
                                    }`}
                                  >
                                    {/* Subpage Name Label */}
                                    <td className="py-3 px-4 font-bold">
                                      <div className="flex flex-col">
                                        <span>{sub}</span>
                                        {!isModuleActive && (
                                          <span className="text-[9px] text-[#BA1A1A] font-semibold">Module Access Denied</span>
                                        )}
                                      </div>
                                    </td>
                                    
                                    {/* Checkboxes */}
                                    {renderCheckbox('view')}
                                    {renderCheckbox('create')}
                                    {renderCheckbox('edit')}
                                    {renderCheckbox('delete')}
                                    {renderCheckbox('approve')}
                                    {renderCheckbox('export')}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AUDIT LOGS EXPANDABLE BOX */}
            <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-2">
                <span className="text-xs font-bold text-[#242424] uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#00522E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Audit Log for Permission Changes
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="text-[11px] leading-relaxed text-[#797979] border-b border-gray-100 pb-1.5 flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="font-semibold text-gray-500">{log.action.toUpperCase()}</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p>
                      <span className="font-bold text-[#00522E]">{log.user}</span>: {log.details}
                    </p>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <div className="text-center py-4 text-xs text-[#797979]">No audit events logged yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADMIN ACCOUNTS & ASSIGNMENTS */}
      {activeTab === 'admins' && (
        <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0E0E0] pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#242424]">Admin User Roles & Accounts</h3>
              <p className="text-xs text-[#797979]">Assign security roles, activate/deactivate administrative credentials, and manage credentials.</p>
            </div>
            <button
              onClick={() => {
                setAdminForm({ name: '', email: '', password: '', role: '', status: 'Active' });
                setIsCreateAdminModalOpen(true);
              }}
              className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              <span>Register Admin</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#797979]">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by administrator name, email, or role..."
              value={searchAdminQuery}
              onChange={(e) => setSearchAdminQuery(e.target.value)}
              className="w-full bg-[#E8F2ED]/30 text-xs text-[#242424] placeholder-[#797979] rounded-xl pl-10 pr-4 py-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all"
            />
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto border border-[#E0E0E0] rounded-xl shadow-xs">
            <table className="w-full border-collapse text-left text-xs min-w-[700px]">
              <thead>
                <tr className="bg-[#F6F6F6] text-[#797979] border-b border-[#E0E0E0]">
                  <th className="py-3 px-4 font-bold text-[10px] tracking-wider uppercase w-1/4">Name</th>
                  <th className="py-3 px-4 font-bold text-[10px] tracking-wider uppercase w-1/4">Email</th>
                  <th className="py-3 px-4 font-bold text-[10px] tracking-wider uppercase text-center w-36">Role</th>
                  <th className="py-3 px-4 font-bold text-[10px] tracking-wider uppercase text-center w-28">Status</th>
                  <th className="py-3 px-4 font-bold text-[10px] tracking-wider uppercase w-40">Last Login</th>
                  <th className="py-3 px-4 font-bold text-[10px] tracking-wider uppercase text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]/60">
                {filteredAdmins.map((admin) => {
                  let roleBadgeColor = 'bg-gray-100 text-gray-700 border-gray-200';
                  if (admin.role?.name === 'Super Admin') roleBadgeColor = 'bg-[#00522E]/10 text-[#00522E] border-[#00522E]/20';
                  else if (admin.role?.name === 'Admin') roleBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                  else if (admin.role?.name === 'Product Manager') roleBadgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
                  else if (admin.role?.name === 'Order Manager') roleBadgeColor = 'bg-orange-50 text-orange-700 border-orange-200';
                  else if (admin.role?.name === 'Customer Support') roleBadgeColor = 'bg-teal-50 text-teal-700 border-teal-200';

                  return (
                    <tr key={admin._id} className="hover:bg-[#F6F6F6]/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#242424]">{admin.name}</td>
                      <td className="py-3.5 px-4 text-[#797979]">{admin.email}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${roleBadgeColor}`}>
                          {admin.role?.name || 'No Role Assigned'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          admin.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {admin.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#797979]">
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingAdmin(admin);
                            setAdminForm({
                              name: admin.name,
                              email: admin.email,
                              password: '', // Leave blank to not change password
                              role: admin.role?._id || '',
                              status: admin.status
                            });
                            setIsEditAdminModalOpen(true);
                          }}
                          className="text-xs font-bold text-[#00522E] hover:underline mr-3 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleteAdminId(admin._id);
                            setIsDeleteAdminModalOpen(true);
                          }}
                          className="text-xs font-bold text-[#BA1A1A] hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-xs text-[#797979]">No administrator accounts found matching query.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODALS */}
      
      {/* 1. SAVE CONFIRM */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-[#00522E]/10 border border-[#00522E]/20 text-[#00522E] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-base text-[#242424]">Save Permission Changes?</h4>
              <p className="text-xs text-[#797979]">
                This will immediately update security configurations. Users with the role <span className="font-bold text-[#00522E]">"{selectedRoleName}"</span> will experience modified permissions immediately.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={handleSavePermissions}
                className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Yes, Save Changes
              </button>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-4 py-2 bg-white text-[#242424] border border-[#E0E0E0] text-xs font-bold rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. RESET CONFIRM */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-[#BA1A1A]/10 border border-[#BA1A1A]/20 text-[#BA1A1A] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l-3 3m3-3l3 3" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-base text-[#242424]">Reset to Defaults?</h4>
              <p className="text-xs text-[#797979]">
                Are you sure you want to revert <span className="font-bold text-[#00522E]">"{selectedRoleName}"</span> permissions? Any custom changes made will be lost.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={handleResetPermissions}
                className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#930006] text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Yes, Reset Revert
              </button>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 bg-white text-[#242424] border border-[#E0E0E0] text-xs font-bold rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. DELETE CONFIRM */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-[#BA1A1A]/10 border border-[#BA1A1A]/20 text-[#BA1A1A] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-base text-[#242424]">Delete Custom Role?</h4>
              <p className="text-xs text-[#797979]">
                Are you sure you want to delete the role <span className="font-bold text-[#BA1A1A]">"{selectedRoleName}"</span> permanently? Users currently assigned to this role will default to Super Admin scopes.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={handleDeleteRole}
                className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#930006] text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Yes, Delete Permanently
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-white text-[#242424] border border-[#E0E0E0] text-xs font-bold rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DISCARD CHANGES CONFIRM */}
      {isDiscardModalOpen && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-[#BA1A1A]/10 border border-[#BA1A1A]/20 text-[#BA1A1A] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-base text-[#242424]">Unsaved Modifications!</h4>
              <p className="text-xs text-[#797979]">
                You have unsaved changes to the current permission matrix. Switching to another role will discard these changes.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={confirmDiscardAndSwitch}
                className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#930006] text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Discard & Switch
              </button>
              <button
                onClick={() => {
                  setPendingRoleSwitch(null);
                  setIsDiscardModalOpen(false);
                }}
                className="px-4 py-2 bg-white text-[#242424] border border-[#E0E0E0] text-xs font-bold rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CREATE ROLE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E0E0E0] pb-2">
              <h3 className="text-sm font-bold text-[#242424] uppercase tracking-wider">Create Custom Security Role</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#797979] hover:bg-[#F6F6F6] p-1 rounded-full cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateRoleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marketing Manager"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Description</label>
                <textarea
                  placeholder="Describe operations allowed under this role..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all h-20 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Copy Permissions From (Optional)</label>
                <select
                  value={createForm.copyFrom}
                  onChange={(e) => setCreateForm({ ...createForm, copyFrom: e.target.value })}
                  className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none cursor-pointer"
                >
                  <option value="">Blank (All access denied by default)</option>
                  {roles.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-[#E0E0E0]/60">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-white text-[#242424] border border-[#E0E0E0] text-xs font-bold rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  Create Security Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT ROLE DETAILS MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E0E0E0] pb-2">
              <h3 className="text-sm font-bold text-[#242424] uppercase tracking-wider">Edit Role Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#797979] hover:bg-[#F6F6F6] p-1 rounded-full cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditRoleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Role Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-[#E0E0E0]/60">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-white text-[#242424] border border-[#E0E0E0] text-xs font-bold rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. REGISTER ADMIN USER MODAL */}
      {isCreateAdminModalOpen && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E0E0E0] pb-2">
              <h3 className="text-sm font-bold text-[#242424] uppercase tracking-wider">Register Administrator</h3>
              <button
                onClick={() => setIsCreateAdminModalOpen(false)}
                className="text-[#797979] hover:bg-[#F6F6F6] p-1 rounded-full cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel K."
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sam@company.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Assigned Role</label>
                  <select
                    required
                    value={adminForm.role}
                    onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                    className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none cursor-pointer"
                  >
                    <option value="">Select a Role</option>
                    {rolesLoading ? (
                      <option disabled>Loading roles...</option>
                    ) : rolesError ? (
                      <option disabled className="text-[#BA1A1A]">Error: {rolesError}</option>
                    ) : (
                      activeRoles.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Initial Status</label>
                  <select
                    value={adminForm.status}
                    onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value as any })}
                    className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-[#E0E0E0]/60">
                <button
                  type="button"
                  onClick={() => setIsCreateAdminModalOpen(false)}
                  className="px-4 py-2 bg-white text-[#242424] border border-[#E0E0E0] text-xs font-bold rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  Register Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. EDIT ADMIN USER MODAL */}
      {isEditAdminModalOpen && editingAdmin && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E0E0E0] pb-2">
              <h3 className="text-sm font-bold text-[#242424] uppercase tracking-wider">Modify Administrator Profile</h3>
              <button
                onClick={() => {
                  setIsEditAdminModalOpen(false);
                  setEditingAdmin(null);
                }}
                className="text-[#797979] hover:bg-[#F6F6F6] p-1 rounded-full cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditAdminSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Full Name</label>
                <input
                  type="text"
                  required
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Email Address</label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Assigned Role</label>
                  <select
                    required
                    value={adminForm.role}
                    onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                    className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none cursor-pointer"
                  >
                    <option value="">Select a Role</option>
                    {rolesLoading ? (
                      <option disabled>Loading roles...</option>
                    ) : rolesError ? (
                      <option disabled className="text-[#BA1A1A]">Error: {rolesError}</option>
                    ) : (
                      activeRoles.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">Account Status</label>
                  <select
                    value={adminForm.status}
                    onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value as any })}
                    className="w-full bg-[#F6F6F6] text-xs text-[#242424] rounded-lg p-2.5 border border-[#E0E0E0] focus:border-[#00522E] focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-[#E0E0E0]/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditAdminModalOpen(false);
                    setEditingAdmin(null);
                  }}
                  className="px-4 py-2 bg-white text-[#242424] border border-[#E0E0E0] text-xs font-bold rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. CONFIRM DELETE ADMIN USER */}
      {isDeleteAdminModalOpen && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 bg-[#BA1A1A]/10 border border-[#BA1A1A]/20 text-[#BA1A1A] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-base text-[#242424]">Delete Administrator Account?</h4>
              <p className="text-xs text-[#797979]">
                Are you sure you want to permanently delete this administrator account? They will lose all access to the admin panel immediately.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={handleDeleteAdminConfirm}
                className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#930006] text-white text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                Yes, Delete Permanently
              </button>
              <button
                onClick={() => setIsDeleteAdminModalOpen(false)}
                className="px-4 py-2 bg-white text-[#242424] border border-[#E0E0E0] text-xs font-bold rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
