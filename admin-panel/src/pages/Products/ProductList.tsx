import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, type Product } from './ProductsContext';
import { formatCurrency } from '../../data/mockDb';
import { useRoleAccess } from '../../context/RoleAccessContext';

export default function ProductList() {
  const navigate = useNavigate();
  const { 
    products, 
    categories, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    toggleProductVisibility,
    bulkUpdateVisibility,
    bulkDeleteProducts,
    addToast
  } = useProducts();
  const { hasPermission, activeRole } = useRoleAccess();

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com/api' : 'http://localhost:5000/api');

  const canCreate = activeRole === 'Super Admin' || hasPermission('products', 'Product List', 'create');
  const canEdit = activeRole === 'Super Admin' || hasPermission('products', 'Product List', 'edit');
  const canDelete = activeRole === 'Super Admin' || hasPermission('products', 'Product List', 'delete');
  const canToggleVisibility = activeRole === 'Super Admin' || hasPermission('products', 'Product Show / Hide', 'edit');
  const canBulkToggle = activeRole === 'Super Admin' || hasPermission('products', 'Bulk Product Visibility', 'edit');

  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [visibilityFilter, setVisibilityFilter] = useState<'All' | 'Live' | 'Draft'>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low Stock' | 'Out of Stock' | 'Good Stock'>('All');
  
  const [sortBy, setSortBy] = useState<'name' | 'sku' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkConfirmAction, setBulkConfirmAction] = useState<'live' | 'draft' | 'delete' | null>(null);

  
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formCost, setFormCost] = useState(0);
  const [formStock, setFormStock] = useState(0);
  const [formReorder, setFormReorder] = useState(10);
  const [formImage, setFormImage] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast("Image size must be less than 5MB.", "error");
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/upload/signature`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to get secure upload signature from server.');
      }

      const { signature, timestamp, apiKey, cloudName, folder } = await res.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image to Cloudinary.');
      }

      const uploadData = await uploadRes.json();
      setFormImage(uploadData.secure_url);
      addToast("Image uploaded to Cloudinary successfully!", "success");
    } catch (err: any) {
      console.error("Upload error:", err);
      addToast(err.message || "Failed to upload image.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  
  useEffect(() => {
    if (editingProduct) {
      setFormName(editingProduct.name);
      setFormSku(editingProduct.sku);
      setFormCategory(editingProduct.category);
      setFormPrice(editingProduct.price);
      setFormCost(editingProduct.cost);
      setFormStock(editingProduct.stock);
      setFormReorder(editingProduct.reorderLevel);
      setFormImage(editingProduct.image);
      setFormDesc(editingProduct.description);
    }
  }, [editingProduct]);

  
  useEffect(() => {
    const activeCats = categories.filter(c => c.status === 'Active');
    if (activeCats.length > 0 && !formCategory) {
      setFormCategory(activeCats[0].name);
    }
  }, [categories, isAddModalOpen]);

  
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    const matchesVisibility = visibilityFilter === 'All' || product.status === visibilityFilter;

    let matchesStock = true;
    if (stockFilter === 'Low Stock') {
      matchesStock = product.stock <= product.reorderLevel && product.stock > 0;
    } else if (stockFilter === 'Out of Stock') {
      matchesStock = product.stock === 0;
    } else if (stockFilter === 'Good Stock') {
      matchesStock = product.stock > product.reorderLevel;
    }

    return matchesSearch && matchesCategory && matchesVisibility && matchesStock;
  });

  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let fieldA: any = a[sortBy];
    let fieldB: any = b[sortBy];

    if (typeof fieldA === 'string') {
      fieldA = fieldA.toLowerCase();
      fieldB = fieldB.toLowerCase();
    }

    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  
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
      const currentIds = paginatedProducts.map(p => p.id);
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...currentIds])));
    } else {
      const currentIds = paginatedProducts.map(p => p.id);
      setSelectedProductIds(prev => prev.filter(id => !currentIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds(prev => [...prev, id]);
    } else {
      setSelectedProductIds(prev => prev.filter(item => item !== id));
    }
  };

  
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'Cost', 'Stock', 'Reserved', 'Reorder Level', 'Status', 'Created Date'];
    const rows = filteredProducts.map(p => [
      p.id,
      p.name,
      p.sku,
      p.category,
      `₹${p.price.toFixed(2)}`,
      `₹${p.cost.toFixed(2)}`,
      p.stock,
      p.reserved,
      p.reorderLevel,
      p.status,
      p.createdDate
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fashion_store_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  
  const validateForm = () => {
    if (!formName.trim()) {
      setFormError('Product name is required.');
      return false;
    }
    if (!formSku.trim()) {
      setFormError('SKU code is required.');
      return false;
    }
    if (!formImage) {
      setFormError('Product image is required. Please upload an image.');
      return false;
    }
    if (formPrice <= 0) {
      setFormError('Price must be greater than ₹0.');
      return false;
    }
    if (formCost <= 0) {
      setFormError('Cost must be greater than ₹0.');
      return false;
    }
    if (formStock < 0) {
      setFormError('Stock level cannot be negative.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    
    const imgUrl = formImage.trim() || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=200';

    addProduct({
      name: formName,
      sku: formSku,
      category: formCategory,
      price: formPrice,
      cost: formCost,
      stock: formStock,
      reserved: 0,
      reorderLevel: formReorder,
      status: 'Live',
      image: imgUrl,
      description: formDesc,
      variants: [
        { size: 'M', color: 'Default', stock: formStock }
      ],
      seoTitle: `${formName} | Fashion Store`,
      seoDescription: formDesc.substring(0, 150)
    });

    
    setFormName('');
    setFormSku('');
    setFormPrice(0);
    setFormCost(0);
    setFormStock(0);
    setFormReorder(10);
    setFormImage('');
    setFormDesc('');
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !validateForm()) return;

    updateProduct(editingProduct.id, {
      name: formName,
      sku: formSku,
      category: formCategory,
      price: formPrice,
      cost: formCost,
      stock: formStock,
      reorderLevel: formReorder,
      image: formImage,
      description: formDesc
    });

    setEditingProduct(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteProduct(deleteConfirmId);
      setSelectedProductIds(prev => prev.filter(id => id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const handleBulkAction = () => {
    if (bulkConfirmAction === 'live') {
      bulkUpdateVisibility(selectedProductIds, 'Live');
    } else if (bulkConfirmAction === 'draft') {
      bulkUpdateVisibility(selectedProductIds, 'Draft');
    } else if (bulkConfirmAction === 'delete') {
      bulkDeleteProducts(selectedProductIds);
      setSelectedProductIds([]);
    }
    setBulkConfirmAction(null);
  };

  
  const totalCount = products.length;
  const liveCount = products.filter(p => p.status === 'Live').length;
  const lowCount = products.filter(p => p.stock <= p.reorderLevel && p.stock > 0).length;
  const outCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16]">
            Product List
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Display, organize, price, and adjust visibility settings for your fashion items.
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
          
          {canCreate && (
            <button
              onClick={() => {
                setFormName('');
                setFormSku('');
                setFormPrice(0);
                setFormCost(0);
                setFormStock(0);
                setFormReorder(10);
                setFormImage('');
                setFormDesc('');
                setFormError('');
                const activeCats = categories.filter(c => c.status === 'Active');
                if (activeCats.length > 0) {
                  setFormCategory(activeCats[0].name);
                } else {
                  setFormCategory('');
                }
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-sm font-bold shadow-xs hover:shadow-md cursor-pointer transition-all"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7-7H5" />
              </svg>
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#00522E]/10 rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E8F8E9] text-[#00522E] border border-[#BEC9BE]/40">Total</span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Catalog Items</span>
            <span className="text-2xl font-extrabold text-[#111E16]">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Live</span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Active Products</span>
            <span className="text-2xl font-extrabold text-[#111E16]">{liveCount}</span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">Low Stock</span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Below Reorder Level</span>
            <span className="text-2xl font-extrabold text-[#111E16]">{lowCount}</span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-50 text-[#BA1A1A] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-[#BA1A1A] border border-red-200">Out of Stock</span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Unstocked Items</span>
            <span className="text-2xl font-extrabold text-[#111E16]">{outCount}</span>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border border-[#BEC9BE] rounded-t-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase">Search Catalog</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#6F7A70]">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search product SKU, name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#E8F8E9] text-sm text-[#111E16] placeholder-[#6F7A70] rounded-lg pl-10 pr-4 py-2 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
            />
          </div>
        </div>

        {}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase">Category Filter</label>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2.5 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c.status === 'Active').map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6F7A70]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase">Visibility Filter</label>
          <div className="relative">
            <select
              value={visibilityFilter}
              onChange={(e) => {
                setVisibilityFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2.5 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
            >
              <option value="All">All Visibility</option>
              <option value="Live">Live / Visible</option>
              <option value="Draft">Draft / Hidden</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6F7A70]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        {}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase">Stock Filter</label>
          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2.5 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
            >
              <option value="All">All Stock Levels</option>
              <option value="Good Stock">In Stock / Safe</option>
              <option value="Low Stock">Low Stock Alert</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6F7A70]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border-x border-b border-[#BEC9BE] rounded-b-xl shadow-xs overflow-hidden relative min-h-[320px]">
        {}
        {selectedProductIds.length > 0 && (
          <div className="absolute top-0 inset-x-0 h-14 bg-[#E8F8E9] z-20 flex items-center justify-between px-6 border-b border-[#BEC9BE] animate-slide-in">
            <span className="text-sm font-bold text-[#00522E]">
              {selectedProductIds.length} item{selectedProductIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-3">
              {canBulkToggle && (
                <>
                  <button
                    onClick={() => setBulkConfirmAction('live')}
                    className="px-3.5 py-1.5 bg-white hover:bg-[#F6F6F6] text-[#00522E] border border-[#BEC9BE] rounded-lg text-xs font-bold cursor-pointer transition-all"
                  >
                    Set Live (Show)
                  </button>
                  <button
                    onClick={() => setBulkConfirmAction('draft')}
                    className="px-3.5 py-1.5 bg-white hover:bg-[#F6F6F6] text-amber-700 border border-[#BEC9BE] rounded-lg text-xs font-bold cursor-pointer transition-all"
                  >
                    Set Draft (Hide)
                  </button>
                </>
              )}
              {canDelete && (
                <button
                  onClick={() => setBulkConfirmAction('delete')}
                  className="px-3.5 py-1.5 bg-[#BA1A1A] hover:bg-[#930006] text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
                >
                  Delete Selected
                </button>
              )}
              <button
                onClick={() => setSelectedProductIds([])}
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
                    checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProductIds.includes(p.id))}
                    onChange={handleSelectAll}
                    className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E]"
                  />
                </th>
                <th 
                  className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E]"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Product</span>
                    {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th 
                  className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E]"
                  onClick={() => toggleSort('sku')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>SKU</span>
                    {sortBy === 'sku' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Category</th>
                <th 
                  className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E] text-right"
                  onClick={() => toggleSort('price')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Price</span>
                    {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th 
                  className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E] text-center"
                  onClick={() => toggleSort('stock')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Stock</span>
                    {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase text-center">Visibility</th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Status</th>
                <th className="py-4 px-6 font-bold text-xs tracking-wider uppercase text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#BEC9BE]/30">
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="py-4 px-6 text-center">
                      <div className="w-4.5 h-4.5 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="space-y-2">
                          <div className="w-32 h-4 bg-gray-200 rounded"></div>
                          <div className="w-16 h-3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-5 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="w-14 h-4 bg-gray-200 rounded ml-auto"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-8 h-4 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-10 h-5 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-16 h-5 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="w-20 h-8 bg-gray-200 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-16 h-16 bg-[#00522E]/10 rounded-full flex items-center justify-center text-[#00522E] mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5h-9L8 12H3m18 0l-4-4h-8L3 12m18 0v6a1.5 1.5 0 01-1.5 1.5H4.5A1.5 1.5 0 013 18v-6" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-[#111E16]">No products found</h4>
                      <p className="text-sm text-[#6F7A70]">
                        We couldn't find any products matching your current catalog filters or search parameters.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setCategoryFilter('All');
                          setVisibilityFilter('All');
                          setStockFilter('All');
                        }}
                        className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const isChecked = selectedProductIds.includes(product.id);
                  
                  
                  let badgeClass = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                  let statusText = 'IN STOCK';
                  
                  if (product.stock === 0) {
                    badgeClass = 'bg-red-50 border-red-200 text-[#BA1A1A]';
                    statusText = 'OUT OF STOCK';
                  } else if (product.stock <= product.reorderLevel) {
                    badgeClass = 'bg-amber-50 border-amber-200 text-amber-800';
                    statusText = 'LOW STOCK';
                  } else if (product.status === 'Draft') {
                    badgeClass = 'bg-gray-50 border-gray-200 text-gray-600';
                    statusText = 'DRAFT';
                  }

                  return (
                    <tr 
                      key={product.id}
                      className={`hover:bg-[#E8F8E9]/20 transition-colors duration-100 ${isChecked ? 'bg-[#00522E]/5' : ''}`}
                    >
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(product.id, e.target.checked)}
                          className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E]"
                        />
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-[#BEC9BE]/60"
                            onError={(e) => {
                              
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=200';
                            }}
                          />
                          <div>
                            <span 
                              onClick={() => navigate(`details/${product.id}`)}
                              className="font-bold text-[#111E16] hover:text-[#00522E] cursor-pointer hover:underline block"
                            >
                              {product.name}
                            </span>
                            <span className="text-xs text-[#6F7A70] block">ID: #{product.id}</span>
                          </div>
                        </div>
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap text-xs font-mono font-semibold text-[#6F7A70]">
                        {product.sku}
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#E8F8E9] border border-[#BEC9BE]/40 text-[#00522E] text-xs font-semibold">
                          {product.category}
                        </span>
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap text-right font-mono font-bold text-[#111E16]">
                        {formatCurrency(product.price)}
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap text-center font-mono font-bold text-[#111E16]">
                        <span className={product.stock === 0 ? 'text-[#BA1A1A]' : product.stock <= product.reorderLevel ? 'text-amber-600' : ''}>
                          {product.stock}
                        </span>
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => toggleProductVisibility(product.id)}
                          disabled={!canToggleVisibility}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                            !canToggleVisibility ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                          }`}
                          style={{ backgroundColor: product.status === 'Live' ? '#00522E' : '#BEC9BE' }}
                        >
                          <span
                            className="pointer-events-none absolute top-[2px] left-[2px] h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out"
                            style={{ transform: product.status === 'Live' ? 'translateX(16px)' : 'translateX(0px)' }}
                          />
                        </button>
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${badgeClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                          {statusText}
                        </span>
                      </td>

                      {}
                      <td className="py-4 px-6 whitespace-nowrap text-right text-xs font-bold">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`details/${product.id}`)}
                            title="View details"
                            className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded-lg transition-all cursor-pointer"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          {canEdit && (
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setIsEditModalOpen(true);
                              }}
                              title="Edit Product"
                              className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded-lg transition-all cursor-pointer"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => setDeleteConfirmId(product.id)}
                              title="Delete Product"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 overflow-y-auto">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-lg shadow-xl animate-scale-up overflow-hidden my-8">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00522E]">Add New Product</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-50 text-[#BA1A1A] border border-red-200 text-xs font-bold rounded-lg p-3">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Linen Summer Dress"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TOP-LIN-09"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16] cursor-pointer"
                  >
                    {categories.filter(c => c.status === 'Active').map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Product Image *</label>
                  <div className="flex items-center gap-4 p-4 border border-[#BEC9BE] rounded-lg bg-gray-50">
                    {formImage ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#BEC9BE]/60 flex-shrink-0 bg-white">
                        <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          className="absolute top-0 right-0 bg-[#BA1A1A] text-white rounded-full p-0.5 m-0.5 hover:bg-[#930006] focus:outline-none"
                          title="Remove Image"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-[#BEC9BE] flex items-center justify-center flex-shrink-0 text-[#6F7A70] bg-white">
                        <svg className="w-8 h-8 opacity-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 017.5 0z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        id="add-product-image-file"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="add-product-image-file"
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] rounded-lg text-xs font-bold text-[#111E16] cursor-pointer transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isUploading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-[#00522E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Uploading to Cloudinary...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 text-[#00522E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>{formImage ? 'Replace Image' : 'Upload Image'}</span>
                          </>
                        )}
                      </label>
                      <p className="text-[10px] text-[#6F7A70] mt-1.5">PNG, JPG, or GIF up to 5MB. Image will be uploaded directly to Cloudinary.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Retail Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPrice || ''}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Supply Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formCost || ''}
                    onChange={(e) => setFormCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock || ''}
                    onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Reorder Level *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formReorder || ''}
                    onChange={(e) => setFormReorder(parseInt(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed specifications, fabric type, cut guidelines..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16] resize-none"
                />
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
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 overflow-y-auto">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-lg shadow-xl animate-scale-up overflow-hidden my-8">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00522E]">Edit Product: {editingProduct.name}</h3>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setIsEditModalOpen(false);
                }}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-50 text-[#BA1A1A] border border-red-200 text-xs font-bold rounded-lg p-3">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Linen Summer Dress"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TOP-LIN-09"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16] cursor-pointer"
                  >
                    {categories.filter(c => c.status === 'Active').map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Product Image *</label>
                  <div className="flex items-center gap-4 p-4 border border-[#BEC9BE] rounded-lg bg-gray-50">
                    {formImage ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#BEC9BE]/60 flex-shrink-0 bg-white">
                        <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          className="absolute top-0 right-0 bg-[#BA1A1A] text-white rounded-full p-0.5 m-0.5 hover:bg-[#930006] focus:outline-none"
                          title="Remove Image"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-[#BEC9BE] flex items-center justify-center flex-shrink-0 text-[#6F7A70] bg-white">
                        <svg className="w-8 h-8 opacity-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 017.5 0z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        id="edit-product-image-file"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="edit-product-image-file"
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] rounded-lg text-xs font-bold text-[#111E16] cursor-pointer transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isUploading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-[#00522E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Uploading to Cloudinary...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 text-[#00522E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>{formImage ? 'Replace Image' : 'Upload Image'}</span>
                          </>
                        )}
                      </label>
                      <p className="text-[10px] text-[#6F7A70] mt-1.5">PNG, JPG, or GIF up to 5MB. Image will be uploaded directly to Cloudinary.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Retail Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPrice || ''}
                    onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Supply Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formCost || ''}
                    onChange={(e) => setFormCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock || 0}
                    onChange={(e) => setFormStock(parseInt(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Reorder Level *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formReorder || 0}
                    onChange={(e) => setFormReorder(parseInt(e.target.value) || 0)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed specifications, fabric type, cut guidelines..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#BEC9BE]/30">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
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
              <h3 className="text-lg font-bold text-[#111E16]">Delete Product?</h3>
              <p className="text-sm text-[#6F7A70]">
                Are you sure you want to permanently delete this product and erase it from the catalog? This action cannot be undone.
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

      {}
      {bulkConfirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-sm shadow-xl animate-scale-up overflow-hidden p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-[#00522E] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#111E16]">Confirm Bulk Action</h3>
              <p className="text-sm text-[#6F7A70]">
                Are you sure you want to perform bulk **{bulkConfirmAction}** on **{selectedProductIds.length}** selected products?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setBulkConfirmAction(null)}
                className="px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] text-[#111E16] text-sm font-semibold rounded-lg cursor-pointer transition-all w-24"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-sm font-bold rounded-lg cursor-pointer transition-all w-24"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
