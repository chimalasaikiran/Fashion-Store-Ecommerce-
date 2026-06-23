import { useState, useEffect } from 'react';
import { useShipments, type RefundRequest } from './ShipmentsContext';
import { formatCurrency } from '../../data/mockDb';

export default function RefundProcessing() {
  const { refundRequests, approveRefund, rejectRefund, processRefund } = useShipments();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RefundRequest['status']>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);

  const [isProcessingGateway, setIsProcessingGateway] = useState(false);

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

  const handleApprove = (ref: RefundRequest) => {
    approveRefund(ref.id);
    showToast(`Refund Request #${ref.id} has been approved for gateway release.`, 'success');
    setSelectedRefund(prev => prev && prev.id === ref.id ? { 
      ...prev, 
      status: 'Pending',
      timeline: [...prev.timeline, { title: 'Approved by Merchant', timestamp: new Date().toLocaleString() }]
    } : prev);
  };

  const handleReject = (ref: RefundRequest) => {
    rejectRefund(ref.id);
    showToast(`Refund Request #${ref.id} was rejected.`, 'info');
    setSelectedRefund(prev => prev && prev.id === ref.id ? { 
      ...prev, 
      status: 'Failed',
      timeline: [...prev.timeline, { title: 'Refund Rejected', timestamp: new Date().toLocaleString() }]
    } : prev);
  };

  const handleProcess = (ref: RefundRequest) => {
    setIsProcessingGateway(true);
    showToast(`Initiating gateway transaction for #${ref.id}...`, 'info');

    setTimeout(() => {
      processRefund(ref.id);
      setIsProcessingGateway(false);
      showToast(`Gateway approved! Refund of ${formatCurrency(ref.amount)} credited back to account.`, 'success');
      setSelectedRefund(prev => prev && prev.id === ref.id ? {
        ...prev,
        status: 'Processed',
        timeline: [
          ...prev.timeline,
          { title: 'Processed through Gateway', timestamp: new Date().toLocaleString() },
          { title: 'Gateway Cleared', timestamp: new Date().toLocaleString() }
        ]
      } : prev);
    }, 1800);
  };

  const filtered = refundRequests.filter(ref => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      ref.id.toLowerCase().includes(query) ||
      ref.orderId.toLowerCase().includes(query) ||
      ref.paymentMethod.toLowerCase().includes(query) ||
      ref.reason.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || ref.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const totalCount = refundRequests.length;
  const pendingCount = refundRequests.filter(r => r.status === 'Pending').length;
  const processedCount = refundRequests.filter(r => r.status === 'Processed').length;
  const failedCount = refundRequests.filter(r => r.status === 'Failed').length;

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

      {isProcessingGateway && (
        <div className="fixed inset-0 bg-[#242424]/60 backdrop-blur-xs z-50 flex flex-col items-center justify-center text-white gap-4">
          <div className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="text-center space-y-1">
            <h4 className="text-lg font-bold">Contacting Payment Processor</h4>
            <p className="text-xs text-white/70">Connecting with transaction gateway via SSL handshake...</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16]">
            Refund Processing
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Audit payment receipts, coordinate gateway reversals, and trace settlement ledgers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-[#00522E]/10 rounded-lg text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Refunds</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block font-mono">
              {isLoading ? '...' : (86 + totalCount)}
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
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Pending Queue</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block font-mono">
              {isLoading ? '...' : (2 + pendingCount)}
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
            <span className="text-[10px] font-bold text-white/70 tracking-wider uppercase block">Processed Receipts</span>
            <span className="text-2xl font-extrabold text-white tracking-tight block font-mono">
              {isLoading ? '...' : (81 + processedCount)}
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
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Failed Logs</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block font-mono">
              {isLoading ? '...' : (3 + failedCount)}
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
                placeholder="Search ID, Order, Method..."
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
              <option value="Processed">Processed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-xs overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-[#E8F8E9]/50 text-[#6F7A70] border-b border-[#BEC9BE]/60">
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Refund ID</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Order ID</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase text-right">Amount</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Method</th>
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
                        <td className="py-4 px-4"><div className="w-14 h-4 bg-gray-200 rounded ml-auto"></div></td>
                        <td className="py-4 px-4"><div className="w-24 h-4 bg-gray-200 rounded"></div></td>
                        <td className="py-4 px-4"><div className="w-20 h-5 bg-gray-200 rounded-full"></div></td>
                        <td className="py-4 px-4"><div className="w-20 h-4 bg-gray-200 rounded"></div></td>
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#6F7A70] font-semibold">
                        No refund requests match current filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map(ref => {
                      const isSelected = selectedRefund?.id === ref.id;
                      
                      let badge = 'bg-gray-100 text-gray-800 border-gray-200';
                      if (ref.status === 'Processed') badge = 'bg-[#EDFEEF] text-[#00522E] border-emerald-200';
                      else if (ref.status === 'Pending') badge = 'bg-amber-50 text-amber-800 border-amber-200';
                      else if (ref.status === 'Failed') badge = 'bg-red-50 text-[#BA1A1A] border-red-200';

                      return (
                        <tr
                          key={ref.id}
                          onClick={() => setSelectedRefund(ref)}
                          className={`hover:bg-[#E8F8E9]/20 transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#00522E]/5 border-l-4 border-[#00522E]' : ''
                          }`}
                        >
                          <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-[#00522E]">
                            #{ref.id}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap font-semibold text-[#111E16]">
                            #{ref.orderId}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-right font-mono font-bold text-[#111E16]">
                            {formatCurrency(ref.amount)}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-xs font-semibold text-[#6F7A70]">
                            {ref.paymentMethod}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge}`}>
                              {ref.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-[#6F7A70] font-semibold">
                            {ref.requestDate}
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
          {selectedRefund ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#111E16]">Transaction Reversal</h3>
                <p className="text-xs text-[#6F7A70] font-mono mt-0.5">Reference ID: {selectedRefund.id}</p>
              </div>

              <div className="border border-[#BEC9BE]/40 rounded-lg p-4 bg-[#F6F6F6] text-center space-y-1">
                <span className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider">Refund Amount</span>
                <span className="text-2xl font-extrabold font-mono text-[#00522E]">{formatCurrency(selectedRefund.amount)}</span>
                <p className="text-[11px] text-[#6F7A70] font-semibold">{selectedRefund.paymentMethod}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#BEC9BE]/20 pb-1.5">
                  <span className="text-[#6F7A70] font-semibold">Reason:</span>
                  <span className="text-[#111E16] font-bold italic">"{selectedRefund.reason}"</span>
                </div>
                <div className="flex justify-between border-b border-[#BEC9BE]/20 pb-1.5">
                  <span className="text-[#6F7A70] font-semibold">Order ID:</span>
                  <span className="text-[#111E16] font-bold">#{selectedRefund.orderId}</span>
                </div>
                {selectedRefund.transactionId && (
                  <div className="flex justify-between border-b border-[#BEC9BE]/20 pb-1.5">
                    <span className="text-[#6F7A70] font-semibold">Gateway ID:</span>
                    <span className="text-[#111E16] font-mono font-bold">{selectedRefund.transactionId}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <span className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider">Gateway Audit Log</span>
                <div className="relative pl-4 border-l border-[#BEC9BE] space-y-3.5">
                  {selectedRefund.timeline.map((evt, index) => (
                    <div key={index} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#00522E] border-2 border-white"></span>
                      <p className="text-xs font-bold text-[#111E16]">{evt.title}</p>
                      <p className="text-[10px] text-[#6F7A70]">{evt.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                {selectedRefund.status === 'Pending' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(selectedRefund)}
                        className="flex-1 bg-white border border-[#BEC9BE] hover:bg-red-50 text-[#BA1A1A] text-xs font-bold py-3 rounded-lg transition-all cursor-pointer shadow-xs"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(selectedRefund)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-lg transition-all cursor-pointer shadow-xs"
                        disabled={selectedRefund.timeline.some(t => t.title.includes('Approved'))}
                      >
                        {selectedRefund.timeline.some(t => t.title.includes('Approved')) ? 'Approved' : 'Approve Refund'}
                      </button>
                    </div>
                    <button
                      onClick={() => handleProcess(selectedRefund)}
                      className="w-full bg-[#00522E] hover:bg-[#00361E] text-white text-xs font-bold py-3 rounded-lg transition-all shadow-xs cursor-pointer"
                      disabled={!selectedRefund.timeline.some(t => t.title.includes('Approved'))}
                    >
                      Process Release
                    </button>
                  </div>
                )}

                {selectedRefund.status === 'Processed' && (
                  <div className="p-3.5 bg-[#EDFEEF] border border-emerald-200 text-[#00522E] rounded-lg text-xs leading-relaxed">
                    <span className="font-bold block mb-1">Gateway Cleared</span>
                    This refund transaction was processed successfully. Funds have been returned to the customer's account and the order ledger updated.
                  </div>
                )}

                {selectedRefund.status === 'Failed' && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-[#BA1A1A] rounded-lg text-xs leading-relaxed">
                    <span className="font-bold block mb-1">Reversal Rejected/Failed</span>
                    The refund reversal failed or was rejected by administrative overrides. Review original payment logs or bank routing codes.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-[#6F7A70] p-6 space-y-3">
              <svg className="w-12 h-12 text-[#BEC9BE]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-bold text-sm text-[#111E16]">Select a Request</h4>
              <p className="text-xs">Click on any transaction record in the queue on the left to verify settlement details and trigger bank communication.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
