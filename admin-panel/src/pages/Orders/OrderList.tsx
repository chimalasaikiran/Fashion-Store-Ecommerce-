import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders, type Order } from './OrdersContext';
import { formatCurrency } from '../../data/mockDb';

export default function OrderList() {
  const navigate = useNavigate();
  const {
    orders,
    updateOrderStatus,
    updatePaymentStatus,
    updateDeliveryStatus,
    cancelOrder,
    deleteOrder,
    bulkUpdateStatus,
    bulkDeleteOrders
  } = useOrders();

  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | Order['orderStatus']>('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'All' | Order['paymentStatus']>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Last 7 Days' | 'Last 30 Days'>('All');
  const [sortBy, setSortBy] = useState<'id' | 'customerName' | 'items' | 'totalAmount' | 'createdDate'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [bulkConfirmAction, setBulkConfirmAction] = useState<'Processing' | 'Delivered' | 'Cancelled' | 'delete' | null>(null);

  
  const [formOrderStatus, setFormOrderStatus] = useState<Order['orderStatus']>('Pending');
  const [formPaymentStatus, setFormPaymentStatus] = useState<Order['paymentStatus']>('Pending');
  const [formDeliveryStatus, setFormDeliveryStatus] = useState<Order['deliveryStatus']>('Pending');

  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  
  useEffect(() => {
    if (editingOrder) {
      setFormOrderStatus(editingOrder.orderStatus);
      setFormPaymentStatus(editingOrder.paymentStatus);
      setFormDeliveryStatus(editingOrder.deliveryStatus);
    }
  }, [editingOrder]);

  
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      order.customerName.toLowerCase().includes(query) ||
      order.customerEmail.toLowerCase().includes(query) ||
      order.customerPhone.includes(query) ||
      order.id.toLowerCase().includes(query);

    const matchesOrderStatus = orderStatusFilter === 'All' || order.orderStatus === orderStatusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'All' || order.paymentStatus === paymentStatusFilter;

    
    let matchesDate = true;
    if (dateFilter === 'Last 7 Days') {
      matchesDate = order.createdDate.includes('2026') || order.createdDate.includes('Jun');
    } else if (dateFilter === 'Last 30 Days') {
      matchesDate = order.createdDate.includes('2026') || order.createdDate.includes('May') || order.createdDate.includes('Jun');
    }

    return matchesSearch && matchesOrderStatus && matchesPaymentStatus && matchesDate;
  });

  
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let fieldA: any = a[sortBy];
    let fieldB: any = b[sortBy];

    if (sortBy === 'customerName') {
      fieldA = a.customerName.toLowerCase();
      fieldB = b.customerName.toLowerCase();
    } else if (sortBy === 'items') {
      fieldA = a.items.reduce((sum, item) => sum + item.quantity, 0);
      fieldB = b.items.reduce((sum, item) => sum + item.quantity, 0);
    } else if (sortBy === 'createdDate') {
      fieldA = new Date(a.createdDate).getTime();
      fieldB = new Date(b.createdDate).getTime();
    }

    if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  
  const totalItems = sortedOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = sortedOrders.slice(startIndex, startIndex + itemsPerPage);

  
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentIds = paginatedOrders.map(o => o.id);
      setSelectedOrderIds(prev => Array.from(new Set([...prev, ...currentIds])));
    } else {
      const currentIds = paginatedOrders.map(o => o.id);
      setSelectedOrderIds(prev => prev.filter(id => !currentIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, id]);
    } else {
      setSelectedOrderIds(prev => prev.filter(item => item !== id));
    }
  };

  
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Email', 'Items Count', 'Total Amount', 'Payment Status', 'Order Status', 'Delivery Status', 'Created Date'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.customerName,
      o.customerEmail,
      o.items.reduce((sum, item) => sum + item.quantity, 0),
      `₹${o.totalAmount.toFixed(2)}`,
      o.paymentStatus,
      o.orderStatus,
      o.deliveryStatus,
      o.createdDate
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fashion_store_orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Orders exported successfully to CSV!", "success");
  };

  const handlePrintInvoice = (orderId: string) => {
    showToast(`Generating invoice for Order #${orderId}...`, "info");
    setTimeout(() => {
      window.print();
    }, 500);
  };


  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    updateOrderStatus(editingOrder.id, formOrderStatus);
    updatePaymentStatus(editingOrder.id, formPaymentStatus);
    updateDeliveryStatus(editingOrder.id, formDeliveryStatus);

    setEditingOrder(null);
    setIsEditModalOpen(false);
    showToast(`Order #${editingOrder.id} status updated successfully!`, "success");
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteOrder(deleteConfirmId);
      setSelectedOrderIds(prev => prev.filter(id => id !== deleteConfirmId));
      setDeleteConfirmId(null);
      showToast(`Order deleted permanently.`, "success");
    }
  };

  const handleCancelConfirm = () => {
    if (cancelConfirmId) {
      cancelOrder(cancelConfirmId);
      setCancelConfirmId(null);
      showToast(`Order #${cancelConfirmId} has been cancelled.`, "success");
    }
  };

  const handleBulkAction = () => {
    if (!bulkConfirmAction) return;

    if (bulkConfirmAction === 'delete') {
      bulkDeleteOrders(selectedOrderIds);
      showToast(`Deleted ${selectedOrderIds.length} orders successfully.`, "success");
      setSelectedOrderIds([]);
    } else {
      bulkUpdateStatus(selectedOrderIds, bulkConfirmAction);
      showToast(`Updated status of ${selectedOrderIds.length} orders to ${bulkConfirmAction}.`, "success");
    }
    setBulkConfirmAction(null);
  };

  
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Pending').length;
  const processingOrdersCount = orders.filter(o => ['Processing', 'Dispatched', 'Shipped', 'Out For Delivery', 'Confirmed', 'Packed'].includes(o.orderStatus)).length;
  const deliveredOrdersCount = orders.filter(o => o.orderStatus === 'Delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.orderStatus === 'Cancelled').length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrdersStat = totalOrdersCount;
  const pendingStat = pendingOrdersCount;
  const processingStat = processingOrdersCount;
  const deliveredStat = deliveredOrdersCount;
  const cancelledStat = cancelledOrdersCount;
  const revenueStat = totalRevenue;

  return (
    <div className="space-y-6 select-none relative pb-12">
      {}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 bg-white border border-[#BEC9BE] rounded-xl shadow-xl animate-slide-in-right">
          <div className={`w-3 h-3 rounded-full ${
            toastType === 'success' ? 'bg-[#00522E]' : toastType === 'error' ? 'bg-[#BA1A1A]' : 'bg-[#F8B057]'
          }`}></div>
          <span className="text-sm font-bold text-[#111E16]">{toastMessage}</span>
        </div>
      )}

      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16] flex items-center gap-2">
            Order Management
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Manage, track, process invoices, and dispatch logs for customer orders.
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
            <span>Export Orders</span>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#00522E]/10 rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8E9] text-[#00522E]">
              +12.5%
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Orders</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">{totalOrdersStat.toLocaleString()}</span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-50 rounded-lg flex items-center justify-center text-amber-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">
              Active
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Pending</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">{pendingStat.toLocaleString()}</span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Processing</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">{processingStat.toLocaleString()}</span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#E8F8E9] rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Delivered</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">{deliveredStat.toLocaleString()}</span>
          </div>
        </div>

        {}
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-50 rounded-lg flex items-center justify-center text-[#BA1A1A]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Cancelled</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">{cancelledStat.toLocaleString()}</span>
          </div>
        </div>

        {}
        <div className="bg-[#00522E] rounded-xl p-5 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-200 text-white min-h-[140px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-white/10 rounded-lg flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-white/70 tracking-wider uppercase block">Revenue</span>
            <span className="text-2xl font-extrabold text-white tracking-tight block">{formatCurrency(revenueStat)}</span>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border border-[#BEC9BE] rounded-t-xl p-4 flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#6F7A70]">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search name, ID, phone..."
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
              value={orderStatusFilter}
              onChange={(e) => {
                setOrderStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Shipped">Shipped</option>
              <option value="Out For Delivery">Out For Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Refunded">Refunded</option>
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
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
            >
              <option value="All">Payment: All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
              <option value="Failed">Failed</option>
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
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto appearance-none bg-white border border-[#BEC9BE] rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-[#111E16] cursor-pointer focus:outline-none focus:border-[#00522E]"
            >
              <option value="All">Last 30 Days</option>
              <option value="Last 7 Days">Last 7 Days</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6F7A70]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="text-xs font-semibold text-[#6F7A70] w-full xl:w-auto text-right">
          Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} matches
        </div>
      </div>

      {}
      <div className="bg-white border-x border-b border-[#BEC9BE] rounded-b-xl shadow-xs overflow-hidden relative min-h-[340px]">
        {}
        {selectedOrderIds.length > 0 && (
          <div className="absolute top-0 inset-x-0 h-14 bg-[#E8F8E9] z-20 flex items-center justify-between px-6 border-b border-[#BEC9BE] animate-slide-in">
            <span className="text-sm font-bold text-[#00522E]">
              {selectedOrderIds.length} order{selectedOrderIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBulkConfirmAction('Processing')}
                className="px-3 py-1.5 bg-white hover:bg-[#F6F6F6] text-[#00522E] border border-[#BEC9BE] rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Mark Processing
              </button>
              <button
                onClick={() => setBulkConfirmAction('Delivered')}
                className="px-3 py-1.5 bg-white hover:bg-[#F6F6F6] text-emerald-800 border border-[#BEC9BE] rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Mark Delivered
              </button>
              <button
                onClick={() => setBulkConfirmAction('Cancelled')}
                className="px-3 py-1.5 bg-white hover:bg-[#F6F6F6] text-[#BA1A1A] border border-[#BEC9BE] rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Cancel Selected
              </button>
              <button
                onClick={() => setBulkConfirmAction('delete')}
                className="px-3.5 py-1.5 bg-[#BA1A1A] hover:bg-[#930006] text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedOrderIds([])}
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
                    checked={paginatedOrders.length > 0 && paginatedOrders.every(o => selectedOrderIds.includes(o.id))}
                    onChange={handleSelectAll}
                    className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E]"
                  />
                </th>
                <th
                  className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E]"
                  onClick={() => toggleSort('id')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Order ID</span>
                    {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th
                  className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E]"
                  onClick={() => toggleSort('customerName')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer</span>
                    {sortBy === 'customerName' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th
                  className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E] text-center"
                  onClick={() => toggleSort('items')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Items</span>
                    {sortBy === 'items' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th
                  className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E] text-right"
                  onClick={() => toggleSort('totalAmount')}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Total Amount</span>
                    {sortBy === 'totalAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Payment Status</th>
                <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Order Status</th>
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
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1.5">
                        <div className="w-28 h-4 bg-gray-200 rounded"></div>
                        <div className="w-36 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-6 h-4 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="w-16 h-4 bg-gray-200 rounded ml-auto"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-5 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-5 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="w-24 h-8 bg-gray-200 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedOrders.length === 0 ? (
                
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-16 h-16 bg-[#00522E]/10 rounded-full flex items-center justify-center text-[#00522E] mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold text-[#111E16]">No orders found</h4>
                      <p className="text-sm text-[#6F7A70]">
                        We couldn't find any orders matching your filters or search query "{searchQuery}".
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setOrderStatusFilter('All');
                          setPaymentStatusFilter('All');
                          setDateFilter('All');
                        }}
                        className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                
                paginatedOrders.map((order) => {
                  const isChecked = selectedOrderIds.includes(order.id);
                  const firstInitial = order.customerName.charAt(0);
                  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                  
                  let payBadgeClass = '';
                  if (order.paymentStatus === 'Paid') payBadgeClass = 'bg-[#EDFEEF] text-[#00522E] border-emerald-200';
                  else if (order.paymentStatus === 'Pending') payBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                  else if (order.paymentStatus === 'Refunded') payBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
                  else payBadgeClass = 'bg-red-50 text-[#BA1A1A] border-red-200';

                  
                  let orderBadgeClass = '';
                  if (order.orderStatus === 'Delivered') orderBadgeClass = 'bg-[#EDFEEF] text-[#00522E] border-emerald-200';
                  else if (order.orderStatus === 'Processing') orderBadgeClass = 'bg-[#00522E]/10 text-[#00522E] border-emerald-200';
                  else if (order.orderStatus === 'Dispatched') orderBadgeClass = 'bg-purple-50 text-purple-800 border-purple-200';
                  else if (order.orderStatus === 'Shipped') orderBadgeClass = 'bg-orange-50 text-orange-800 border-orange-200';
                  else if (order.orderStatus === 'Out For Delivery') orderBadgeClass = 'bg-sky-50 text-sky-800 border-sky-200';
                  else if (order.orderStatus === 'Pending') orderBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                  else if (order.orderStatus === 'Refunded') orderBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
                  else if (order.orderStatus === 'Confirmed') orderBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200'; 
                  else if (order.orderStatus === 'Packed') orderBadgeClass = 'bg-indigo-50 text-indigo-800 border-indigo-200'; 
                  else orderBadgeClass = 'bg-red-50 text-[#BA1A1A] border-red-200';

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-[#E8F8E9]/20 transition-colors duration-100 ${isChecked ? 'bg-[#00522E]/5' : ''}`}
                    >
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(order.id, e.target.checked)}
                          className="rounded border-[#BEC9BE] text-[#00522E] focus:ring-[#00522E]"
                        />
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          onClick={() => navigate(`/dashboard/orders/details/${order.id}`)}
                          className="font-bold font-mono text-sm text-[#00522E] hover:text-[#003B21] cursor-pointer hover:underline"
                        >
                          #{order.id}
                        </span>
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-[#00522E] bg-[#E8F8E9] border border-[#BEC9BE]/60">
                            {firstInitial}
                          </span>
                          <div>
                            <span
                              onClick={() => navigate(`/dashboard/orders/details/${order.id}`)}
                              className="font-bold text-[#111E16] hover:text-[#00522E] cursor-pointer"
                            >
                              {order.customerName}
                            </span>
                            <span className="text-xs text-[#6F7A70] block">{order.customerEmail}</span>
                          </div>
                        </div>
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap text-center font-bold text-[#111E16]">
                        {itemsCount} {itemsCount > 1 ? 'items' : 'item'}
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap text-right font-mono font-bold text-[#111E16]">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${payBadgeClass}`}>
                          <span className="w-1 h-1 rounded-full bg-current mr-1.5"></span>
                          {order.paymentStatus.toUpperCase()}
                        </span>
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${orderBadgeClass}`}>
                          <span className="w-1 h-1 rounded-full bg-current mr-1.5"></span>
                          {order.orderStatus.toUpperCase()}
                        </span>
                      </td>

                      {}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-[#111E16] font-semibold">
                        {order.createdDate}
                      </td>

                      {}
                      <td className="py-4 px-6 whitespace-nowrap text-right text-xs font-bold">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/orders/details/${order.id}`)}
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
                              setEditingOrder(order);
                              setIsEditModalOpen(true);
                            }}
                            title="Update status"
                            className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded-lg transition-all cursor-pointer"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handlePrintInvoice(order.id)}
                            title="Print Invoice"
                            className="p-1.5 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded-lg transition-all cursor-pointer"
                          >
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </button>

                          {order.orderStatus !== 'Cancelled' && (
                            <button
                              onClick={() => setCancelConfirmId(order.id)}
                              title="Cancel Order"
                              className="p-1.5 text-[#6F7A70] hover:text-[#BA1A1A] hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
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
      {isEditModalOpen && editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-md shadow-xl animate-scale-up overflow-hidden">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00522E]">Update Order Status</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-left">
              <p className="text-xs text-[#6F7A70] mb-4">
                Modifying details for Order <span className="font-bold text-[#111E16]">#{editingOrder.id}</span> (Customer: {editingOrder.customerName}).
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111E16] block">Order Status</label>
                <select
                  value={formOrderStatus}
                  onChange={(e) => setFormOrderStatus(e.target.value as any)}
                  className="w-full bg-[#E8F8E9] text-sm text-[#111E16] border border-[#BEC9BE] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#00522E]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out For Delivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111E16] block">Payment Status</label>
                <select
                  value={formPaymentStatus}
                  onChange={(e) => setFormPaymentStatus(e.target.value as any)}
                  className="w-full bg-[#E8F8E9] text-sm text-[#111E16] border border-[#BEC9BE] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#00522E]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111E16] block">Delivery Status</label>
                <select
                  value={formDeliveryStatus}
                  onChange={(e) => setFormDeliveryStatus(e.target.value as any)}
                  className="w-full bg-[#E8F8E9] text-sm text-[#111E16] border border-[#BEC9BE] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#00522E]"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#BEC9BE]/60 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-[#BEC9BE] hover:bg-[#F6F6F6] text-[#111E16] text-xs font-bold rounded-lg cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {cancelConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl w-full max-w-sm p-6 shadow-xl animate-scale-up text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-[#BA1A1A] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#111E16]">Cancel Order #{cancelConfirmId}?</h3>
              <p className="text-xs text-[#6F7A70]">
                Are you sure you want to cancel this order? This will mark the order and shipping status as Cancelled.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCancelConfirmId(null)}
                className="px-4 py-2 border border-[#BEC9BE] hover:bg-[#F6F6F6] text-[#111E16] text-xs font-bold rounded-lg cursor-pointer"
              >
                No, Keep Order
              </button>
              <button
                onClick={handleCancelConfirm}
                className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#930006] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl w-full max-w-sm p-6 shadow-xl animate-scale-up text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-[#BA1A1A] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#111E16]">Delete Order Permanently?</h3>
              <p className="text-xs text-[#6F7A70]">
                This action is irreversible. All records for this order will be removed from the dashboard storage.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-[#BEC9BE] hover:bg-[#F6F6F6] text-[#111E16] text-xs font-bold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#930006] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {bulkConfirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl w-full max-w-sm p-6 shadow-xl animate-scale-up text-center space-y-4">
            <div className="w-12 h-12 bg-[#E8F8E9] text-[#00522E] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#111E16]">Confirm Bulk Action</h3>
              <p className="text-xs text-[#6F7A70]">
                Are you sure you want to perform bulk "{bulkConfirmAction}" on {selectedOrderIds.length} selected orders?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setBulkConfirmAction(null)}
                className="px-4 py-2 border border-[#BEC9BE] hover:bg-[#F6F6F6] text-[#111E16] text-xs font-bold rounded-lg cursor-pointer"
              >
                No, Go Back
              </button>
              <button
                onClick={handleBulkAction}
                className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
              >
                Yes, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
