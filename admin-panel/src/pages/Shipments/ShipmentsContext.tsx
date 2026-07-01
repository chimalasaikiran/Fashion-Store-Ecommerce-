import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SHIPMENTS, RETURN_REQUESTS, REFUND_REQUESTS, REPLACEMENT_ORDERS, CANCELLATION_REQUESTS } from '../../data/mockDb';

export interface Shipment {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  courier: string;
  shippingMethod: 'Air' | 'Sea' | 'Land';
  packageSummary: string;
  shippingCost: number;
  trackingNumber: string;
  labelGenerated: boolean;
  status: 'Draft' | 'Ready to Ship' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Delayed';
  dispatchDate: string;
  estDeliveryDate: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  productName: string;
  productPrice: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Pickup Scheduled';
  requestDate: string;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  reason: string;
  status: 'Pending' | 'Processed' | 'Failed';
  requestDate: string;
  transactionId: string;
  timeline: { title: string; timestamp: string }[];
}

export interface ReplacementOrder {
  id: string;
  originalOrderId: string;
  customerName: string;
  customerEmail: string;
  originalProduct: string;
  replacementProduct: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Order Created' | 'Shipped';
  requestDate: string;
  trackingNumber: string;
}

export interface CancellationRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  action: 'Refund' | 'Replacement';
  requestDate: string;
  comments?: string;
}

interface ShipmentsContextType {
  shipments: Shipment[];
  returnRequests: ReturnRequest[];
  refundRequests: RefundRequest[];
  replacementOrders: ReplacementOrder[];
  cancellationRequests: CancellationRequest[];
  createShipment: (shipment: Omit<Shipment, 'id' | 'trackingNumber' | 'labelGenerated'>) => Shipment;
  updateShipmentStatus: (id: string, status: Shipment['status'], trackingNum?: string) => void;
  generateShippingLabel: (id: string) => void;
  deleteShipment: (id: string) => void;
  approveReturn: (id: string) => void;
  rejectReturn: (id: string) => void;
  scheduleReturnPickup: (id: string) => void;
  approveRefund: (id: string) => Promise<void>;
  rejectRefund: (id: string) => Promise<void>;
  processRefund: (id: string) => Promise<void>;
  approveReplacement: (id: string) => void;
  rejectReplacement: (id: string) => void;
  createReplacementOrder: (id: string) => void;
  generateReplacementShipment: (id: string) => void;
  approveCancellation: (id: string) => Promise<void>;
  rejectCancellation: (id: string) => Promise<void>;
}

const ShipmentsContext = createContext<ShipmentsContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com/api' : 'http://localhost:5000/api');
const WS_URL = import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com' : 'http://localhost:5000');

const initialShipments: Shipment[] = SHIPMENTS as Shipment[];
const initialReturns: ReturnRequest[] = RETURN_REQUESTS as ReturnRequest[];
const initialReplacements: ReplacementOrder[] = REPLACEMENT_ORDERS as ReplacementOrder[];

export const ShipmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);

  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);

  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  
  const [replacementOrders, setReplacementOrders] = useState<ReplacementOrder[]>([]);

  const [cancellationRequests, setCancellationRequests] = useState<CancellationRequest[]>([]);

  const getHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchShipments = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/shipments`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setShipments(data.shipments);
      }
    } catch (err) {
      console.error('Error fetching shipments:', err);
    }
  };

  const fetchCancellations = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/orders/admin/cancellations`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setCancellationRequests(data.cancellations);
      }
    } catch (err) {
      console.error('Error fetching cancellations:', err);
    }
  };

  const fetchRefunds = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/orders/admin/refunds`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setRefundRequests(data.refunds);
      }
    } catch (err) {
      console.error('Error fetching refunds:', err);
    }
  };

  const fetchReturns = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/orders/admin/returns`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setReturnRequests(data.returnRequests);
      }
    } catch (err) {
      console.error('Error fetching returns:', err);
    }
  };

  const fetchReplacements = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/orders/admin/replacements`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setReplacementOrders(data.replacements);
      }
    } catch (err) {
      console.error('Error fetching replacements:', err);
    }
  };

  // Fetch cancellations, refunds, returns & replacements on login
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) {
      fetchCancellations();
      fetchRefunds();
      fetchReturns();
      fetchReplacements();
      fetchShipments();
    }
  }, []);

  // WebSockets for Real-Time updates
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) return;

    const socket = io(WS_URL);

    socket.on('shipment_created', (newShipment: any) => {
      setShipments(prev => {
        if (prev.some(s => s.id === newShipment.id)) return prev;
        return [newShipment, ...prev];
      });
    });

    socket.on('shipment_updated', (updatedShipment: any) => {
      setShipments(prev => prev.map(s => s.id === updatedShipment.id ? updatedShipment : s));
    });

    socket.on('shipment_deleted', (deleted: any) => {
      setShipments(prev => prev.filter(s => s.id !== deleted.id));
    });

    socket.on('cancellation_created', (newCancellation: any) => {
      setCancellationRequests(prev => {
        if (prev.some(c => c.id === newCancellation.id)) return prev;
        return [newCancellation, ...prev];
      });
    });

    socket.on('cancellation_updated', (updatedCancellation: any) => {
      setCancellationRequests(prev => prev.map(c => c.id === updatedCancellation.id ? updatedCancellation : c));
    });

    socket.on('refund_created', (newRefund: any) => {
      setRefundRequests(prev => {
        if (prev.some(r => r.id === newRefund.id)) return prev;
        return [newRefund, ...prev];
      });
    });

    socket.on('refund_updated', (updatedRefund: any) => {
      setRefundRequests(prev => prev.map(r => r.id === updatedRefund.id ? updatedRefund : r));
    });

    socket.on('return_created', (newReturn: any) => {
      setReturnRequests(prev => {
        if (prev.some(r => r.id === newReturn.id)) return prev;
        return [newReturn, ...prev];
      });
    });

    socket.on('return_updated', (updatedReturn: any) => {
      setReturnRequests(prev => prev.map(r => r.id === updatedReturn.id ? updatedReturn : r));
    });

    socket.on('replacement_created', (newReplacement: any) => {
      setReplacementOrders(prev => {
        if (prev.some(r => r.id === newReplacement.id)) return prev;
        return [newReplacement, ...prev];
      });
    });

    socket.on('replacement_updated', (updatedReplacement: any) => {
      setReplacementOrders(prev => prev.map(r => r.id === updatedReplacement.id ? updatedReplacement : r));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createShipment = async (shipment: Omit<Shipment, 'id' | 'trackingNumber' | 'labelGenerated'>) => {
    try {
      const res = await fetch(`${API_URL}/shipments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(shipment)
      });
      const data = await res.json();
      if (data.success) {
        return data.shipment;
      }
    } catch (err) {
      console.error('Error creating shipment:', err);
    }
  };

  const updateShipmentStatus = async (id: string, status: Shipment['status'], trackingNum?: string) => {
    try {
      await fetch(`${API_URL}/shipments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, trackingNumber: trackingNum })
      });
    } catch (err) {
      console.error('Error updating shipment status:', err);
    }
  };

  const generateShippingLabel = async (id: string) => {
    try {
      await fetch(`${API_URL}/shipments/${id}/label`, {
        method: 'PUT',
        headers: getHeaders()
      });
    } catch (err) {
      console.error('Error generating shipping label:', err);
    }
  };

  const deleteShipment = async (id: string) => {
    try {
      await fetch(`${API_URL}/shipments/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (err) {
      console.error('Error deleting shipment:', err);
    }
  };

  const approveReturn = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/returns/${id}/approve`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setReturnRequests(prev => prev.map(r => r.id === id ? data.returnRequest : r));
      }
    } catch (err) {
      console.error('Error approving return:', err);
    }
  };

  const rejectReturn = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/returns/${id}/reject`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setReturnRequests(prev => prev.map(r => r.id === id ? data.returnRequest : r));
      }
    } catch (err) {
      console.error('Error rejecting return:', err);
    }
  };

  const scheduleReturnPickup = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/returns/${id}/pickup`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setReturnRequests(prev => prev.map(r => r.id === id ? data.returnRequest : r));
      }
    } catch (err) {
      console.error('Error scheduling return pickup:', err);
    }
  };

  const approveCancellation = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/cancellations/${id}/approve`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setCancellationRequests(prev => prev.map(c => c.id === id ? data.cancellation : c));
        await fetchRefunds();
      }
    } catch (err) {
      console.error('Error approving cancellation:', err);
    }
  };

  const rejectCancellation = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/cancellations/${id}/reject`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setCancellationRequests(prev => prev.map(c => c.id === id ? data.cancellation : c));
      }
    } catch (err) {
      console.error('Error rejecting cancellation:', err);
    }
  };

  const approveRefund = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/refunds/${id}/approve`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setRefundRequests(prev => prev.map(r => r.id === id ? data.refund : r));
      }
    } catch (err) {
      console.error('Error approving refund:', err);
    }
  };

  const rejectRefund = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/refunds/${id}/reject`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setRefundRequests(prev => prev.map(r => r.id === id ? data.refund : r));
      }
    } catch (err) {
      console.error('Error rejecting refund:', err);
    }
  };

  const processRefund = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/refunds/${id}/process`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setRefundRequests(prev => prev.map(r => r.id === id ? data.refund : r));
      }
    } catch (err) {
      console.error('Error processing refund:', err);
    }
  };

  const approveReplacement = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/replacements/${id}/approve`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setReplacementOrders(prev => prev.map(r => r.id === id ? data.replacement : r));
      }
    } catch (err) {
      console.error('Error approving replacement:', err);
    }
  };

  const rejectReplacement = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/replacements/${id}/reject`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setReplacementOrders(prev => prev.map(r => r.id === id ? data.replacement : r));
      }
    } catch (err) {
      console.error('Error rejecting replacement:', err);
    }
  };

  const createReplacementOrder = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/replacements/${id}/create-order`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setReplacementOrders(prev => prev.map(r => r.id === id ? data.replacement : r));
      }
    } catch (err) {
      console.error('Error creating replacement order:', err);
    }
  };

  const generateReplacementShipment = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/replacements/${id}/ship`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setReplacementOrders(prev => {
          const updatedRep = data.replacement;
          const trackNum = updatedRep.trackingNumber;
          const orderId = updatedRep.originalOrderId + '-R';
          const newId = `SH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          const newOutbound: Shipment = {
            id: newId,
            orderId: orderId,
            customerName: updatedRep.customerName,
            customerEmail: updatedRep.customerEmail,
            shippingAddress: 'Customer Selected Return Pick-up Point Address',
            courier: 'Delhivery',
            shippingMethod: 'Air',
            packageSummary: `Replacement: ${updatedRep.replacementProduct}`,
            shippingCost: 0,
            trackingNumber: trackNum,
            labelGenerated: true,
            status: 'Ready to Ship',
            dispatchDate: new Date().toLocaleDateString(undefined, {month: 'short', day: '2-digit', year: 'numeric'}),
            estDeliveryDate: new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString(undefined, {month: 'short', day: '2-digit', year: 'numeric'})
          };

          setTimeout(() => {
            setShipments(curr => {
              if (curr.some(s => s.orderId === orderId)) return curr;
              return [newOutbound, ...curr];
            });
          }, 0);

          return prev.map(r => r.id === id ? updatedRep : r);
        });
      }
    } catch (err) {
      console.error('Error generating replacement shipment:', err);
    }
  };

  return (
    <ShipmentsContext.Provider value={{
      shipments,
      returnRequests,
      refundRequests,
      replacementOrders,
      cancellationRequests,
      createShipment,
      updateShipmentStatus,
      generateShippingLabel,
      deleteShipment,
      approveReturn,
      rejectReturn,
      scheduleReturnPickup,
      approveRefund,
      rejectRefund,
      processRefund,
      approveReplacement,
      rejectReplacement,
      createReplacementOrder,
      generateReplacementShipment,
      approveCancellation,
      rejectCancellation
    }}>
      {children}
    </ShipmentsContext.Provider>
  );
};


export const useShipments = () => {
  const context = useContext(ShipmentsContext);
  if (context === undefined) {
    throw new Error('useShipments must be used within a ShipmentsProvider');
  }
  return context;
};
