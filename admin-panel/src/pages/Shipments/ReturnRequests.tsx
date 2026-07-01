import { useState, useEffect } from 'react';
import { useShipments, type ReturnRequest } from './ShipmentsContext';
import { formatCurrency } from '../../data/mockDb';

export default function ReturnRequests() {
  const { returnRequests, approveReturn, rejectReturn, scheduleReturnPickup } = useShipments();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ReturnRequest['status']>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = (req: ReturnRequest) => {
    approveReturn(req.id);
    showToast(`Return request #${req.id} approved successfully!`, 'success');
    
    setSelectedRequest(prev => prev && prev.id === req.id ? { ...prev, status: 'Approved' } : prev);
  };

  const handleReject = (req: ReturnRequest) => {
    rejectReturn(req.id);
    showToast(`Return request #${req.id} was rejected.`, 'info');
    
    setSelectedRequest(prev => prev && prev.id === req.id ? { ...prev, status: 'Rejected' } : prev);
  };

  const handleSchedule = (req: ReturnRequest) => {
    scheduleReturnPickup(req.id);
    showToast(`Return courier pickup scheduled for Request #${req.id}!`, 'success');
    
    setSelectedRequest(prev => prev && prev.id === req.id ? { ...prev, status: 'Pickup Scheduled' } : prev);
  };

  const filtered = returnRequests.filter(req => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      req.id.toLowerCase().includes(query) ||
      req.orderId.toLowerCase().includes(query) ||
      req.customerName.toLowerCase().includes(query) ||
      req.productName.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const totalCount = returnRequests.length;
  const pendingCount = returnRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = returnRequests.filter(r => r.status === 'Approved' || r.status === 'Pickup Scheduled').length;
  const rejectedCount = returnRequests.filter(r => r.status === 'Rejected').length;

  return (
    <div className="space-y-6 relative pb-12 select-none">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 bg-white border border-[#BEC9BE] rounded-xl shadow-xl animate-slide-in-right">
          <div className={`w-3 h-3 rounded-full ${
            toastType === 'success' ? 'bg-[#00522E]' : toastType === 'error' ? 'bg-[#BA1A1A]' : 'bg-[#F8B057]'
          }`}></div>
          <span className="text-sm font-bold text-[#111E16]">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16]">
            Return Requests
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Oversee, inspect customer claims, approve post-order returns, and dispatch pickup logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-[#00522E]/10 rounded-lg text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
              </svg>
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Requests</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block font-mono">
              {isLoading ? '...' : totalCount}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">
              Awaiting Review
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Pending</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block font-mono">
              {isLoading ? '...' : pendingCount}
            </span>
          </div>
        </div>

        <div className="bg-[#00522E] rounded-xl p-5 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-200 text-white">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-white/10 rounded-lg text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-white/70 tracking-wider uppercase block">Approved Returns</span>
            <span className="text-2xl font-extrabold text-white tracking-tight block font-mono">
              {isLoading ? '...' : approvedCount}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-50 rounded-lg text-[#BA1A1A]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
              </svg>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Rejected Returns</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block font-mono">
              {isLoading ? '...' : rejectedCount}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-xs">
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#6F7A70]">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search ID, Order, Product..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#E8F8E9] text-sm text-[#111E16] placeholder-[#6F7A70] rounded-lg pl-10 pr-4 py-2 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none transition-all"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto bg-white border border-[#BEC9BE] rounded-lg px-4 py-2 text-sm font-semibold text-[#111E16] focus:outline-none cursor-pointer focus:border-[#00522E]"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Pickup Scheduled">Pickup Scheduled</option>
            </select>
          </div>

          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-xs overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-[#E8F8E9]/50 text-[#6F7A70] border-b border-[#BEC9BE]/60">
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Request ID</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Order ID</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Customer</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Reason</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Status</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BEC9BE]/30">
                  {isLoading ? (
                    Array.from({ length: itemsPerPage }).map((_, idx) => (
                      <tr key={`skel-${idx}`} className="animate-pulse">
                        <td className="py-4 px-4"><div className="w-16 h-4 bg-gray-200 rounded"></div></td>
                        <td className="py-4 px-4"><div className="w-16 h-4 bg-gray-200 rounded"></div></td>
                        <td className="py-4 px-4"><div className="w-24 h-4 bg-gray-200 rounded"></div></td>
                        <td className="py-4 px-4"><div className="w-32 h-4 bg-gray-200 rounded"></div></td>
                        <td className="py-4 px-4"><div className="w-20 h-5 bg-gray-200 rounded-full"></div></td>
                        <td className="py-4 px-4"><div className="w-20 h-4 bg-gray-200 rounded"></div></td>
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#6F7A70] font-semibold">
                        No return requests match current filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map(req => {
                      const isSelected = selectedRequest?.id === req.id;
                      
                      let badge = 'bg-gray-100 text-gray-800 border-gray-200';
                      if (req.status === 'Approved') badge = 'bg-[#EDFEEF] text-[#00522E] border-emerald-200';
                      else if (req.status === 'Pending') badge = 'bg-amber-50 text-amber-800 border-amber-200';
                      else if (req.status === 'Pickup Scheduled') badge = 'bg-blue-50 text-blue-800 border-blue-200';
                      else if (req.status === 'Rejected') badge = 'bg-red-50 text-[#BA1A1A] border-red-200';

                      return (
                        <tr
                          key={req.id}
                          onClick={() => setSelectedRequest(req)}
                          className={`hover:bg-[#E8F8E9]/20 transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#00522E]/5 border-l-4 border-[#00522E]' : ''
                          }`}
                        >
                          <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-[#00522E]">
                            #{req.id}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap font-semibold text-[#111E16]">
                            #{req.orderId}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap font-semibold text-[#111E16]">
                            {req.customerName}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-[#6F7A70] font-semibold">
                            {req.reason}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-[#6F7A70] font-semibold">
                            {req.requestDate}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#BEC9BE]/40 px-6 py-4 bg-white select-none">
                <span className="text-xs text-[#6F7A70] font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-1.5 rounded bg-white hover:bg-[#F6F6F6] text-[#111E16] border border-[#BEC9BE]/60 cursor-pointer disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-1.5 rounded bg-white hover:bg-[#F6F6F6] text-[#111E16] border border-[#BEC9BE]/60 cursor-pointer disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-6 shadow-xs min-h-[420px]">
          {selectedRequest ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#111E16]">Return Claim</h3>
                <p className="text-xs text-[#6F7A70] font-mono mt-0.5">ID: {selectedRequest.id}</p>
              </div>

              <div className="border border-[#BEC9BE]/40 rounded-lg p-4 bg-[#F6F6F6] space-y-2">
                <span className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider">Product Info</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#111E16]">{selectedRequest.productName}</span>
                  <span className="text-sm font-bold font-mono text-[#00522E]">{formatCurrency(selectedRequest.productPrice)}</span>
                </div>
                <div className="text-xs text-[#6F7A70] pt-1">
                  Reason for Claim: <span className="font-semibold text-amber-800 italic">"{selectedRequest.reason}"</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider">Customer Details</span>
                <p className="text-xs font-bold text-[#111E16]">{selectedRequest.customerName}</p>
                <p className="text-xs text-[#6F7A70]">{selectedRequest.customerEmail}</p>
              </div>

              <div className="pt-2 border-t border-[#BEC9BE]/30">
                <span className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-2">Claim Status</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedRequest.status === 'Approved' ? 'bg-[#EDFEEF] text-[#00522E] border-emerald-200' :
                  selectedRequest.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  selectedRequest.status === 'Pickup Scheduled' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                  'bg-red-50 text-[#BA1A1A] border-red-200'
                }`}>
                  {selectedRequest.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2.5 pt-4">
                {selectedRequest.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(selectedRequest)}
                      className="flex-1 bg-white border border-[#BEC9BE] hover:bg-red-50 text-[#BA1A1A] text-xs font-bold py-3 rounded-lg transition-all shadow-xs cursor-pointer"
                    >
                      Reject Return
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequest)}
                      className="flex-1 bg-[#00522E] hover:bg-[#00361E] text-white text-xs font-bold py-3 rounded-lg transition-all shadow-xs cursor-pointer"
                    >
                      Approve Return
                    </button>
                  </div>
                )}

                {selectedRequest.status === 'Approved' && (
                  <button
                    onClick={() => handleSchedule(selectedRequest)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Schedule Return Pickup</span>
                  </button>
                )}

                {selectedRequest.status === 'Pickup Scheduled' && (
                  <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs leading-relaxed">
                    <span className="font-bold block mb-1">Pickup Scheduled</span>
                    A courier pickup team has been assigned to retrieve this product from the customer's shipping address. Wait for the delivery agent return hand-in.
                  </div>
                )}

                {selectedRequest.status === 'Rejected' && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-[#BA1A1A] rounded-lg text-xs leading-relaxed">
                    <span className="font-bold block mb-1">Claim Rejected</span>
                    This claim was marked as invalid. Customer has been notified about the rejection and can contact support for details.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-[#6F7A70] p-6 space-y-3">
              <svg className="w-12 h-12 text-[#BEC9BE]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
              <h4 className="font-bold text-sm text-[#111E16]">Select a Request</h4>
              <p className="text-xs">Select any row from the return requests list on the left to verify items, read explanations, and initiate workflows.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
