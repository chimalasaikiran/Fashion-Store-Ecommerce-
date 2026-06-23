import { useState, useEffect } from 'react';
import { useShipments, type Shipment } from './ShipmentsContext';
import { formatCurrency } from '../../data/mockDb';

export default function TrackShipments() {
  const { shipments, updateShipmentStatus } = useShipments();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Shipment['status']>('All');
  const [courierFilter, setCourierFilter] = useState<'All' | string>('All');
  const [sortBy, setSortBy] = useState<'id' | 'orderId' | 'customerName' | 'shippingCost' | 'dispatchDate'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [editingStatus, setEditingStatus] = useState<Shipment['status']>('Draft');
  const [newTrackingNum, setNewTrackingNum] = useState('');

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

  const handleRowClick = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setEditingStatus(shipment.status);
    setNewTrackingNum(shipment.trackingNumber || '');
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;

    updateShipmentStatus(selectedShipment.id, editingStatus, newTrackingNum);
    showToast(`Shipment #${selectedShipment.id} updated to ${editingStatus}`, 'success');
    
    setSelectedShipment(prev => prev ? {
      ...prev,
      status: editingStatus,
      trackingNumber: newTrackingNum
    } : null);
  };

  const handleNotifyCustomer = (shipment: Shipment) => {
    showToast(`Notification email sent to ${shipment.customerEmail} for parcel tracking update!`, 'success');
  };

  const filtered = shipments.filter(ship => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      ship.id.toLowerCase().includes(query) ||
      ship.orderId.toLowerCase().includes(query) ||
      (ship.trackingNumber && ship.trackingNumber.toLowerCase().includes(query)) ||
      ship.customerName.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || ship.status === statusFilter;
    const matchesCourier = courierFilter === 'All' || ship.courier === courierFilter;

    return matchesSearch && matchesStatus && matchesCourier;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'dispatchDate') {
      const timeA = new Date(a.dispatchDate).getTime();
      const timeB = new Date(b.dispatchDate).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
    if (sortBy === 'shippingCost') {
      const valA = a.shippingCost;
      const valB = b.shippingCost;
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    
    const valA = String(a[sortBy] || '').toLowerCase();
    const valB = String(b[sortBy] || '').toLowerCase();
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const totalCount = shipments.length;
  const inTransitCount = shipments.filter(s => s.status === 'In Transit').length;
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;
  const delayedCount = shipments.filter(s => s.status === 'Delayed').length;

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
            Track Shipments
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Track all outbound shipments, delivery timings, and courier updates in real-time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-[#00522E]/10 rounded-lg text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 9h4l3 3v4H3V9h10z" />
              </svg>
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Shipments</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">
              {isLoading ? '...' : (12840 + totalCount).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800">
              +5.1%
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">In Transit</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block font-mono">
              {isLoading ? '...' : (2100 + inTransitCount).toLocaleString()}
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
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8E9] text-[#00522E]">
              +18.2%
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-white/70 tracking-wider uppercase block">Delivered</span>
            <span className="text-2xl font-extrabold text-white tracking-tight block font-mono">
              {isLoading ? '...' : (10290 + deliveredCount).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="p-2 bg-red-50 rounded-lg text-[#BA1A1A]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800">
              Critical
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Delayed</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block font-mono">
              {isLoading ? '...' : (12 + delayedCount)}
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
                placeholder="Search Tracking, Order, Customer..."
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
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Ready to Ship">Ready to Ship</option>
              <option value="Dispatched">Dispatched</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Delayed">Delayed</option>
            </select>

            <select
              value={courierFilter}
              onChange={(e) => {
                setCourierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto bg-white border border-[#BEC9BE] rounded-lg px-4 py-2 text-sm font-semibold text-[#111E16] focus:outline-none cursor-pointer focus:border-[#00522E]"
            >
              <option value="All">All Couriers</option>
              <option value="Delhivery">Delhivery</option>
              <option value="Blue Dart">Blue Dart</option>
              <option value="DTDC Express">DTDC Express</option>
              <option value="Shadowfax">Shadowfax</option>
            </select>
          </div>

          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-xs overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-[#E8F8E9]/50 text-[#6F7A70] border-b border-[#BEC9BE]/60">
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E]" onClick={() => toggleSort('id')}>
                      Tracking ID {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E]" onClick={() => toggleSort('orderId')}>
                      Order ID {sortBy === 'orderId' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E]" onClick={() => toggleSort('customerName')}>
                      Recipient {sortBy === 'customerName' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Courier</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase">Status</th>
                    <th className="py-4 px-4 font-bold text-xs tracking-wider uppercase cursor-pointer hover:text-[#00522E]" onClick={() => toggleSort('dispatchDate')}>
                      Dispatch Date {sortBy === 'dispatchDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BEC9BE]/30">
                  {isLoading ? (
                    Array.from({ length: itemsPerPage }).map((_, idx) => (
                      <tr key={`skel-${idx}`} className="animate-pulse">
                        <td className="py-4 px-4"><div className="w-24 h-4 bg-gray-200 rounded"></div></td>
                        <td className="py-4 px-4"><div className="w-16 h-4 bg-gray-200 rounded"></div></td>
                        <td className="py-4 px-4"><div className="w-28 h-4 bg-gray-200 rounded"></div></td>
                        <td className="py-4 px-4"><div className="w-24 h-4 bg-gray-200 rounded"></div></td>
                        <td className="py-4 px-4"><div className="w-20 h-5 bg-gray-200 rounded-full"></div></td>
                        <td className="py-4 px-4"><div className="w-20 h-4 bg-gray-200 rounded"></div></td>
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#6F7A70] font-semibold">
                        No shipments found matching filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((ship) => {
                      const isSelected = selectedShipment?.id === ship.id;
                      
                      let badgeColor = 'bg-gray-100 text-gray-800 border-gray-200';
                      if (ship.status === 'Delivered') badgeColor = 'bg-[#EDFEEF] text-[#00522E] border-emerald-200';
                      else if (ship.status === 'In Transit') badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
                      else if (ship.status === 'Ready to Ship') badgeColor = 'bg-purple-50 text-purple-800 border-purple-200';
                      else if (ship.status === 'Delayed') badgeColor = 'bg-red-50 text-[#BA1A1A] border-red-200';
                      else if (ship.status === 'Draft') badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';

                      return (
                        <tr
                          key={ship.id}
                          onClick={() => handleRowClick(ship)}
                          className={`hover:bg-[#E8F8E9]/20 transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#00522E]/5 border-l-4 border-[#00522E]' : ''
                          }`}
                        >
                          <td className="py-4 px-4 whitespace-nowrap font-bold text-[#00522E] font-mono">
                            {ship.trackingNumber || 'Manifest Pending'}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap font-semibold text-[#111E16]">
                            #{ship.orderId}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-[#111E16] font-semibold">
                            {ship.customerName}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-[#6F7A70] font-semibold">
                            {ship.courier} ({ship.shippingMethod})
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
                              {ship.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-[#6F7A70] font-semibold">
                            {ship.dispatchDate}
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

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-6 shadow-xs min-h-[480px]">
          {selectedShipment ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#111E16]">Tracking Details</h3>
                <p className="text-xs text-[#6F7A70] font-mono mt-1">Shipment ID: {selectedShipment.id}</p>
              </div>

              <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 border-b border-[#BEC9BE]/40 pb-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#6F7A70] uppercase mb-1">Carrier Status</label>
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(e.target.value as any)}
                      className="w-full bg-[#E8F8E9] text-xs text-[#111E16] font-bold rounded-lg px-2.5 py-2 border border-[#BEC9BE] focus:outline-none"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Ready to Ship">Ready to Ship</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Delayed">Delayed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#6F7A70] uppercase mb-1">Tracking Number</label>
                    <input
                      type="text"
                      value={newTrackingNum}
                      onChange={(e) => setNewTrackingNum(e.target.value)}
                      placeholder="e.g. DLV-991823"
                      className="w-full bg-white text-xs text-[#111E16] font-semibold rounded-lg px-2.5 py-2 border border-[#BEC9BE] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold py-2 rounded-lg cursor-pointer transition-all shadow-xs"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNotifyCustomer(selectedShipment)}
                    title="Send Email Alert"
                    className="p-2 bg-white border border-[#BEC9BE] hover:bg-[#F6F6F6] text-[#00522E] rounded-lg cursor-pointer transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[#6F7A70] uppercase tracking-wider">Tracking Timeline</h4>
                <div className="relative pl-6 border-l-2 border-[#DCECDE] space-y-6">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#00522E] border-4 border-white"></span>
                    <h5 className="text-xs font-bold text-[#111E16]">
                      {selectedShipment.status === 'Delivered' ? 'Package Delivered' : selectedShipment.status === 'Delayed' ? 'Fulfillment Delayed' : 'Outbound Transit'}
                    </h5>
                    <p className="text-[11px] text-[#6F7A70] mt-0.5">Carrier facility scan - {selectedShipment.estDeliveryDate}</p>
                  </div>

                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-white ${
                      ['In Transit', 'Delivered', 'Delayed'].includes(selectedShipment.status) ? 'bg-[#00522E]' : 'bg-gray-300'
                    }`}></span>
                    <h5 className="text-xs font-bold text-[#111E16]">Dispatched from Warehouse</h5>
                    <p className="text-[11px] text-[#6F7A70] mt-0.5">Manifest processed by {selectedShipment.courier} - {selectedShipment.dispatchDate}</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#00522E] border-4 border-white"></span>
                    <h5 className="text-xs font-bold text-[#111E16]">Shipping Label Generated</h5>
                    <p className="text-[11px] text-[#6F7A70] mt-0.5">Assigned method: {selectedShipment.shippingMethod} (Rate: {formatCurrency(selectedShipment.shippingCost)})</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#E8F8E9]/50 border border-[#BEC9BE]/40 rounded-lg p-4 space-y-2">
                <span className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider">Package Contents</span>
                <p className="text-xs text-[#111E16] font-semibold leading-relaxed">
                  {selectedShipment.packageSummary}
                </p>
                <div className="pt-2 border-t border-[#BEC9BE]/30 text-[10px] font-bold text-[#6F7A70] flex justify-between">
                  <span>Method: {selectedShipment.shippingMethod.toUpperCase()}</span>
                  <span>Cost: {formatCurrency(selectedShipment.shippingCost)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-[#6F7A70] p-6 space-y-3">
              <svg className="w-12 h-12 text-[#BEC9BE]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <h4 className="font-bold text-sm text-[#111E16]">No Shipment Selected</h4>
              <p className="text-xs">Click on any shipment row in the table to display its tracking status, timeline, and edit options.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
