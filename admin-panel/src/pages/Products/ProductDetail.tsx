import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from './ProductsContext';
import { formatCurrency } from '../../data/mockDb';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    products, 
    categories, 
    updateProduct, 
    adjustStock, 
    activities, 
    toggleProductVisibility,
    addToast
  } = useProducts();

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com/api' : 'http://localhost:5000/api');

  const product = products.find(p => p.id === id) || products[0];

  const [selectedImage, setSelectedImage] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  
  const [stockChangeType, setStockChangeType] = useState<'In' | 'Out' | 'Adjustment'>('In');
  const [stockChangeVal, setStockChangeVal] = useState(1);
  const [stockChangeReason, setStockChangeReason] = useState('Manual stock update');

  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formCost, setFormCost] = useState(0);
  const [formReorder, setFormReorder] = useState(10);
  const [formImage, setFormImage] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
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
        let errMsg = 'Failed to get secure upload signature from server.';
        try {
          const errData = await res.json();
          if (errData && errData.message) {
            errMsg = errData.message;
          }
        } catch (_) {}
        throw new Error(errMsg);
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
    if (product) {
      setSelectedImage(product.image);
      setFormName(product.name);
      setFormSku(product.sku);
      setFormCategory(product.category);
      setFormPrice(product.price);
      setFormCost(product.cost);
      setFormReorder(product.reorderLevel);
      setFormImage(product.image);
      setFormDesc(product.description);
      setFormSeoTitle(product.seoTitle || `${product.name} | Fashion Store`);
      setFormSeoDesc(product.seoDescription || product.description.substring(0, 150));
    }
  }, [product]);

  if (!product) {
    return (
      <div className="bg-white border border-[#BEC9BE] rounded-xl p-16 text-center">
        <h3 className="text-xl font-bold text-[#111E16]">No Products Available</h3>
        <p className="text-sm text-[#6F7A70] mt-1">Please create a product first in the Catalog page.</p>
        <button
          onClick={() => navigate('/dashboard/products')}
          className="mt-4 px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-sm font-bold rounded-lg cursor-pointer transition-all"
        >
          Go to Catalog
        </button>
      </div>
    );
  }

  const thumbnails = [
    product.image,
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=200'
  ];

  const profitMargin = product.price - product.cost;
  const marginPercentage = (profitMargin / product.price) * 100 || 0;

  const productActivities = activities.filter(act => act.productId === product.id);

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

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim() || formPrice <= 0 || formCost <= 0) {
      setFormError('Please fill out all required fields correctly.');
      return;
    }

    if (!formImage) {
      setFormError('Product image is required. Please upload an image.');
      return;
    }

    updateProduct(product.id, {
      name: formName,
      sku: formSku,
      category: formCategory,
      price: formPrice,
      cost: formCost,
      reorderLevel: formReorder,
      image: formImage,
      description: formDesc,
      seoTitle: formSeoTitle,
      seoDescription: formSeoDesc
    });

    setIsEditModalOpen(false);
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stockChangeVal <= 0 && stockChangeType !== 'Adjustment') {
      setFormError('Adjustment quantity must be greater than 0.');
      return;
    }

    adjustStock(product.id, stockChangeVal, stockChangeType, stockChangeReason);
    
    setStockChangeVal(1);
    setStockChangeReason('Manual stock update');
    setIsStockModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#BEC9BE]/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6F7A70]">
            <span className="hover:text-[#00522E] cursor-pointer" onClick={() => navigate('/dashboard/products')}>Products</span>
            <span>/</span>
            <span className="text-[#111E16]">Product Details</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111E16] tracking-tight">{product.name}</h2>
            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${badgeClass}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
              {statusText}
            </span>
          </div>
          <p className="text-xs text-[#6F7A70]">SKU Code: <span className="font-mono font-bold text-[#111E16]">{product.sku}</span></p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => toggleProductVisibility(product.id)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F6F6F6] text-[#111E16] border border-[#BEC9BE] rounded-lg text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            {product.status === 'Live' ? 'Hide Product' : 'Show Product'}
          </button>
          
          <button
            onClick={() => {
              setFormError('');
              setIsStockModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F6F6F6] text-[#00522E] border border-[#BEC9BE] rounded-lg text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            Update Inventory
          </button>

          <button
            onClick={() => {
              setFormError('');
              setIsEditModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-sm font-bold shadow-xs hover:shadow-md cursor-pointer transition-all"
          >
            Edit Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-[#BEC9BE]/40 flex items-center justify-center">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=200';
                }}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {thumbnails.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(t)}
                  className={`aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${selectedImage === t ? 'border-[#00522E] ring-2 ring-[#00522E]/20' : 'border-[#BEC9BE]/40'}`}
                >
                  <img
                    src={t}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#111E16] uppercase tracking-wider">Product Description</h3>
            <p className="text-sm text-[#6F7A70] leading-relaxed">
              {product.description || <span className="italic text-gray-300">No description provided for this product.</span>}
            </p>
          </div>

          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#BEC9BE]/30 pb-2">
              <h3 className="text-sm font-bold text-[#111E16] uppercase tracking-wider">SEO Parameters</h3>
              <span className="text-[10px] bg-emerald-50 text-[#00522E] border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase">Indexable</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[#6F7A70] font-semibold block">Meta Title:</span>
                <span className="text-[#111E16] font-medium block">{product.seoTitle || `${product.name} | Fashion Store`}</span>
              </div>
              <div>
                <span className="text-[#6F7A70] font-semibold block">Meta Description:</span>
                <span className="text-[#111E16] font-medium block leading-relaxed">{product.seoDescription || product.description.substring(0, 150)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#111E16] uppercase tracking-wider border-b border-[#BEC9BE]/30 pb-3 mb-4">Pricing Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#E8F8E9]/30 border border-[#BEC9BE]/40 rounded-xl p-4">
                <span className="text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider block">Retail Price</span>
                <span className="text-xl font-black text-[#111E16] block mt-1 font-mono">{formatCurrency(product.price)}</span>
              </div>
              
              <div className="bg-[#E8F8E9]/30 border border-[#BEC9BE]/40 rounded-xl p-4">
                <span className="text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider block">Supply Cost</span>
                <span className="text-xl font-black text-[#111E16] block mt-1 font-mono">{formatCurrency(product.cost)}</span>
              </div>

              <div className="bg-[#E8F8E9]/30 border border-[#BEC9BE]/40 rounded-xl p-4">
                <span className="text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider block">Profit Margin</span>
                <span className="text-xl font-black text-[#00522E] block mt-1 font-mono">{formatCurrency(profitMargin)}</span>
              </div>

              <div className="bg-[#E8F8E9]/30 border border-[#BEC9BE]/40 rounded-xl p-4">
                <span className="text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider block">Margin Rate</span>
                <span className="text-xl font-black text-[#00522E] block mt-1 font-mono">{marginPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#111E16] uppercase tracking-wider border-b border-[#BEC9BE]/30 pb-3 mb-4">Stock & Department Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <div className="p-4 border border-[#BEC9BE]/40 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-[#6F7A70] uppercase">Department Category</span>
                <span className="text-sm font-bold text-[#111E16] block">{product.category}</span>
              </div>

              <div className="p-4 border border-[#BEC9BE]/40 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-[#6F7A70] uppercase">Total Stock Available</span>
                <span className="text-sm font-bold text-[#111E16] block font-mono">{product.stock} units</span>
              </div>

              <div className="p-4 border border-[#BEC9BE]/40 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-[#6F7A70] uppercase">Reserved Stock</span>
                <span className="text-sm font-bold text-[#111E16] block font-mono">{product.reserved || 0} units</span>
              </div>

              <div className="p-4 border border-[#BEC9BE]/40 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-[#6F7A70] uppercase">Reorder Alert Level</span>
                <span className="text-sm font-bold text-[#111E16] block font-mono">{product.reorderLevel} units</span>
              </div>

              <div className="p-4 border border-[#BEC9BE]/40 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-[#6F7A70] uppercase">Safety Stock Level</span>
                <span className="text-sm font-bold text-[#00522E] block font-mono">{product.stock > product.reorderLevel ? 'Safe Level' : 'Needs Restock'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#111E16] uppercase tracking-wider">Product Variants Options</h4>
              <div className="overflow-x-auto border border-[#BEC9BE]/40 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#E8F8E9]/30 border-b border-[#BEC9BE]/40 text-[#6F7A70] select-none">
                    <tr>
                      <th className="py-2.5 px-4">Size Option</th>
                      <th className="py-2.5 px-4">Color Shade</th>
                      <th className="py-2.5 px-4 text-center">Current Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BEC9BE]/20 font-medium text-[#111E16]">
                    {product.variants && product.variants.length > 0 ? (
                      product.variants.map((v, index) => (
                        <tr key={index}>
                          <td className="py-2.5 px-4">{v.size}</td>
                          <td className="py-2.5 px-4">{v.color}</td>
                          <td className="py-2.5 px-4 text-center font-bold font-mono">{v.stock}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-3 px-4 text-center italic text-[#6F7A70]">No custom size/color options found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#111E16] uppercase tracking-wider border-b border-[#BEC9BE]/30 pb-3 mb-4">Product Activity Timeline</h3>
            
            <div className="flow-root">
              {productActivities.length === 0 ? (
                <p className="text-xs italic text-[#6F7A70] py-4 text-center">No recent logs recorded for this item.</p>
              ) : (
                <ul className="-mb-8">
                  {productActivities.map((act, index) => (
                    <li key={act.id}>
                      <div className="relative pb-8">
                        {index !== productActivities.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-[#BEC9BE]/30" aria-hidden="true"></span>
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-[#00522E]/10 flex items-center justify-center text-[#00522E]">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-xs text-[#111E16] font-semibold">{act.action}</p>
                              <span className="text-[10px] text-[#6F7A70]">Performed by: <span className="font-bold">{act.user}</span></span>
                            </div>
                            <div className="text-right text-[10px] whitespace-nowrap text-[#6F7A70] font-semibold">
                              {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4 overflow-y-auto">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-lg shadow-xl animate-scale-up overflow-hidden my-8">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00522E]">Edit Product Information</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="col-span-2">
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
                        id="detail-edit-product-image-file"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="detail-edit-product-image-file"
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">SEO Meta Title</label>
                  <input
                    type="text"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">SEO Meta Description</label>
                <textarea
                  rows={2}
                  value={formSeoDesc}
                  onChange={(e) => setFormSeoDesc(e.target.value)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#BEC9BE]/30">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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

      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-sm shadow-xl animate-scale-up overflow-hidden">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00522E]">Update Inventory Levels</h3>
              <button 
                onClick={() => setIsStockModalOpen(false)}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleStockSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['In', 'Out', 'Adjustment'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setStockChangeType(type)}
                      className={`py-2 text-xs font-bold border rounded-lg cursor-pointer transition-all ${stockChangeType === type ? 'bg-[#00522E] text-white border-transparent' : 'bg-white text-[#111E16] border-[#BEC9BE] hover:bg-[#F6F6F6]'}`}
                    >
                      {type === 'In' ? 'Add Stock' : type === 'Out' ? 'Remove' : 'Set Exact'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">
                  {stockChangeType === 'Adjustment' ? 'Target Stock Quantity' : 'Quantity to change'}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockChangeVal}
                  onChange={(e) => setStockChangeVal(parseInt(e.target.value) || 0)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Reason for Change</label>
                <input
                  type="text"
                  required
                  value={stockChangeReason}
                  onChange={(e) => setStockChangeReason(e.target.value)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#BEC9BE]/30">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] text-[#111E16] text-sm font-semibold rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-sm font-bold rounded-lg cursor-pointer transition-all"
                >
                  Adjust Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
