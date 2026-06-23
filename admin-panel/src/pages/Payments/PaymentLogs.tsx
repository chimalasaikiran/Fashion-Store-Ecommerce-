import { useState, useEffect } from 'react';
import { usePayments, type Transaction } from './PaymentsContext';
import { formatCurrency } from '../../data/mockDb';

export default function PaymentLogs() {
  const { transactions, initiateRefund } = usePayments();

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInitiateRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn) return;
    initiateRefund(selectedTxn.id, refundReason);
    showToast(`Refund processed for transaction ${selectedTxn.id}`, 'success');
    
    const updatedTxn = { ...selectedTxn, status: 'REFUNDED' as const };
    setSelectedTxn(updatedTxn);
    
    setIsRefunding(false);
    setRefundReason('');
  };

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Order ID', 'Customer Name', 'Customer Email', 'Amount', 'Tax', 'Method', 'Detail', 'Status', 'Date', 'Gateway', 'Reference ID'];
    const rows = filteredTxns.map(t => [
      t.id,
      t.orderId,
      t.customerName,
      t.customerEmail,
      t.amount.toFixed(2),
      t.tax.toFixed(2),
      t.method,
      t.methodDetail,
      t.status,
      t.date,
      t.gateway,
      t.referenceId
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payment_logs_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded successfully.', 'success');
  };

  const handleDownloadReceipt = (txn: Transaction) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocker prevented receipt preview.', 'error');
      return;
    }
    const html = `
      <html>
        <head>
          <title>Receipt ${txn.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #242424; }
            .header { border-bottom: 2px solid #00522E; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #00522E; }
            .title { font-size: 20px; font-weight: bold; text-align: right; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .box { padding: 15px; border: 1px solid #BEC9BE; border-radius: 8px; background: #EDFEEF/10; }
            .label { font-size: 11px; text-transform: uppercase; color: #797979; font-weight: bold; margin-bottom: 4px; }
            .val { font-size: 14px; font-weight: 600; }
            .table { w-full; border-collapse: collapse; margin-top: 20px; }
            th { background: #E8F8E9; font-size: 12px; padding: 10px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #BEC9BE/30; font-size: 13px; }
            .totals { text-align: right; margin-top: 30px; font-size: 16px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">FASHION STORE</div>
            <div class="title">TRANSACTION RECEIPT</div>
          </div>
          <div class="grid">
            <div class="box">
              <div class="label">Transaction Details</div>
              <div class="val">ID: ${txn.id}</div>
              <div class="val">Order ID: ${txn.orderId}</div>
              <div class="val">Date: ${new Date(txn.date).toLocaleString()}</div>
              <div class="val">Status: ${txn.status}</div>
            </div>
            <div class="box">
              <div class="label">Customer Information</div>
              <div class="val">${txn.customerName}</div>
              <div class="val">${txn.customerEmail}</div>
              <div class="val">Address: ${txn.billingAddress}</div>
            </div>
          </div>
          <table style="width:100%" class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Payment Gateway</th>
                <th>Method Details</th>
                <th style="text-align:right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Payment for Order Reference ${txn.orderId}</td>
                <td>${txn.gateway}</td>
                <td>${txn.method} (${txn.methodDetail})</td>
                <td style="text-align:right">${formatCurrency(txn.amount - txn.tax)}</td>
              </tr>
            </tbody>
          </table>
          <div class="totals">
            <div>GST: ${formatCurrency(txn.tax)}</div>
            <div style="font-size:20px; color:#00522E; margin-top:10px;">Total Paid: ${formatCurrency(txn.amount)}</div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    showToast('Receipt printed successfully.', 'success');
  };

  const filteredTxns = transactions.filter(t => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      t.id.toLowerCase().includes(query) ||
      t.orderId.toLowerCase().includes(query) ||
      t.customerName.toLowerCase().includes(query) ||
      t.customerEmail.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesMethod = methodFilter === 'All' || t.method.toLowerCase().includes(methodFilter.toLowerCase());
    
    let matchesDate = true;
    if (dateRange === 'Oct 2023') {
      matchesDate = t.date.startsWith('2023-10');
    }

    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  const sortedTxns = [...filteredTxns].sort((a, b) => {
    if (sortBy === 'date') {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    } else {
      return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    }
  });

  const totalItems = sortedTxns.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTxns = sortedTxns.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const totalTxns = transactions.length;
  const successTxns = transactions.filter(t => t.status === 'SUCCESS').length;
  const pendingTxns = transactions.filter(t => t.status === 'PENDING').length;
  const refundedTxns = transactions.filter(t => t.status === 'REFUNDED').length;
  const totalRevenue = transactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const getStatusBadgeStyles = (status: Transaction['status']) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'FAILED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 relative select-none">
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3.5 bg-white border border-[#BEC9BE] rounded-xl shadow-xl animate-slide-in-right">
          <div className={`w-3 h-3 rounded-full ${
            toast.type === 'success' ? 'bg-[#00522E]' : toast.type === 'error' ? 'bg-[#BA1A1A]' : 'bg-[#F8B057]'
          }`}></div>
          <span className="text-sm font-bold text-[#111E16]">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16]">
            Payment Logs
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Track and monitor all payment transactions across the enterprise ecosystem.
          </p>
        </div>
        
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F6F6F6] text-[#111E16] border border-[#BEC9BE] rounded-lg text-sm font-semibold shadow-xs transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 text-[#111E16]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#E2F2E3] text-[#00522E] rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8E9] text-[#00522E]">
              Active
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Trans.</span>
            <span className="text-2xl font-extrabold text-[#111E16] block">{isLoading ? '...' : totalTxns}</span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Clear Rate
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Successful</span>
            <span className="text-2xl font-extrabold text-[#111E16] block">{isLoading ? '...' : successTxns}</span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              Review
            </span>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Pending</span>
            <span className="text-2xl font-extrabold text-amber-800 block">{isLoading ? '...' : pendingTxns}</span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Refunded</span>
            <span className="text-2xl font-extrabold text-[#111E16] block">{isLoading ? '...' : refundedTxns}</span>
          </div>
        </div>

        <div className="bg-[#00522E] text-white border border-[#00522E] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[120px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-white/10 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-[#9CF6BB]">TOTAL REVENUE</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold block">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6F7A70]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search transaction ID, order reference, customer name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg pl-11 pr-4 py-2.5 border border-[#BEC9BE]/60 focus:border-[#00522E] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white text-xs font-bold text-[#111E16] border border-[#BEC9BE] rounded-lg px-3 py-2.5 cursor-pointer hover:bg-[#F6F6F6]"
            >
              <option value="All">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white text-xs font-bold text-[#111E16] border border-[#BEC9BE] rounded-lg px-3 py-2.5 cursor-pointer hover:bg-[#F6F6F6]"
            >
              <option value="All">All Methods</option>
              <option value="UPI">UPI / GPay / Paytm</option>
              <option value="NetBanking">Net Banking</option>
              <option value="Card">Cards</option>
              <option value="COD">COD</option>
              <option value="Razorpay">Razorpay</option>
            </select>
          </div>

          <div>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white text-xs font-bold text-[#111E16] border border-[#BEC9BE] rounded-lg px-3 py-2.5 cursor-pointer hover:bg-[#F6F6F6]"
            >
              <option value="All">All Dates</option>
              <option value="Oct 2023">October 2023</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'All' || methodFilter !== 'All' || dateRange !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setMethodFilter('All');
                setDateRange('All');
                showToast('Filters cleared', 'info');
              }}
              className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#BEC9BE] rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-1/4"></div>
            <div className="space-y-3 pt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="h-10 bg-gray-50 rounded-lg animate-pulse flex-1"></div>
                  <div className="h-10 bg-gray-50 rounded-lg animate-pulse w-32"></div>
                  <div className="h-10 bg-gray-50 rounded-lg animate-pulse w-24"></div>
                </div>
              ))}
            </div>
          </div>
        ) : paginatedTxns.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#F8B057]/10 text-[#401900] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#111E16]">No transactions found</h3>
            <p className="text-sm text-[#6F7A70] mt-1 max-w-sm">
              We couldn't find any transaction records matching your active filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#E8F8E9]/40 border-b border-[#BEC9BE]/60 text-xs font-bold text-[#6F7A70] tracking-wider uppercase select-none">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 cursor-pointer" onClick={() => {
                    setSortBy('amount');
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  }}>
                    Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right cursor-pointer" onClick={() => {
                    setSortBy('date');
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                  }}>
                    Date & Time {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BEC9BE]/30 text-sm">
                {paginatedTxns.map((txn) => {
                  const firstInitial = txn.customerName.charAt(0);
                  return (
                    <tr 
                      key={txn.id}
                      onClick={() => { setSelectedTxn(txn); setIsRefunding(false); }}
                      className="hover:bg-[#E8F8E9]/20 transition-all duration-100 cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-[#00522E]">
                        {txn.id}
                      </td>
                      <td className="px-6 py-4 font-mono text-[#6F7A70]">
                        {txn.orderId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-[#00522E] bg-[#E8F8E9] border border-[#BEC9BE]/60">
                            {firstInitial}
                          </span>
                          <span className="font-semibold text-[#111E16]">{txn.customerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-[#111E16]">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="px-6 py-4 text-[#111E16]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#6F7A70]">{txn.method}</span>
                          <span className="text-xs text-[#797979] font-mono">({txn.methodDetail})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeStyles(txn.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-[#6F7A70] font-medium whitespace-nowrap">
                        {new Date(txn.date).toLocaleString(undefined, {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setSelectedTxn(txn); setIsRefunding(false); }}
                            className="p-1 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt(txn)}
                            className="p-1 text-[#6F7A70] hover:text-[#00522E] hover:bg-[#F6F6F6] rounded"
                            title="Download Receipt"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="bg-[#E8F8E9]/10 border-t border-[#BEC9BE] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-semibold text-[#6F7A70]">
            Showing {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} transactions
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className={`px-3 py-1.5 border border-[#BEC9BE] rounded-lg text-xs font-semibold ${
                currentPage === 1 || isLoading ? 'opacity-40 cursor-not-allowed text-[#6F7A70]' : 'text-[#111E16] hover:bg-[#F6F6F6]'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold ${
                    p === currentPage ? 'bg-[#00522E] text-white' : 'text-[#111E16] hover:bg-[#F6F6F6]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
              className={`px-3 py-1.5 border border-[#BEC9BE] rounded-lg text-xs font-semibold ${
                currentPage === totalPages || isLoading ? 'opacity-40 cursor-not-allowed text-[#6F7A70]' : 'text-[#111E16] hover:bg-[#F6F6F6]'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedTxn && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          <div className="absolute inset-0 bg-[#242424]/40 backdrop-blur-xs transition-opacity" onClick={() => setSelectedTxn(null)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-[#BEC9BE] flex flex-col justify-between animate-slide-in-right">
              <div className="px-6 py-5 border-b border-[#BEC9BE]/60 flex items-center justify-between bg-[#E8F8E9]/20">
                <div>
                  <h3 className="text-lg font-bold text-[#111E16]">Transaction Details</h3>
                  <span className="text-xs font-mono text-[#6F7A70]">{selectedTxn.id}</span>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="p-1 rounded-full text-[#797979] hover:bg-[#F6F6F6] hover:text-[#111E16] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center gap-4 px-4 py-3 bg-[#F6F6F6] border border-[#BEC9BE]/40 rounded-xl">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                    selectedTxn.status === 'SUCCESS' ? 'bg-[#00522E]' : selectedTxn.status === 'PENDING' ? 'bg-amber-600' : selectedTxn.status === 'FAILED' ? 'bg-[#BA1A1A]' : 'bg-gray-600'
                  }`}>
                    {selectedTxn.status === 'SUCCESS' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : selectedTxn.status === 'PENDING' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5" />
                      </svg>
                    ) : selectedTxn.status === 'FAILED' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111E16]">
                      {selectedTxn.status === 'SUCCESS' ? 'Payment Successful' : selectedTxn.status === 'PENDING' ? 'Payment Pending' : selectedTxn.status === 'FAILED' ? 'Payment Failed' : 'Refund Issued'}
                    </h4>
                    <p className="text-xs text-[#6F7A70]">
                      Processed on {new Date(selectedTxn.date).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-center py-4 border-b border-[#BEC9BE]/40">
                  <span className="text-xs font-bold text-[#6F7A70] tracking-wider uppercase">Total Paid</span>
                  <h3 className="text-3xl font-mono font-extrabold text-[#111E16] mt-1">
                    {formatCurrency(selectedTxn.amount)}
                  </h3>
                  <span className="text-xs text-[#6F7A70] block mt-1">
                    Inclusive of {formatCurrency(selectedTxn.tax)} GST
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block mb-1">Customer Information</span>
                    <div className="flex items-center gap-3 p-3 bg-[#E8F8E9]/10 border border-[#BEC9BE]/40 rounded-xl">
                      <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-[#00522E] bg-[#E8F8E9] border border-[#BEC9BE]/60">
                        {selectedTxn.customerName.charAt(0)}
                      </span>
                      <div>
                        <span className="font-bold text-[#111E16] block">{selectedTxn.customerName}</span>
                        <span className="text-xs text-[#6F7A70] block">{selectedTxn.customerEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block mb-1">Payment Method</span>
                      <span className="text-sm font-semibold text-[#111E16] block">{selectedTxn.method}</span>
                      <span className="text-xs text-[#6F7A70] block">{selectedTxn.methodDetail}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block mb-1">Gateway</span>
                      <span className="text-sm font-semibold text-[#111E16] block">{selectedTxn.gateway}</span>
                      <span className="text-xs text-[#797979] font-mono block">Ref: {selectedTxn.referenceId.slice(0, 12)}...</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-sm border-t border-[#BEC9BE]/40 pt-3">
                      <span className="text-[#6F7A70] font-medium">Order ID</span>
                      <span className="font-mono font-bold text-[#00522E]">{selectedTxn.orderId}</span>
                    </div>
                    <div className="flex flex-col text-sm">
                      <span className="text-[#6F7A70] font-medium mb-1">Billing Address</span>
                      <span className="text-[#111E16] font-semibold text-xs leading-relaxed">
                        {selectedTxn.billingAddress}
                      </span>
                    </div>
                  </div>
                </div>

                {isRefunding ? (
                  <form onSubmit={handleInitiateRefundSubmit} className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 animate-scale-up">
                    <h4 className="text-xs font-bold text-[#BA1A1A] uppercase tracking-wider">Confirm Refund Request</h4>
                    <div>
                      <label className="block text-xs font-semibold text-[#242424] mb-1">Refund Reason</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Size exchange, Order cancellation..."
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        className="w-full bg-white text-xs text-[#111E16] rounded border border-[#BEC9BE] px-2.5 py-2 focus:outline-none focus:border-[#BA1A1A]"
                      />
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setIsRefunding(false)}
                        className="px-3 py-1.5 text-xs font-bold text-[#6F7A70] hover:text-[#111E16]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#BA1A1A] hover:bg-[#930006] text-white text-xs font-bold rounded"
                      >
                        Initiate Refund
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>

              <div className="p-6 border-t border-[#BEC9BE]/60 bg-[#F6F6F6] grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownloadReceipt(selectedTxn)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Receipt</span>
                </button>
                <button
                  onClick={() => showToast(`Opening details for Order ${selectedTxn.orderId}...`, 'info')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-[#F6F6F6] text-[#111E16] border border-[#BEC9BE] rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View Order</span>
                </button>

                {selectedTxn.status !== 'REFUNDED' && selectedTxn.status !== 'FAILED' && !isRefunding && (
                  <button
                    onClick={() => setIsRefunding(true)}
                    className="col-span-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-rose-50 text-[#BA1A1A] border border-red-200 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                    </svg>
                    <span>Initiate Refund</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
