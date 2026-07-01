import { useState, useEffect } from 'react';
import { useShipments, type ReplacementOrder } from './ShipmentsContext';

export default function ReplacementOrders() {
  const { 
    replacementOrders, 
    approveReplacement, 
    rejectReplacement, 
    createReplacementOrder, 
    generateReplacementShipment 
  } = useShipments();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ReplacementOrder['status']>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedRep, setSelectedRep] = useState<ReplacementOrder | null>(null);

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

  const handleApprove = (rep: ReplacementOrder) => {
    approveReplacement(rep.id);
    showToast(`Replacement request #${rep.id} has been approved.`, 'success');
    setSelectedRep(prev => prev && prev.id === rep.id ? { ...prev, status: 'Approved' } : prev);
  };

  const handleReject = (rep: ReplacementOrder) => {
    rejectReplacement(rep.id);
    showToast(`Replacement request #${rep.id} was rejected.`, 'info');
    setSelectedRep(prev => prev && prev.id === rep.id ? { ...prev, status: 'Rejected' } : prev);
  };

  const handleCreateOrder = (rep: ReplacementOrder) => {
    createReplacementOrder(rep.id);
    showToast(`Order #${rep.originalOrderId}-R created in system logs!`, 'success');
    setSelectedRep(prev => prev && prev.id === rep.id ? { ...prev, status: 'Order Created' } : prev);
  };

  const handleGenerateShipment = (rep: ReplacementOrder) => {
    generateReplacementShipment(rep.id);
    showToast(`Replacement package dispatched via Delhivery!`, 'success');
    setTimeout(() => {
      setSelectedRep(prev => {
        if (!prev || prev.id !== rep.id) return prev;
        const updated = replacementOrders.find(r => r.id === rep.id);
        return updated ? { ...prev, status: 'Shipped', trackingNumber: updated.trackingNumber || 'DLV-998822-REP' } : prev;
      });
    }, 50);
  };

  const filtered = replacementOrders.filter(rep => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      rep.id.toLowerCase().includes(query) ||
      rep.originalOrderId.toLowerCase().includes(query) ||
      rep.customerName.toLowerCase().includes(query) ||
      rep.replacementProduct.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || rep.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  const totalCount = replacementOrders.length;
  const pendingCount = replacementOrders.filter(r => r.status === 'Pending').length;
  const approvedCount = replacementOrders.filter(r => r.status === 'Approved' || r.status === 'Order Created').length;
  const shippedCount = replacementOrders.filter(r => r.status === 'Shipped').length;

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
            Replacement Orders
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Coordinate product exchanges, generate system replacement invoices, and launch fulfillment parcels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-[#00522E]/10 rounded-lg text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Replacements</span>
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
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Pending Review</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block font-mono">
              {isLoading ? '...' : pendingCount}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Approved Orders</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block font-mono">
              {isLoading ? '...' : approvedCount}
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
            <span className="text-[10px] font-bold text-white/70 tracking-wider uppercase block">Dispatched</span>
            <span className="text-2xl font-extrabold text-white tracking-tight block font-mono">
              {isLoading ? '...' : shippedCount}
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
              <option value="Order Created">Order Created</option>
              <option value="Shipped">Shipped</option>
            </select>
          </div>

          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-xs overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm min-w-[650px]">
                <thead>
                  <tr className="bg-[#E8F8E9]/50 text-[#6F7A70] border-b border-[#BEC9BE]/60">
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Replacement ID</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Original Order</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Customer</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Exchange Item</th>
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
                        No replacement requests match current filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map(rep => {
                      const isSelected = selectedRep?.id === rep.id;
                      
                      let badge = 'bg-gray-100 text-gray-800 border-gray-200';
                      if (rep.status === 'Shipped') badge = 'bg-[#EDFEEF] text-[#00522E] border-emerald-200';
                      else if (rep.status === 'Pending') badge = 'bg-amber-50 text-amber-800 border-amber-200';
                      else if (rep.status === 'Approved' || rep.status === 'Order Created') badge = 'bg-blue-50 text-blue-800 border-blue-200';
                      else if (rep.status === 'Rejected') badge = 'bg-red-50 text-[#BA1A1A] border-red-200';

                      return (
                        <tr
                          key={rep.id}
                          onClick={() => setSelectedRep(rep)}
                          className={`hover:bg-[#E8F8E9]/20 transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#00522E]/5 border-l-4 border-[#00522E]' : ''
                          }`}
                        >
                          <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-[#00522E]">
                            #{rep.id}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap font-semibold text-[#111E16]">
                            #{rep.originalOrderId}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap font-semibold text-[#111E16]">
                            {rep.customerName}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-[#6F7A70] font-semibold">
                            {rep.replacementProduct}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge}`}>
                              {rep.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-[#6F7A70] font-semibold">
                            {rep.requestDate}
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
          {selectedRep ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#111E16]">Exchange Evaluation</h3>
                <p className="text-xs text-[#6F7A70] font-mono mt-0.5">Ticket ID: {selectedRep.id}</p>
              </div>

              <div className="border border-[#BEC9BE]/40 rounded-lg p-4 bg-[#F6F6F6] space-y-3 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1">Returned Item</span>
                  <span className="font-bold text-[#111E16] block">{selectedRep.originalProduct}</span>
                </div>
                <div className="border-t border-[#BEC9BE]/20 pt-2">
                  <span className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1">Requested Swap</span>
                  <span className="font-bold text-[#00522E] block">{selectedRep.replacementProduct}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#BEC9BE]/20 pb-1.5">
                  <span className="text-[#6F7A70] font-semibold">Original Order:</span>
                  <span className="text-[#111E16] font-bold">#{selectedRep.originalOrderId}</span>
                </div>
                <div className="flex justify-between border-b border-[#BEC9BE]/20 pb-1.5">
                  <span className="text-[#6F7A70] font-semibold">Customer:</span>
                  <span className="text-[#111E16] font-semibold">{selectedRep.customerName}</span>
                </div>
                {selectedRep.trackingNumber && (
                  <div className="flex justify-between border-b border-[#BEC9BE]/20 pb-1.5">
                    <span className="text-[#6F7A70] font-semibold">Replacement Tracking:</span>
                    <span className="text-[#00522E] font-mono font-bold">{selectedRep.trackingNumber}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 pt-4">
                {selectedRep.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(selectedRep)}
                      className="flex-1 bg-white border border-[#BEC9BE] hover:bg-red-50 text-[#BA1A1A] text-xs font-bold py-3 rounded-lg transition-all cursor-pointer shadow-xs"
                    >
                      Reject Exchange
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRep)}
                      className="flex-1 bg-[#00522E] hover:bg-[#00361E] text-white text-xs font-bold py-3 rounded-lg transition-all shadow-xs cursor-pointer"
                    >
                      Approve Exchange
                    </button>
                  </div>
                )}

                {selectedRep.status === 'Approved' && (
                  <button
                    onClick={() => handleCreateOrder(selectedRep)}
                    className="w-full bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold py-3 rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Create Replacement Order</span>
                  </button>
                )}

                {selectedRep.status === 'Order Created' && (
                  <button
                    onClick={() => handleGenerateShipment(selectedRep)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Generate Replacement Shipment</span>
                  </button>
                )}

                {selectedRep.status === 'Shipped' && (
                  <div className="p-3.5 bg-[#EDFEEF] border border-emerald-200 text-[#00522E] rounded-lg text-xs leading-relaxed">
                    <span className="font-bold block mb-1">Exchange Shipped</span>
                    The replacement item has been packaged, labeled, and dispatched under tracking number <span className="font-mono font-bold text-xs">{selectedRep.trackingNumber}</span>.
                  </div>
                )}

                {selectedRep.status === 'Rejected' && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-[#BA1A1A] rounded-lg text-xs leading-relaxed">
                    <span className="font-bold block mb-1">Exchange Disallowed</span>
                    This product exchange ticket was rejected. Customer notification has been logged.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-[#6F7A70] p-6 space-y-3">
              <svg className="w-12 h-12 text-[#BEC9BE]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h4 className="font-bold text-sm text-[#111E16]">Exchange Evaluation</h4>
              <p className="text-xs">Select any swap ticket from the table on the left to evaluate product swap details and trigger order fulfillment workflow.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
