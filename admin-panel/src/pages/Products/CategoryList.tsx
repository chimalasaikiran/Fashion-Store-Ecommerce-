import React, { useState, useEffect } from 'react';
import { useProducts, type Category } from './ProductsContext';
import { useRoleAccess } from '../../context/RoleAccessContext';

export default function CategoryList() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useProducts();
  const { hasPermission, activeRole } = useRoleAccess();

  const canCreate = activeRole === 'Super Admin' || hasPermission('products', 'Category List', 'create');
  const canEdit = activeRole === 'Super Admin' || hasPermission('products', 'Category List', 'edit');
  const canDelete = activeRole === 'Super Admin' || hasPermission('products', 'Category List', 'delete');

  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Disabled'>('All');
  
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<Category['status']>('Active');
  const [formError, setFormError] = useState('');

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  
  useEffect(() => {
    if (editingCategory) {
      setFormName(editingCategory.name);
      setFormDesc(editingCategory.description);
      setFormStatus(editingCategory.status);
    }
  }, [editingCategory]);

  
  const getProductCount = (categoryName: string) => {
    return products.filter(p => p.category.toLowerCase() === categoryName.toLowerCase()).length;
  };

  
  const activeCategories = categories.filter(c => c.status !== 'Archived');

  
  const filteredCategories = activeCategories.filter((category) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      category.name.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || category.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  
  const validateForm = () => {
    if (!formName.trim()) {
      setFormError('Category name is required.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    addCategory({
      name: formName,
      description: formDesc,
      status: formStatus
    });

    
    setFormName('');
    setFormDesc('');
    setFormStatus('Active');
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !validateForm()) return;

    updateCategory(editingCategory.id, {
      name: formName,
      description: formDesc,
      status: formStatus
    });

    setEditingCategory(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteCategory(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleToggleStatus = (category: Category) => {
    const nextStatus: Category['status'] = category.status === 'Active' ? 'Disabled' : 'Active';
    updateCategory(category.id, { status: nextStatus });
  };

  
  const totalCategoryCount = activeCategories.length;
  const activeCategoryCount = activeCategories.filter(c => c.status === 'Active').length;
  const disabledCategoryCount = activeCategories.filter(c => c.status === 'Disabled').length;

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16]">
            Category Management
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Organize catalog structures, enable/disable product segments, and track department coverage.
          </p>
        </div>
        
        <div>
          {canCreate && (
            <button
              onClick={() => {
                setFormName('');
                setFormDesc('');
                setFormStatus('Active');
                setFormError('');
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-sm font-bold shadow-xs hover:shadow-md cursor-pointer transition-all"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
              </svg>
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#00522E]/10 rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E8F8E9] text-[#00522E] border border-[#BEC9BE]/40">Total</span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Categories</span>
            <span className="text-2xl font-extrabold text-[#111E16] block mt-1">{totalCategoryCount}</span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#00522E]/10 rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Live</span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Active</span>
            <span className="text-2xl font-extrabold text-[#111E16] block mt-1">{activeCategoryCount}</span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200">Disabled</span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Disabled</span>
            <span className="text-2xl font-extrabold text-[#111E16] block mt-1">{disabledCategoryCount}</span>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border border-[#BEC9BE] rounded-t-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#6F7A70]">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search category name..."
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
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6F7A70]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold text-[#6F7A70] w-full sm:w-auto text-right">
          Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} matches
        </div>
      </div>

      {}
      <div className="bg-white border-x border-b border-[#BEC9BE] rounded-b-xl shadow-xs overflow-hidden relative min-h-[300px]">
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm min-w-[700px]">
            <thead>
              <tr className="bg-[#E8F8E9]/50 text-[#6F7A70] border-b border-[#BEC9BE]/60 select-none">
                <th className="py-4 px-6 font-bold text-xs tracking-wider uppercase">Category Name</th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Description</th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase text-center">Products Count</th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Status</th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Created / Updated</th>
                <th className="py-4 px-6 font-bold text-xs tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#BEC9BE]/30">
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="w-28 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-48 h-3.5 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-8 h-4 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="w-20 h-3 bg-gray-200 rounded"></div>
                        <div className="w-20 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="w-16 h-8 bg-gray-200 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-16 h-16 bg-[#00522E]/10 rounded-full flex items-center justify-center text-[#00522E] mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-[#111E16]">No categories found</h4>
                      <p className="text-sm text-[#6F7A70]">
                        We couldn't find any categories matching your query "{searchQuery}".
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('All');
                        }}
                        className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => {
                  const prodCount = getProductCount(category.name);
                  
                  
                  const statusBg = category.status === 'Active'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-gray-55 border-gray-200 text-gray-600';

                  return (
                    <tr 
                      key={category.id} 
                      className="hover:bg-[#E8F8E9]/20 transition-colors"
                    >
                      {}
                      <td className="py-4 px-6 font-bold text-[#111E16] whitespace-nowrap">
                        {category.name}
                        <span className="text-xs text-[#6F7A70] block font-normal">ID: {category.id}</span>
                      </td>

                      {}
                      <td className="py-4 px-4 text-[#6F7A70] max-w-xs truncate" title={category.description}>
                        {category.description || <span className="italic text-gray-300">No description provided</span>}
                      </td>

                      {}
                      <td className="py-4 px-4 text-center font-bold text-[#111E16] font-mono">
                        {prodCount}
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(category)}
                          disabled={!canEdit}
                          title={canEdit ? `Click to ${category.status === 'Active' ? 'disable' : 'enable'}` : 'No permission to edit status'}
                          className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border transition-colors ${
                            canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                          } ${statusBg}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                          {category.status}
                        </button>
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-[#111E16]">
                        <div>Created: <span className="font-semibold">{category.createdDate}</span></div>
                        <div className="text-[10px] text-[#6F7A70]">Updated: {category.updatedDate}</div>
                      </td>

                      {}
                      <td className="py-4 px-6 whitespace-nowrap text-right text-xs font-bold">
                        <div className="flex items-center justify-end gap-2">
                          {canEdit && (
                            <button
                              onClick={() => {
                                setEditingCategory(category);
                                setIsEditModalOpen(true);
                              }}
                              title="Edit Category"
                              className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded-lg transition-all cursor-pointer"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => setDeleteConfirmId(category.id)}
                              title="Delete Category"
                              className="p-1.5 text-[#6F7A70] hover:text-[#BA1A1A] hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {}
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

      {}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-md shadow-xl animate-scale-up overflow-hidden">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00522E]">Add Product Category</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-[#BA1A1A] border border-red-200 text-xs font-bold rounded-lg p-3">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Knitwear, Accessories"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of department items..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16] cursor-pointer"
                >
                  <option value="Active">Active (Live in Navigation)</option>
                  <option value="Disabled">Disabled (Hidden in Navigation)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#BEC9BE]/30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] text-[#111E16] text-sm font-semibold rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-sm font-bold rounded-lg cursor-pointer transition-all"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-md shadow-xl animate-scale-up overflow-hidden">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00522E]">Edit Category</h3>
              <button 
                onClick={() => {
                  setEditingCategory(null);
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

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Denim, Tops"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of department items..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16] cursor-pointer"
                >
                  <option value="Active">Active (Live in Navigation)</option>
                  <option value="Disabled">Disabled (Hidden in Navigation)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#BEC9BE]/30">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] text-[#111E16] text-sm font-semibold rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-sm font-bold rounded-lg cursor-pointer transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-sm shadow-xl animate-scale-up overflow-hidden p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-red-50 text-[#BA1A1A] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#111E16]">Delete Category?</h3>
              <p className="text-sm text-[#6F7A70]">
                Are you sure you want to soft-delete this category? Active items matching this category will remain, but the category listing will be archived.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] text-[#111E16] text-sm font-semibold rounded-lg cursor-pointer transition-all w-24"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#930006] text-white text-sm font-bold rounded-lg cursor-pointer transition-all w-24"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
