import React, { createContext, useContext, useState, useEffect } from 'react';
import { ORDERS } from '../../data/mockDb';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface OrderActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
}

export interface OrderNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
  orderStatus: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';
  deliveryStatus: 'Pending' | 'In Transit' | 'Delivered' | 'Cancelled';
  createdDate: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentDetails: {
    method: string;
    transactionId: string;
    date: string;
  };
  timeline: TimelineEvent[];
  activityLogs: OrderActivity[];
  notes: OrderNote[];
}

interface OrdersContextType {
  orders: Order[];
  updateOrderStatus: (id: string, status: Order['orderStatus']) => void;
  updatePaymentStatus: (id: string, status: Order['paymentStatus']) => void;
  updateDeliveryStatus: (id: string, status: Order['deliveryStatus']) => void;
  cancelOrder: (id: string) => void;
  refundOrder: (id: string) => void;
  addOrderNote: (id: string, author: string, content: string) => void;
  updateOrderDetails: (id: string, updatedFields: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  bulkUpdateStatus: (ids: string[], status: Order['orderStatus']) => void;
  bulkDeleteOrders: (ids: string[]) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const initialOrders: Order[] = ORDERS as Order[];

export const OrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders_data');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  useEffect(() => {
    localStorage.setItem('orders_data', JSON.stringify(orders));
  }, [orders]);

  const updateOrderStatus = (id: string, orderStatus: Order['orderStatus']) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === id) {
          const updatedTimeline = ord.timeline.map(event => {
            if (event.title === 'Processing Order') {
              return {
                ...event,
                status: (orderStatus === 'Processing' ? 'current' : orderStatus === 'Delivered' ? 'completed' : 'upcoming') as 'completed' | 'current' | 'upcoming',
                timestamp: event.timestamp || (orderStatus === 'Processing' ? new Date().toLocaleString() : '')
              };
            }
            if (event.title === 'Shipped') {
              return {
                ...event,
                status: (orderStatus === 'Delivered' ? 'completed' : 'upcoming') as 'completed' | 'current' | 'upcoming',
                timestamp: event.timestamp || (orderStatus === 'Delivered' ? new Date().toLocaleString() : '')
              };
            }
            if (event.title === 'Delivered') {
              return {
                ...event,
                status: (orderStatus === 'Delivered' ? 'completed' : 'upcoming') as 'completed' | 'current' | 'upcoming',
                timestamp: event.timestamp || (orderStatus === 'Delivered' ? new Date().toLocaleString() : '')
              };
            }
            return event;
          });

          // Log action
          const newActivity: OrderActivity = {
            id: `act-${Date.now()}`,
            action: `Order Status changed to ${orderStatus}`,
            user: 'Admin',
            timestamp: new Date().toISOString()
          };

          return {
            ...ord,
            orderStatus,
            deliveryStatus: orderStatus === 'Delivered' ? 'Delivered' : orderStatus === 'Cancelled' ? 'Cancelled' : ord.deliveryStatus,
            timeline: updatedTimeline,
            activityLogs: [newActivity, ...ord.activityLogs]
          };
        }
        return ord;
      })
    );
  };

  const updatePaymentStatus = (id: string, paymentStatus: Order['paymentStatus']) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === id) {
          const newActivity: OrderActivity = {
            id: `act-${Date.now()}`,
            action: `Payment Status changed to ${paymentStatus}`,
            user: 'Admin',
            timestamp: new Date().toISOString()
          };

          const newTimeline = ord.timeline.map(event => {
            if (event.title === 'Payment Confirmed') {
              return {
                ...event,
                status: (paymentStatus === 'Paid' ? 'completed' : 'current') as 'completed' | 'current' | 'upcoming',
                timestamp: paymentStatus === 'Paid' ? new Date().toLocaleString() : ''
              };
            }
            return event;
          });

          return {
            ...ord,
            paymentStatus,
            timeline: newTimeline,
            paymentDetails: {
              ...ord.paymentDetails,
              transactionId: ord.paymentDetails.transactionId || (paymentStatus === 'Paid' ? `txn_${Date.now()}` : ''),
              date: ord.paymentDetails.date || (paymentStatus === 'Paid' ? new Date().toLocaleString() : '')
            },
            activityLogs: [newActivity, ...ord.activityLogs]
          };
        }
        return ord;
      })
    );
  };

  const updateDeliveryStatus = (id: string, deliveryStatus: Order['deliveryStatus']) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === id) {
          const newActivity: OrderActivity = {
            id: `act-${Date.now()}`,
            action: `Delivery Status changed to ${deliveryStatus}`,
            user: 'Admin',
            timestamp: new Date().toISOString()
          };

          const newTimeline = ord.timeline.map(event => {
            if (event.title === 'Shipped' && (deliveryStatus === 'In Transit' || deliveryStatus === 'Delivered')) {
              return { ...event, status: 'completed' as const, timestamp: event.timestamp || new Date().toLocaleString() };
            }
            if (event.title === 'Delivered' && deliveryStatus === 'Delivered') {
              return { ...event, status: 'completed' as const, timestamp: event.timestamp || new Date().toLocaleString() };
            }
            return event;
          });

          return {
            ...ord,
            deliveryStatus,
            orderStatus: deliveryStatus === 'Delivered' ? 'Delivered' : ord.orderStatus,
            timeline: newTimeline,
            activityLogs: [newActivity, ...ord.activityLogs]
          };
        }
        return ord;
      })
    );
  };

  const cancelOrder = (id: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === id) {
          const newActivity: OrderActivity = {
            id: `act-${Date.now()}`,
            action: 'Order Cancelled',
            user: 'Admin',
            timestamp: new Date().toISOString()
          };

          // Cancel the timeline
          const cancelledTimeline = ord.timeline.map(event => {
            if (event.status === 'current' || event.status === 'upcoming') {
              return { ...event, title: event.title + ' (Cancelled)', status: 'upcoming' as const };
            }
            return event;
          });

          return {
            ...ord,
            orderStatus: 'Cancelled' as const,
            deliveryStatus: 'Cancelled' as const,
            paymentStatus: ord.paymentStatus === 'Pending' ? ('Failed' as const) : ord.paymentStatus,
            timeline: cancelledTimeline,
            activityLogs: [newActivity, ...ord.activityLogs]
          };
        }
        return ord;
      })
    );
  };

  const refundOrder = (id: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === id) {
          const newActivity: OrderActivity = {
            id: `act-${Date.now()}`,
            action: 'Order Refunded',
            user: 'Admin',
            timestamp: new Date().toISOString()
          };

          return {
            ...ord,
            paymentStatus: 'Refunded' as const,
            orderStatus: 'Cancelled' as const,
            deliveryStatus: 'Cancelled' as const,
            activityLogs: [newActivity, ...ord.activityLogs]
          };
        }
        return ord;
      })
    );
  };

  const addOrderNote = (id: string, author: string, content: string) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === id) {
          const newNote: OrderNote = {
            id: `note-${Date.now()}`,
            author,
            content,
            timestamp: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric'
            }) + ', ' + new Date().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })
          };

          const newActivity: OrderActivity = {
            id: `act-${Date.now()}`,
            action: 'Added comment note to order',
            user: author,
            timestamp: new Date().toISOString()
          };

          return {
            ...ord,
            notes: [...ord.notes, newNote],
            activityLogs: [newActivity, ...ord.activityLogs]
          };
        }
        return ord;
      })
    );
  };

  const updateOrderDetails = (id: string, updatedFields: Partial<Order>) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === id) {
          const newActivity: OrderActivity = {
            id: `act-${Date.now()}`,
            action: 'Updated order shipping details',
            user: 'Admin',
            timestamp: new Date().toISOString()
          };
          return {
            ...ord,
            ...updatedFields,
            activityLogs: [newActivity, ...ord.activityLogs]
          };
        }
        return ord;
      })
    );
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(ord => ord.id !== id));
  };

  const bulkUpdateStatus = (ids: string[], status: Order['orderStatus']) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ids.includes(ord.id)) {
          const newActivity: OrderActivity = {
            id: `act-${Date.now()}`,
            action: `Bulk changed Order Status to ${status}`,
            user: 'Admin',
            timestamp: new Date().toISOString()
          };
          return {
            ...ord,
            orderStatus: status,
            deliveryStatus: status === 'Delivered' ? 'Delivered' : status === 'Cancelled' ? 'Cancelled' : ord.deliveryStatus,
            activityLogs: [newActivity, ...ord.activityLogs]
          };
        }
        return ord;
      })
    );
  };

  const bulkDeleteOrders = (ids: string[]) => {
    setOrders(prev => prev.filter(ord => !ids.includes(ord.id)));
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        updateOrderStatus,
        updatePaymentStatus,
        updateDeliveryStatus,
        cancelOrder,
        refundOrder,
        addOrderNote,
        updateOrderDetails,
        deleteOrder,
        bulkUpdateStatus,
        bulkDeleteOrders
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};
