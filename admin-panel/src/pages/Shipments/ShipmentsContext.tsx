import React, { createContext, useContext, useState, useEffect } from 'react';
import { SHIPMENTS, RETURN_REQUESTS, REFUND_REQUESTS, REPLACEMENT_ORDERS } from '../../data/mockDb';

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

interface ShipmentsContextType {
  shipments: Shipment[];
  returnRequests: ReturnRequest[];
  refundRequests: RefundRequest[];
  replacementOrders: ReplacementOrder[];
  createShipment: (shipment: Omit<Shipment, 'id' | 'trackingNumber' | 'labelGenerated'>) => Shipment;
  updateShipmentStatus: (id: string, status: Shipment['status'], trackingNum?: string) => void;
  generateShippingLabel: (id: string) => void;
  deleteShipment: (id: string) => void;
  approveReturn: (id: string) => void;
  rejectReturn: (id: string) => void;
  scheduleReturnPickup: (id: string) => void;
  approveRefund: (id: string) => void;
  rejectRefund: (id: string) => void;
  processRefund: (id: string) => void;
  approveReplacement: (id: string) => void;
  rejectReplacement: (id: string) => void;
  createReplacementOrder: (id: string) => void;
  generateReplacementShipment: (id: string) => void;
}

const ShipmentsContext = createContext<ShipmentsContextType | undefined>(undefined);

const initialShipments: Shipment[] = SHIPMENTS as Shipment[];
const initialReturns: ReturnRequest[] = RETURN_REQUESTS as ReturnRequest[];
const initialRefunds: RefundRequest[] = REFUND_REQUESTS as RefundRequest[];
const initialReplacements: ReplacementOrder[] = REPLACEMENT_ORDERS as ReplacementOrder[];

export const ShipmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const saved = localStorage.getItem('shipments_data');
    return saved ? JSON.parse(saved) : initialShipments;
  });

  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>(() => {
    const saved = localStorage.getItem('returns_data');
    return saved ? JSON.parse(saved) : initialReturns;
  });

  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>(() => {
    const saved = localStorage.getItem('refunds_data');
    return saved ? JSON.parse(saved) : initialRefunds;
  });

  const [replacementOrders, setReplacementOrders] = useState<ReplacementOrder[]>(() => {
    const saved = localStorage.getItem('replacements_data');
    return saved ? JSON.parse(saved) : initialReplacements;
  });

  
  useEffect(() => {
    localStorage.setItem('shipments_data', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('returns_data', JSON.stringify(returnRequests));
  }, [returnRequests]);

  useEffect(() => {
    localStorage.setItem('refunds_data', JSON.stringify(refundRequests));
  }, [refundRequests]);

  useEffect(() => {
    localStorage.setItem('replacements_data', JSON.stringify(replacementOrders));
  }, [replacementOrders]);

  
  const createShipment = (shipment: Omit<Shipment, 'id' | 'trackingNumber' | 'labelGenerated'>) => {
    const newId = `SH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newShipment: Shipment = {
      ...shipment,
      id: newId,
      trackingNumber: '',
      labelGenerated: false
    };
    setShipments(prev => [newShipment, ...prev]);
    return newShipment;
  };

  const updateShipmentStatus = (id: string, status: Shipment['status'], trackingNum?: string) => {
    setShipments(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status,
          trackingNumber: trackingNum !== undefined ? trackingNum : s.trackingNumber
        };
      }
      return s;
    }));
  };

  const generateShippingLabel = (id: string) => {
    setShipments(prev => prev.map(s => {
      if (s.id === id) {
        const tracking = s.trackingNumber || `DLV-${Math.floor(100000 + Math.random() * 900000)}-IND`;
        return {
          ...s,
          labelGenerated: true,
          trackingNumber: tracking,
          status: s.status === 'Draft' ? 'Ready to Ship' : s.status
        };
      }
      return s;
    }));
  };

  const deleteShipment = (id: string) => {
    setShipments(prev => prev.filter(s => s.id !== id));
  };

  const approveReturn = (id: string) => {
    setReturnRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  };

  const rejectReturn = (id: string) => {
    setReturnRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };

  const scheduleReturnPickup = (id: string) => {
    setReturnRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Pickup Scheduled' } : r));
  };

  const approveRefund = (id: string) => {
    setRefundRequests(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'Pending',
          timeline: [...r.timeline, { title: 'Approved by Merchant', timestamp: new Date().toLocaleString() }]
        };
      }
      return r;
    }));
  };

  const rejectRefund = (id: string) => {
    setRefundRequests(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'Failed',
          timeline: [...r.timeline, { title: 'Refund Rejected', timestamp: new Date().toLocaleString() }]
        };
      }
      return r;
    }));
  };

  const processRefund = (id: string) => {
    setRefundRequests(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'Processed',
          timeline: [
            ...r.timeline,
            { title: 'Processed through Gateway', timestamp: new Date().toLocaleString() },
            { title: 'Gateway Cleared', timestamp: new Date().toLocaleString() }
          ]
        };
      }
      return r;
    }));
  };

  const approveReplacement = (id: string) => {
    setReplacementOrders(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  };

  const rejectReplacement = (id: string) => {
    setReplacementOrders(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  };

  const createReplacementOrder = (id: string) => {
    setReplacementOrders(prev => prev.map(r => {
      if (r.id === id) {
        
        return { ...r, status: 'Order Created' };
      }
      return r;
    }));
  };

  const generateReplacementShipment = (id: string) => {
    setReplacementOrders(prev => {
      return prev.map(r => {
        if (r.id === id) {
          const trackNum = `BD-${Math.floor(100000 + Math.random() * 900000)}-IND`;
          const orderId = r.originalOrderId + '-R';
          const newId = `SH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          const newOutbound: Shipment = {
            id: newId,
            orderId: orderId,
            customerName: r.customerName,
            customerEmail: r.customerEmail,
            shippingAddress: 'Customer Selected Return Pick-up Point Address',
            courier: 'Delhivery',
            shippingMethod: 'Air',
            packageSummary: `Replacement: ${r.replacementProduct}`,
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

          return { ...r, status: 'Shipped', trackingNumber: trackNum };
        }
        return r;
      });
    });
  };

  return (
    <ShipmentsContext.Provider value={{
      shipments,
      returnRequests,
      refundRequests,
      replacementOrders,
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
      generateReplacementShipment
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
