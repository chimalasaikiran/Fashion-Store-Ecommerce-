import React, { useState, useEffect } from 'react';
import { useShipments, type Shipment } from './ShipmentsContext';
import { useOrders } from '../Orders/OrdersContext';
import { COURIERS, formatCurrency } from '../../data/mockDb';

export default function ShipmentCreation() {
  const { shipments, createShipment } = useShipments();
  const { orders } = useOrders();

  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [courier, setCourier] = useState(COURIERS[0]);
  const [shippingMethod, setShippingMethod] = useState<'Air' | 'Sea' | 'Land'>('Air');
  const [packageSummary, setPackageSummary] = useState('');
  const [shippingCost, setShippingCost] = useState(99);
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('2026-06-25');

  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [draftMode, setDraftMode] = useState(false);

  const totalCount = shipments.length;
  const pendingCount = shipments.filter(s => s.status === 'Draft' || s.status === 'Ready to Ship').length;
  const readyToShipCount = shipments.filter(s => s.status === 'Ready to Ship').length;
  const dispatchedCount = shipments.filter(s => s.status === 'Dispatched' || s.status === 'In Transit').length;

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

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orderId = e.target.value;
    setSelectedOrderId(orderId);
    const found = orders.find(o => o.id === orderId);
    if (found) {
      setCustomerName(found.customerName);
      setCustomerEmail(found.customerEmail);
      if (found.shippingAddress) {
        const addr = found.shippingAddress;
        const street = addr.street || '';
        const city = addr.city || '';
        const state = addr.state || '';
        const zip = addr.zip || '';
        const country = addr.country || '';
        setShippingAddress(`${street}, ${city}, ${state}, ${zip}, ${country}`);
      }
      setPackageSummary(`Package containing items for Order #${orderId}`);
    } else {
      setCustomerName('');
      setCustomerEmail('');
      setShippingAddress('');
      setPackageSummary('');
    }
  };

  const handleCreateShipment = (isDraft: boolean) => {
    if (!selectedOrderId) {
      showToast('Please select a customer order first.', 'error');
      return;
    }
    if (!shippingAddress) {
      showToast('Shipping address cannot be empty.', 'error');
      return;
    }

    setDraftMode(isDraft);
    setIsConfirmOpen(true);
  };

  const confirmAction = () => {
    const statusVal: Shipment['status'] = draftMode ? 'Draft' : 'Ready to Ship';
    
    createShipment({
      orderId: selectedOrderId,
      customerName,
      customerEmail,
      shippingAddress,
      courier,
      shippingMethod,
      packageSummary: packageSummary || 'Standard Parcel Shipment',
      shippingCost,
      status: statusVal,
      dispatchDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      estDeliveryDate: new Date(new Date(targetDeliveryDate)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    });

    showToast(
      draftMode 
        ? `Shipment manifest saved as Draft successfully!` 
        : `Shipment created & marked Ready to Ship!`, 
      'success'
    );
    
    setSelectedOrderId('');
    setCustomerName('');
    setCustomerEmail('');
    setShippingAddress('');
    setPackageSummary('');
    setIsConfirmOpen(false);
  };

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

      {isConfirmOpen && (
        <div className="fixed inset-0 bg-[#242424]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-2xl p-6 max-w-md w-full animate-scale-in">
            <h4 className="text-lg font-bold text-[#111E16]">Confirm Shipment Manifest</h4>
            <p className="text-sm text-[#6F7A70] mt-2">
              Are you sure you want to {draftMode ? 'save this shipment as a Draft' : 'create this shipment and queue it for dispatch'}?
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#6F7A70] hover:text-[#111E16] bg-white border border-[#BEC9BE] rounded-lg cursor-pointer hover:bg-[#F6F6F6]"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 text-xs font-bold text-white bg-[#00522E] hover:bg-[#003B21] rounded-lg shadow-sm cursor-pointer"
              >
                Confirm Creation
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111E16] flex items-center gap-2">
            Shipment Creation
          </h2>
          <p className="text-sm text-[#6F7A70] mt-1">
            Create and manage customer shipments with real-time operational oversight.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast('Bulk manifest importing is not available in sandbox mode.', 'info')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F6F6F6] text-[#111E16] border border-[#BEC9BE] rounded-lg text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <span>Bulk Import</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[130px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#00522E]/10 rounded-lg flex items-center justify-center text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 9h4l3 3v4H3V9h10z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8E9] text-[#00522E]">
              +12.5%
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Total Outgoing</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block">
              {isLoading ? '...' : (12840 + totalCount).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[130px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-50 rounded-lg flex items-center justify-center text-amber-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">
              -2.4%
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Pending</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block font-mono">
              {isLoading ? '...' : (430 + pendingCount)}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 min-h-[130px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 rounded-lg flex items-center justify-center text-blue-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 11m8 4V3M4 11v10l8 4" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 text-xs">
              Queue
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-[#6F7A70] tracking-wider uppercase block">Ready to Ship</span>
            <span className="text-2xl font-extrabold text-[#111E16] tracking-tight block font-mono">
              {isLoading ? '...' : (115 + readyToShipCount)}
            </span>
          </div>
        </div>

        <div className="bg-[#00522E] rounded-xl p-5 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-200 text-white min-h-[130px]">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-white/10 rounded-lg flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8E9] text-[#00522E]">
              Active
            </span>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-[10px] font-bold text-white/70 tracking-wider uppercase block">Dispatched</span>
            <span className="text-2xl font-extrabold text-white tracking-tight block font-mono">
              {isLoading ? '...' : (10290 + dispatchedCount).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-[#BEC9BE] rounded-xl p-6 sm:p-8 shadow-xs relative">
          <div className="flex items-center gap-2 mb-6 border-b border-[#BEC9BE]/40 pb-4">
            <div className="p-1.5 bg-[#00522E]/10 rounded-lg text-[#00522E]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#111E16]">Shipment Details</h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#6F7A70] uppercase tracking-wider mb-2">Order Number</label>
                <select
                  value={selectedOrderId}
                  onChange={handleOrderChange}
                  className="w-full bg-[#E8F8E9] text-sm text-[#111E16] font-semibold rounded-lg px-4 py-3 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
                >
                  <option value="">Select Customer Order...</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      #{o.id} - {o.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6F7A70] uppercase tracking-wider mb-2">Customer Selection</label>
                <input
                  type="text"
                  readOnly
                  placeholder="Populated from Order Selection"
                  value={customerName ? `${customerName} (${customerEmail})` : ''}
                  className="w-full bg-[#F6F6F6] text-sm text-[#111E16] font-semibold rounded-lg px-4 py-3 border border-[#BEC9BE]/60 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6F7A70] uppercase tracking-wider mb-2">Shipping Address</label>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Full delivery location address"
                className="w-full bg-white text-sm text-[#111E16] font-semibold rounded-lg px-4 py-3 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#6F7A70] uppercase tracking-wider mb-2">Preferred Courier</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full bg-white text-sm text-[#111E16] font-semibold rounded-lg px-4 py-3 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none cursor-pointer"
                >
                  {COURIERS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6F7A70] uppercase tracking-wider mb-2">Shipping Method</label>
                <div className="grid grid-cols-3 gap-2 bg-[#E8F8E9] p-1 rounded-lg border border-[#BEC9BE]/60">
                  {(['Air', 'Sea', 'Land'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setShippingMethod(method)}
                      className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        shippingMethod === method 
                          ? 'bg-[#00522E] text-white shadow-sm' 
                          : 'text-[#6F7A70] hover:text-[#111E16]'
                      }`}
                    >
                      {method.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#6F7A70] uppercase tracking-wider mb-2">Shipping Cost (₹)</label>
                <input
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white text-sm text-[#111E16] font-semibold rounded-lg px-4 py-3 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6F7A70] uppercase tracking-wider mb-2">Target Delivery Date</label>
                <input
                  type="date"
                  value={targetDeliveryDate}
                  onChange={(e) => setTargetDeliveryDate(e.target.value)}
                  className="w-full bg-white text-sm text-[#111E16] font-semibold rounded-lg px-4 py-3 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6F7A70] uppercase tracking-wider mb-2">Package Contents Summary</label>
              <textarea
                rows={3}
                value={packageSummary}
                onChange={(e) => setPackageSummary(e.target.value)}
                placeholder="List high-value items or special handling instructions..."
                className="w-full bg-white text-sm text-[#111E16] font-semibold rounded-lg px-4 py-3 border border-[#BEC9BE] focus:border-[#00522E] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#BEC9BE]/40">
              <button
                onClick={() => handleCreateShipment(true)}
                className="px-6 py-3 bg-white border border-[#BEC9BE] hover:bg-[#F6F6F6] text-[#111E16] font-bold text-sm rounded-lg transition-all cursor-pointer shadow-xs"
              >
                Save Draft
              </button>
              <button
                onClick={() => handleCreateShipment(false)}
                className="px-8 py-3 bg-[#00522E] hover:bg-[#00361E] text-white font-bold text-sm rounded-lg transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <span>Create Shipment</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#00522E] text-white rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-6">
            <h4 className="text-lg font-bold">Manifest Summary</h4>
            <div className="absolute right-4 top-2 text-white/5 pointer-events-none">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 7H4v10h16V7z M2 5h20v14H2V5z" />
              </svg>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
                <span className="text-xs text-white/70">Fulfillment Items</span>
                <span className="text-sm font-bold font-mono">14 Items</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
                <span className="text-xs text-white/70">Est. Total Weight</span>
                <span className="text-sm font-bold font-mono">248.5 kg</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
                <span className="text-xs text-white/70">Order Declared Value</span>
                <span className="text-sm font-bold font-mono">
                  {formatCurrency(selectedOrderId ? (orders.find(o => o.id === selectedOrderId)?.totalAmount || 0) : 0)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
                <span className="text-xs text-white/70">Hazardous Goods</span>
                <span className="text-sm font-bold">None</span>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <span className="text-xs font-bold tracking-wider uppercase">Fulfillment Fees</span>
                <span className="text-lg font-bold font-mono">{formatCurrency(shippingCost)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#BEC9BE] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#DCECDE] flex items-center justify-center text-[#00522E]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-[#111E16]">{courier}</h4>
                <p className="text-xs text-[#6F7A70] italic">Logistics Partner</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#E8F8E9]/50 border border-[#BEC9BE]/40 rounded-lg">
                <div className="text-[#00522E]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider">Pickup Window</span>
                  <span className="text-sm font-semibold text-[#111E16]">Today, 14:00 - 16:00</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#E8F8E9]/50 border border-[#BEC9BE]/40 rounded-lg">
                <div className="text-[#00522E]">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider">Dispatcher Contact</span>
                  <span className="text-sm font-semibold text-[#111E16]">+91 1800-266-2662</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="block text-[10px] font-bold text-[#6F7A70] uppercase tracking-wider mb-1">Partner Rating</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#F8B057]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs font-bold text-[#111E16] ml-2">4.8/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
