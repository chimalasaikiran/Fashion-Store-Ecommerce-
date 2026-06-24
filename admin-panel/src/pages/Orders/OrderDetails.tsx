import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from './OrdersContext';
import { formatCurrency } from '../../data/mockDb';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const {
    orders,
    updateOrderStatus,
    updatePaymentStatus,
    updateDeliveryStatus,
    cancelOrder,
    refundOrder,
    addOrderNote,
    updateOrderDetails
  } = useOrders();

  const activeId = id || (orders.length > 0 ? orders[0].id : '');
  const order = orders.find(o => o.id === activeId);

  const [newNoteText, setNewNoteText] = useState('');
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isRefundConfirmOpen, setIsRefundConfirmOpen] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);

  const [shippingName, setShippingName] = useState('');
  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');

  const [isLoading, setIsLoading] = useState(true);
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
    }, 700);
    return () => clearTimeout(timer);
  }, [activeId]);

  useEffect(() => {
    if (order) {
      setShippingName(order.shippingAddress.name);
      setShippingStreet(order.shippingAddress.street);
      setShippingCity(order.shippingAddress.city);
      setShippingState(order.shippingAddress.state);
      setShippingZip(order.shippingAddress.zip);
      setShippingCountry(order.shippingAddress.country);
      setShippingPhone(order.shippingAddress.phone);
    }
  }, [order]);

  if (!order) {
    return (
      <div className="bg-white border border-[#BEC9BE] rounded-xl p-16 text-center select-none">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-[#BA1A1A]/10 rounded-full flex items-center justify-center text-[#BA1A1A] mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#111E16]">Order Not Found</h3>
          <p className="text-sm text-[#6F7A70]">
            The order you are trying to view does not exist or has been deleted from the database.
          </p>
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            Back to Orders List
          </Link>
        </div>
      </div>
    );
  }

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    addOrderNote(order.id, 'Store Admin', newNoteText.trim());
    setNewNoteText('');
    showToast("Comment note posted successfully!", "success");
  };

  const handleEditAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName.trim() || !shippingStreet.trim() || !shippingCity.trim() || !shippingZip.trim()) {
      showToast("Please fill in all required address fields.", "error");
      return;
    }

    updateOrderDetails(order.id, {
      shippingAddress: {
        name: shippingName,
        street: shippingStreet,
        city: shippingCity,
        state: shippingState,
        zip: shippingZip,
        country: shippingCountry,
        phone: shippingPhone
      }
    });

    setIsEditAddressOpen(false);
    showToast("Shipping address updated successfully!", "success");
  };

  const handleCancelOrderAction = () => {
    cancelOrder(order.id);
    setIsCancelConfirmOpen(false);
    showToast("Order status has been updated to Cancelled.", "success");
  };

  const handleRefundOrderAction = () => {
    refundOrder(order.id);
    setIsRefundConfirmOpen(false);
    showToast("Order amount successfully refunded.", "success");
  };

  const triggerPrint = () => {
    showToast("Preparing document print layouts...", "info");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  let payStatusClass = '';
  if (order.paymentStatus === 'Paid') payStatusClass = 'bg-[#EDFEEF] text-[#00522E] border-emerald-200';
  else if (order.paymentStatus === 'Pending') payStatusClass = 'bg-amber-50 text-amber-800 border-amber-200';
  else if (order.paymentStatus === 'Refunded') payStatusClass = 'bg-blue-50 text-blue-800 border-blue-200';
  else payStatusClass = 'bg-red-50 text-[#BA1A1A] border-red-200';

  let ordStatusClass = '';
  if (order.orderStatus === 'Delivered') ordStatusClass = 'bg-[#EDFEEF] text-[#00522E] border-emerald-200';
  else if (order.orderStatus === 'Processing') ordStatusClass = 'bg-[#00522E]/10 text-[#00522E] border-emerald-200';
  else if (order.orderStatus === 'Dispatched') ordStatusClass = 'bg-purple-50 text-purple-800 border-purple-200';
  else if (order.orderStatus === 'Shipped') ordStatusClass = 'bg-orange-50 text-orange-800 border-orange-200';
  else if (order.orderStatus === 'Out For Delivery') ordStatusClass = 'bg-sky-50 text-sky-800 border-sky-200';
  else if (order.orderStatus === 'Pending') ordStatusClass = 'bg-amber-50 text-amber-800 border-amber-200';
  else if (order.orderStatus === 'Refunded') ordStatusClass = 'bg-blue-50 text-blue-800 border-blue-200';
  else if (order.orderStatus === 'Confirmed') ordStatusClass = 'bg-blue-50 text-blue-800 border-blue-200'; // Legacy
  else if (order.orderStatus === 'Packed') ordStatusClass = 'bg-indigo-50 text-indigo-800 border-indigo-200'; // Legacy
  else ordStatusClass = 'bg-red-50 text-[#BA1A1A] border-red-200';

  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal > 1500 ? 0 : 99;
  const grandTotal = subtotal + tax + shipping;

  return (
    <div className="space-y-6 select-none relative pb-12">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 bg-white border border-[#BEC9BE] rounded-xl shadow-xl animate-slide-in-right">
          <div className={`w-3 h-3 rounded-full ${
            toastType === 'success' ? 'bg-[#00522E]' : toastType === 'error' ? 'bg-[#BA1A1A]' : 'bg-[#F8B057]'
          }`}></div>
          <span className="text-sm font-bold text-[#111E16]">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/orders"
              className="p-1.5 hover:bg-[#BEC9BE]/30 rounded-lg text-[#6F7A70] hover:text-[#111E16] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#111E16] tracking-tight">
              Order Details
            </h2>
            <span className="font-mono text-sm text-[#6F7A70]">#{order.id}</span>
          </div>
          <p className="text-xs text-[#6F7A70] pl-9">
            Placed on {order.createdDate} • Subtotal: {formatCurrency(subtotal)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {order.orderStatus !== 'Cancelled' && (
            <button
              onClick={() => setIsCancelConfirmOpen(true)}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-[#BA1A1A] border border-red-200 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
            >
              Cancel Order
            </button>
          )}

          {order.paymentStatus === 'Paid' && (
            <button
              onClick={() => setIsRefundConfirmOpen(true)}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
            >
              Refund Order
            </button>
          )}

          <button
            onClick={triggerPrint}
            className="px-3.5 py-2 bg-white hover:bg-[#F6F6F6] text-[#111E16] border border-[#BEC9BE] rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-[#111E16]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Invoice</span>
          </button>

          <button
            onClick={() => showToast("Downloading invoice PDF document...", "success")}
            className="px-3.5 py-2 bg-[#00522E] hover:bg-[#003B21] text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Invoice</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-100 h-64 rounded-xl border border-gray-200"></div>
            <div className="bg-gray-100 h-40 rounded-xl border border-gray-200"></div>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-100 h-48 rounded-xl border border-gray-200"></div>
            <div className="bg-gray-100 h-80 rounded-xl border border-gray-200"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#BEC9BE] rounded-xl shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between bg-[#E8F8E9]/20">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-[#00522E]/10 text-[#00522E] rounded-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </span>
                  <h3 className="font-bold text-[#111E16] text-sm sm:text-base">Ordered Products ({order.items.length})</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ordStatusClass}`}>
                    {order.orderStatus.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${payStatusClass}`}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm min-w-[500px]">
                  <thead>
                    <tr className="bg-[#E8F8E9]/10 text-[#6F7A70] border-b border-[#BEC9BE]/40 text-xs font-bold uppercase select-none">
                      <th className="py-3 px-6">Product details</th>
                      <th className="py-3 px-4 text-right">Price</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-6 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BEC9BE]/20">
                    {order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#E8F8E9]/5">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-16 object-cover bg-gray-50 border border-[#BEC9BE]/60 rounded-md"
                          />
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#111E16] block">{item.name}</span>
                            <span className="text-xs text-[#6F7A70] block">
                              Size: <span className="font-semibold text-[#111E16]">{item.size}</span> | Color: <span className="font-semibold text-[#111E16]">{item.color}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-semibold text-[#111E16] whitespace-nowrap">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-[#111E16]">
                          {item.quantity}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-[#00522E] whitespace-nowrap">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-[#F6F6F6]/50 border-t border-[#BEC9BE] p-6 flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="text-xs text-[#6F7A70] space-y-1 max-w-sm">
                  <p className="font-semibold text-[#111E16]">Refund / Cancellation Policy</p>
                  <p>
                    Paid orders can be fully refunded prior to carrier dispatch. Deliveries in transit are eligible for return shipping labels upon arrival. Custom blazers may carry alterations restocking deductions.
                  </p>
                </div>

                <div className="w-full md:w-64 space-y-2.5 text-xs text-[#6F7A70] font-semibold">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-[#111E16]">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>GST (18.0%)</span>
                    <span className="font-mono text-[#111E16]">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping Fee</span>
                    <span className="font-mono text-[#111E16]">
                      {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                    </span>
                  </div>
                  <hr className="border-[#BEC9BE]/60" />
                  <div className="flex items-center justify-between text-sm font-bold text-[#111E16]">
                    <span>Grand Total</span>
                    <span className="font-mono text-[#00522E]">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#BEC9BE] rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#BEC9BE]/60 pb-3">
                <span className="p-1.5 bg-[#401900]/10 text-[#401900] rounded-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </span>
                <h3 className="font-bold text-[#111E16] text-sm sm:text-base">Payment Details</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-[#6F7A70]">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[#BEC9BE] block">Method</span>
                  <span className="text-[#111E16] block">{order.paymentDetails.method || 'Not Specified'}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[#BEC9BE] block">Transaction ID</span>
                  <span className="text-[#111E16] font-mono block">{order.paymentDetails.transactionId || 'None'}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-[#BEC9BE] block">Payment Captured On</span>
                  <span className="text-[#111E16] block">{order.paymentDetails.date || 'Pending Processing'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#BEC9BE] rounded-xl p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-[#111E16] text-sm sm:text-base border-b border-[#BEC9BE]/60 pb-3">Notes & Comments</h4>

              <form onSubmit={handleAddNoteSubmit} className="space-y-3">
                <textarea
                  placeholder="Type administrative logs or instructions to courier staff..."
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full bg-[#E8F8E9]/30 text-sm text-[#111E16] border border-[#BEC9BE] rounded-lg p-3 focus:outline-none focus:border-[#00522E] focus:bg-[#E8F8E9]/10"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs"
                  >
                    Post Note
                  </button>
                </div>
              </form>

              <div className="space-y-3 pt-2">
                {order.notes.length === 0 ? (
                  <p className="text-xs text-[#6F7A70] italic">No internal logs or customer instructions documented.</p>
                ) : (
                  order.notes.slice().reverse().map((note) => (
                    <div key={note.id} className="bg-[#F6F6F6] rounded-xl p-4 space-y-2 border border-[#BEC9BE]/30 text-left">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#111E16]">{note.author}</span>
                        <span className="text-[#6F7A70]">{note.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#3C4A3F] leading-relaxed font-medium">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
              <h4 className="font-bold text-[#111E16] text-xs uppercase tracking-wider block">Set Processing Status</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#6F7A70] block">Order Dispatch Status</label>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                    className="w-full bg-[#E8F8E9]/60 hover:bg-[#E8F8E9] border border-[#BEC9BE] text-xs font-bold text-[#00522E] rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-[#00522E] transition-all"
                  >
                    <option value="Pending">PENDING</option>
                    <option value="Processing">PROCESSING</option>
                    <option value="Dispatched">DISPATCHED</option>
                    <option value="Shipped">SHIPPED</option>
                    <option value="Out For Delivery">OUT FOR DELIVERY</option>
                    <option value="Delivered">DELIVERED</option>
                    <option value="Cancelled">CANCELLED</option>
                    <option value="Refunded">REFUNDED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#6F7A70] block">Payment Gateway Status</label>
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => updatePaymentStatus(order.id, e.target.value as any)}
                    className="w-full bg-white border border-[#BEC9BE] text-xs font-bold text-[#111E16] rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-[#00522E] transition-all"
                  >
                    <option value="Pending">PENDING</option>
                    <option value="Paid">PAID</option>
                    <option value="Refunded">REFUNDED</option>
                    <option value="Failed">FAILED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#6F7A70] block">Logistic Shipment Status</label>
                  <select
                    value={order.deliveryStatus}
                    onChange={(e) => updateDeliveryStatus(order.id, e.target.value as any)}
                    className="w-full bg-white border border-[#BEC9BE] text-xs font-bold text-[#111E16] rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:border-[#00522E] transition-all"
                  >
                    <option value="Pending">PENDING</option>
                    <option value="In Transit">IN TRANSIT</option>
                    <option value="Delivered">DELIVERED</option>
                    <option value="Cancelled">CANCELLED</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#BEC9BE]/60 pb-3">
                <h4 className="font-bold text-[#111E16] text-sm">Customer Profile</h4>
                <Link to="/dashboard/users" className="text-xs text-[#00522E] font-bold hover:underline">View CRM</Link>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-[#00522E] bg-[#E8F8E9] border border-[#BEC9BE]/60">
                  {order.customerName.charAt(0)}
                </span>
                <div className="text-xs">
                  <span className="font-bold text-[#111E16] block">{order.customerName}</span>
                  <span className="text-[#6F7A70] block">{order.customerEmail}</span>
                  <span className="text-[#6F7A70] block">{order.customerPhone}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#BEC9BE]/60 pb-3">
                <h4 className="font-bold text-[#111E16] text-sm">Address Details</h4>
                <button
                  onClick={() => setIsEditAddressOpen(true)}
                  className="text-xs text-[#00522E] font-bold hover:underline cursor-pointer"
                >
                  Edit Shipping
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] uppercase font-bold text-[#6F7A70] tracking-wider block">Shipping Address</span>
                  <p className="font-bold text-[#111E16]">{order.shippingAddress.name}</p>
                  <p className="text-[#6F7A70]">{order.shippingAddress.street}</p>
                  <p className="text-[#6F7A70]">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                  <p className="text-[#6F7A70]">{order.shippingAddress.country}</p>
                  <p className="text-[#6F7A70]">Tel: {order.shippingAddress.phone}</p>
                </div>

                <hr className="border-[#BEC9BE]/40" />

                <div className="space-y-1 text-left">
                  <span className="text-[10px] uppercase font-bold text-[#6F7A70] tracking-wider block">Billing Address</span>
                  <p className="font-bold text-[#111E16]">{order.billingAddress.name}</p>
                  <p className="text-[#6F7A70]">{order.billingAddress.street}</p>
                  <p className="text-[#6F7A70]">
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zip}
                  </p>
                  <p className="text-[#6F7A70]">{order.billingAddress.country}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
              <h4 className="font-bold text-[#111E16] text-sm border-b border-[#BEC9BE]/60 pb-3">Delivery Timeline</h4>
              <div className="relative border-l border-[#BEC9BE] ml-3.5 pl-6 space-y-6 text-left py-2 text-xs">
                {order.timeline.map((event) => {
                  let bulletBg = '';
                  let bulletBorder = '';
                  if (event.status === 'completed') {
                    bulletBg = 'bg-[#00522E]';
                    bulletBorder = 'border-[#E8F8E9]';
                  } else if (event.status === 'current') {
                    bulletBg = 'bg-[#F8B057]';
                    bulletBorder = 'border-amber-100';
                  } else {
                    bulletBg = 'bg-gray-300';
                    bulletBorder = 'border-gray-100';
                  }

                  return (
                    <div key={event.id} className="relative space-y-1">
                      <span className={`absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full border-4 ${bulletBg} ${bulletBorder} flex items-center justify-center`}></span>

                      <div>
                        <span className={`font-bold block ${
                          event.status === 'completed' ? 'text-[#00522E]' : event.status === 'current' ? 'text-amber-800' : 'text-[#6F7A70]'
                        }`}>{event.title}</span>
                        {event.timestamp && <span className="text-[10px] text-[#6F7A70] block">{event.timestamp}</span>}
                      </div>
                      <p className="text-[#6F7A70] leading-relaxed">{event.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-[#BEC9BE] rounded-xl p-5 shadow-xs space-y-4">
              <h4 className="font-bold text-[#111E16] text-sm border-b border-[#BEC9BE]/60 pb-3">Activity Logs</h4>
              <div className="space-y-3 text-left">
                {order.activityLogs.map((log) => (
                  <div key={log.id} className="text-xs space-y-0.5">
                    <div className="flex items-center justify-between font-bold text-[#111E16]">
                      <span>{log.action}</span>
                      <span className="text-[10px] font-normal text-[#6F7A70] font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6F7A70] block">By {log.user} • {new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl w-full max-w-sm p-6 shadow-xl animate-scale-up text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-[#BA1A1A] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#111E16]">Cancel Order #{order.id}?</h3>
              <p className="text-xs text-[#6F7A70]">
                Are you sure you want to cancel this order? It will mark the status as cancelled and generate logs.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsCancelConfirmOpen(false)}
                className="px-4 py-2 border border-[#BEC9BE] hover:bg-[#F6F6F6] text-[#111E16] text-xs font-bold rounded-lg cursor-pointer"
              >
                No, Keep Order
              </button>
              <button
                onClick={handleCancelOrderAction}
                className="px-4 py-2 bg-[#BA1A1A] hover:bg-[#930006] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {isRefundConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-xl w-full max-w-sm p-6 shadow-xl animate-scale-up text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-800 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#111E16]">Confirm Return Refund?</h3>
              <p className="text-xs text-[#6F7A70]">
                A refund of <span className="font-bold text-[#111E16] font-mono">{formatCurrency(grandTotal)}</span> will be reversed back to the customer's billing channel.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsRefundConfirmOpen(false)}
                className="px-4 py-2 border border-[#BEC9BE] hover:bg-[#F6F6F6] text-[#111E16] text-xs font-bold rounded-lg cursor-pointer"
              >
                No, Exit
              </button>
              <button
                onClick={handleRefundOrderAction}
                className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
              >
                Refund Order
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditAddressOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
          <div className="bg-white border border-[#BEC9BE] rounded-2xl w-full max-w-md shadow-xl animate-scale-up overflow-hidden text-left">
            <div className="bg-[#E8F8E9] px-6 py-4 border-b border-[#BEC9BE] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#00522E]">Edit Shipping Destination</h3>
              <button
                onClick={() => setIsEditAddressOpen(false)}
                className="text-[#6F7A70] hover:text-[#00522E] p-1 rounded-full hover:bg-white/60 transition-all cursor-pointer"
              >
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditAddressSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111E16] block">Recipient Full Name *</label>
                <input
                  type="text"
                  required
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  className="w-full bg-[#E8F8E9]/40 text-sm text-[#111E16] border border-[#BEC9BE] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#00522E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111E16] block">Street Address *</label>
                <input
                  type="text"
                  required
                  value={shippingStreet}
                  onChange={(e) => setShippingStreet(e.target.value)}
                  className="w-full bg-[#E8F8E9]/40 text-sm text-[#111E16] border border-[#BEC9BE] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#00522E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111E16] block">City *</label>
                  <input
                     type="text"
                     required
                     value={shippingCity}
                     onChange={(e) => setShippingCity(e.target.value)}
                     className="w-full bg-[#E8F8E9]/40 text-sm text-[#111E16] border border-[#BEC9BE] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#00522E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111E16] block">State / Region</label>
                  <input
                    type="text"
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="w-full bg-[#E8F8E9]/40 text-sm text-[#111E16] border border-[#BEC9BE] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#00522E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111E16] block">Postal Zip Code *</label>
                  <input
                    type="text"
                    required
                    value={shippingZip}
                    onChange={(e) => setShippingZip(e.target.value)}
                    className="w-full bg-[#E8F8E9]/40 text-sm text-[#111E16] border border-[#BEC9BE] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#00522E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111E16] block">Country *</label>
                  <input
                    type="text"
                    required
                    value={shippingCountry}
                    onChange={(e) => setShippingCountry(e.target.value)}
                    className="w-full bg-[#E8F8E9]/40 text-sm text-[#111E16] border border-[#BEC9BE] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#00522E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#111E16] block">Contact Telephone</label>
                <input
                  type="text"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  className="w-full bg-[#E8F8E9]/40 text-sm text-[#111E16] border border-[#BEC9BE] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#00522E]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#BEC9BE]/60 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditAddressOpen(false)}
                  className="px-4 py-2 border border-[#BEC9BE] hover:bg-[#F6F6F6] text-[#111E16] text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00522E] hover:bg-[#003B21] text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
