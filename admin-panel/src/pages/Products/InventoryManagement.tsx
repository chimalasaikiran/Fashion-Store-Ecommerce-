import React, { useState, useEffect } from 'react';
import { useProducts, type Product } from './ProductsContext';

export default function InventoryManagement() {
  const { products, categories, movements, adjustStock } = useProducts();

  
  const [activeTab, setActiveTab] = useState<'status' | 'movements'>('status');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [alertFilter, setAlertFilter] = useState<'All' | 'Low Stock' | 'Out of Stock' | 'Good'>('All');

  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [stockType, setStockType] = useState<'In' | 'Out' | 'Adjustment'>('In');
  const [stockVal, setStockVal] = useState(1);
  const [stockReason, setStockReason] = useState('Periodic inventory audit');
  const [formError, setFormError] = useState('');

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  
  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query);

    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;

    let matchesAlert = true;
    if (alertFilter === 'Low Stock') {
      matchesAlert = product.stock <= product.reorderLevel && product.stock > 0;
    } else if (alertFilter === 'Out of Stock') {
      matchesAlert = product.stock === 0;
    } else if (alertFilter === 'Good') {
      matchesAlert = product.stock > product.reorderLevel;
    }

    return matchesSearch && matchesCategory && matchesAlert;
  });

  
  const filteredMovements = movements.filter(mov => {
    const query = searchQuery.toLowerCase();
    return (
      mov.productName.toLowerCase().includes(query) ||
      mov.sku.toLowerCase().includes(query) ||
      mov.reason.toLowerCase().includes(query)
    );
  });

  
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (stockVal <= 0 && stockType !== 'Adjustment') {
      setFormError('Quantity to change must be greater than 0.');
      return;
    }

    adjustStock(selectedProduct.id, stockVal, stockType, stockReason);
    
    
    setStockVal(1);
    setStockReason('Periodic inventory audit');
    setSelectedProduct(null);
    setIsAdjustModalOpen(false);
  };

  
  const handleExportCSV = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'Available Quantity', 'Reserved Quantity', 'Reorder Alert Level', 'Stock Safety Alert'];
    const rows = products.map(p => {
      let safety = 'Safe';
      if (p.stock === 0) safety = 'OUT OF STOCK';
      else if (p.stock <= p.reorderLevel) safety = 'LOW STOCK WARNING';
      
      return [
        p.sku,
        p.name,
        p.category,
        p.stock,
        p.reserved,
        p.reorderLevel,
        safety
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fashion_store_inventory_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  
  const totalAvailableQty = products.reduce((acc, curr) => acc + curr.stock, 0);
  const totalReservedQty = products.reduce((acc, curr) => acc + curr.reserved, 0);
  const totalReorderAlertCount = products.filter(p => p.stock <= p.reorderLevel).length;

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16]">
            Inventory Management
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Audit catalog levels, restock items, specify warnings, and examine stock transaction timelines.
          </p>
        </div>
        
        <div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-sm font-bold shadow-xs hover:shadow-md cursor-pointer transition-all"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#00522E]/10 rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E8F8E9] text-[#00522E] border border-[#BEC9BE]/40">In Stock</span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Available Quantity</span>
            <span className="text-2xl font-extrabold text-[#111E16] block mt-1 font-mono">{totalAvailableQty.toLocaleString()} units</span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#00522E]/10 rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">Reserved</span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Reserved Quantity</span>
            <span className="text-2xl font-extrabold text-[#111E16] block mt-1 font-mono">{totalReservedQty.toLocaleString()} units</span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-50 text-[#BA1A1A] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-[#BA1A1A] border border-red-200">Low Stock</span>
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Below Reorder Level</span>
            <span className="text-2xl font-extrabold text-[#111E16] block mt-1 font-mono">{totalReorderAlertCount} items</span>
          </div>
        </div>
      </div>

      {}
      <div className="flex border-b border-[#BEC9BE]/40 select-none">
        <button
          onClick={() => setActiveTab('status')}
          className={`py-3 px-6 font-bold text-sm border-b-2 cursor-pointer transition-all ${activeTab === 'status' ? 'border-[#00522E] text-[#00522E]' : 'border-transparent text-[#6F7A70] hover:text-[#111E16]'}`}
        >
          Stock Status & Adjustments
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`py-3 px-6 font-bold text-sm border-b-2 cursor-pointer transition-all ${activeTab === 'movements' ? 'border-[#00522E] text-[#00522E]' : 'border-transparent text-[#6F7A70] hover:text-[#111E16]'}`}
        >
          Stock Movement Logs
        </button>
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
              placeholder={activeTab === 'status' ? "Search SKU, product..." : "Search logs..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#E8F8E9] text-sm text-[#111E16] placeholder-[#6F7A70] rounded-lg pl-10 pr-4 py-2 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
            />
          </div>

          {activeTab === 'status' && (
            <>
              {}
              <div className="relative w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
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

              {}
              <div className="relative w-full sm:w-auto">
                <select
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value as any)}
                  className="w-full sm:w-auto appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
                >
                  <option value="All">All Inventory Alert Levels</option>
                  <option value="Good">Good Stock / Safe</option>
                  <option value="Low Stock">Low Stock Warnings</option>
                  <option value="Out of Stock">Out of Stock Warnings</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6F7A70]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {}
      <div className="bg-white border-x border-b border-[#BEC9BE] rounded-b-xl shadow-xs overflow-hidden relative min-h-[300px]">
        {activeTab === 'status' ? (
          
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm min-w-[900px]">
              <thead>
                <tr className="bg-[#E8F8E9]/50 text-[#6F7A70] border-b border-[#BEC9BE]/60 select-none">
                  <th className="py-4 px-6 font-bold text-xs tracking-wider uppercase">SKU</th>
                  <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Product</th>
                  <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Category</th>
                  <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase text-center">Available Qty</th>
                  <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase text-center">Reserved Qty</th>
                  <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase text-center">Reorder level</th>
                  <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Status Safety</th>
                  <th className="py-4 px-6 font-bold text-xs tracking-wider uppercase text-right">Stock Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#BEC9BE]/30">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`skel-${idx}`} className="animate-pulse">
                      <td className="py-4 px-6"><div className="w-20 h-4 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-4"><div className="w-32 h-4 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-4"><div className="w-16 h-4 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-4 text-center"><div className="w-8 h-4 bg-gray-200 rounded mx-auto"></div></td>
                      <td className="py-4 px-4 text-center"><div className="w-8 h-4 bg-gray-200 rounded mx-auto"></div></td>
                      <td className="py-4 px-4 text-center"><div className="w-8 h-4 bg-gray-200 rounded mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="w-24 h-5 bg-gray-200 rounded-full"></div></td>
                      <td className="py-4 px-6 text-right"><div className="w-16 h-8 bg-gray-200 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-[#6F7A70]">No matching inventory items found.</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    let alertBadge = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                    let alertMsg = 'Good Stock';
                    
                    if (p.stock === 0) {
                      alertBadge = 'bg-red-50 border-red-200 text-[#BA1A1A] font-bold';
                      alertMsg = 'OUT OF STOCK';
                    } else if (p.stock <= p.reorderLevel) {
                      alertBadge = 'bg-amber-50 border-amber-200 text-amber-800 font-bold';
                      alertMsg = 'LOW STOCK';
                    }

                    return (
                      <tr key={p.id} className="hover:bg-[#E8F8E9]/20 transition-colors">
                        <td className="py-4 px-6 font-mono font-semibold text-xs text-[#6F7A70]">{p.sku}</td>
                        <td className="py-4 px-4 whitespace-nowrap font-bold text-[#111E16]">{p.name}</td>
                        <td className="py-4 px-4 text-xs text-[#00522E] font-semibold">{p.category}</td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-[#111E16]">{p.stock}</td>
                        <td className="py-4 px-4 text-center font-mono font-medium text-[#6F7A70]">{p.reserved || 0}</td>
                        <td className="py-4 px-4 text-center font-mono font-medium text-[#6F7A70]">{p.reorderLevel}</td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs ${alertBadge}`}>
                            {alertMsg}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap text-xs font-bold">
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setStockType('In');
                              setStockVal(1);
                              setStockReason('Restocking shipment received');
                              setFormError('');
                              setIsAdjustModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-[#F6F6F6] text-[#00522E] border border-[#BEC9BE] rounded-lg cursor-pointer transition-all"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm min-w-[900px]">
              <thead>
                <tr className="bg-[#E8F8E9]/50 text-[#6F7A70] border-b border-[#BEC9BE]/60 select-none">
                  <th className="py-4 px-6 font-bold text-xs tracking-wider uppercase">Timestamp</th>
                  <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">SKU / Product</th>
                  <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Type</th>
                  <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase text-center">Change Qty</th>
                  <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase text-center">Resulting Qty</th>
                  <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Reason for Adjustment</th>
                  <th className="py-4 px-6 font-bold text-xs tracking-wider uppercase text-right">User Audited</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#BEC9BE]/30 text-xs">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={`mov-skel-${idx}`} className="animate-pulse">
                      <td className="py-4 px-6"><div className="w-24 h-4 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-4"><div className="w-32 h-4 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-4"><div className="w-12 h-4 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-4 text-center"><div className="w-8 h-4 bg-gray-200 rounded mx-auto"></div></td>
                      <td className="py-4 px-4 text-center"><div className="w-8 h-4 bg-gray-200 rounded mx-auto"></div></td>
                      <td className="py-4 px-4"><div className="w-40 h-4 bg-gray-200 rounded"></div></td>
                      <td className="py-4 px-6 text-right"><div className="w-16 h-4 bg-gray-200 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[#6F7A70] italic">No transaction movement history logs available.</td>
                  </tr>
                ) : (
                  filteredMovements.map((mov) => {
                    let typeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    let typeLabel = 'Restock (In)';
                    
                    if (mov.type === 'Out') {
                      typeBg = 'bg-red-50 text-[#BA1A1A] border-red-200';
                      typeLabel = 'Fulfill (Out)';
                    } else if (mov.type === 'Adjustment') {
                      typeBg = 'bg-blue-50 text-blue-800 border-blue-200';
                      typeLabel = 'Audit Set';
                    }

                    return (
                      <tr key={mov.id} className="hover:bg-[#E8F8E9]/20 transition-colors text-[#111E16]">
                        <td className="py-4 px-6 whitespace-nowrap text-[#6F7A70]">
                          {new Date(mov.timestamp).toLocaleDateString()} {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold">{mov.productName}</div>
                          <span className="text-[10px] text-[#6F7A70] font-mono">SKU: {mov.sku}</span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded border ${typeBg} font-bold`}>
                            {typeLabel}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold">
                          <span className={mov.changeQuantity < 0 ? 'text-[#BA1A1A]' : mov.changeQuantity > 0 ? 'text-emerald-700' : ''}>
                            {mov.changeQuantity > 0 ? `+${mov.changeQuantity}` : mov.changeQuantity}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold">{mov.resultingQuantity}</td>
                        <td className="py-4 px-4 text-[#6F7A70] max-w-xs truncate" title={mov.reason}>{mov.reason}</td>
                        <td className="py-4 px-6 text-right font-medium text-[#6F7A70]">{mov.user}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-sm shadow-xl animate-scale-up overflow-hidden">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-[#00522E]">Adjust Stock Quantity</h3>
                <span className="text-xs text-[#6F7A70] block font-semibold">Product: {selectedProduct.name}</span>
              </div>
              <button 
                onClick={() => {
                  setSelectedProduct(null);
                  setIsAdjustModalOpen(false);
                }}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-[#BA1A1A] border border-red-200 text-xs font-bold rounded-lg p-3">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['In', 'Out', 'Adjustment'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setStockType(type)}
                      className={`py-2 text-xs font-bold border rounded-lg cursor-pointer transition-all ${stockType === type ? 'bg-[#00522E] text-white border-transparent' : 'bg-white text-[#111E16] border-[#BEC9BE] hover:bg-[#F6F6F6]'}`}
                    >
                      {type === 'In' ? 'Add Stock' : type === 'Out' ? 'Remove' : 'Set Exact'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">
                  {stockType === 'Adjustment' ? 'Target Stock Quantity' : 'Quantity to change'}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockVal}
                  onChange={(e) => setStockVal(parseInt(e.target.value) || 0)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111E16] uppercase tracking-wider mb-1.5">Reason for Adjustment</label>
                <input
                  type="text"
                  required
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="w-full text-sm bg-white border border-[#BEC9BE] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#00522E] text-[#111E16]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#BEC9BE]/30">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setIsAdjustModalOpen(false);
                  }}
                  className="px-4 py-2 bg-white hover:bg-[#F6F6F6] border border-[#BEC9BE] text-[#111E16] text-sm font-semibold rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-sm font-bold rounded-lg cursor-pointer transition-all"
                >
                  Adjust Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
