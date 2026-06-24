import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

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
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
  orderStatus: 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded' | 'Processing' | 'Dispatched' | 'Out For Delivery';
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
  loading: boolean;
  updateOrderStatus: (id: string, status: Order['orderStatus']) => Promise<void>;
  updatePaymentStatus: (id: string, status: Order['paymentStatus']) => Promise<void>;
  updateDeliveryStatus: (id: string, status: Order['deliveryStatus']) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  refundOrder: (id: string) => Promise<void>;
  addOrderNote: (id: string, author: string, content: string) => Promise<void>;
  updateOrderDetails: (id: string, updatedFields: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  bulkUpdateStatus: (ids: string[], status: Order['orderStatus']) => Promise<void>;
  bulkDeleteOrders: (ids: string[]) => Promise<void>;
  fetchOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com/api' : 'http://localhost:5000/api');
const WS_URL = import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com' : 'http://localhost:5000');

export const OrdersProvider: React.FC<{ children: React.ReactNode; isLoggedIn?: boolean }> = ({ children, isLoggedIn }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const mapOrderData = (ord: any): Order => {
    const customerName = ord.customerName || 'Customer';
    const customerEmail = ord.customerEmail || `${customerName.toLowerCase().replace(/\s+/g, '')}@example.com`;
    const customerPhone = ord.phone || ord.customerPhone || '';
    
    return {
      id: ord.id || ord._id,
      orderId: ord.orderId || '#FN000000',
      customerName,
      customerEmail,
      customerPhone,
      items: Array.isArray(ord.items) ? ord.items.map((item: any) => ({
        id: item.id || item._id,
        name: item.name || 'Product',
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        size: item.size || 'M',
        color: item.color || 'Standard',
        image: item.image || ''
      })) : [],
      totalAmount: Number(ord.totalAmount || 0),
      paymentStatus: ord.paymentStatus || 'Pending',
      orderStatus: ord.status || 'Pending',
      deliveryStatus: ord.deliveryStatus || 'Pending',
      createdDate: ord.date || (ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : new Date().toLocaleDateString()),
      shippingAddress: ord.shippingAddress || {
        name: customerName,
        street: '123 Apparel Blvd, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        zip: '94103',
        country: 'United States',
        phone: customerPhone
      },
      billingAddress: ord.billingAddress || {
        name: customerName,
        street: '123 Apparel Blvd, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        zip: '94103',
        country: 'United States',
        phone: customerPhone
      },
      paymentDetails: {
        method: ord.paymentMethod || 'Wallet',
        transactionId: ord.transactionId || '',
        date: ord.date || ''
      },
      timeline: Array.isArray(ord.timeline) ? ord.timeline : [],
      activityLogs: Array.isArray(ord.activityLogs) ? ord.activityLogs : [],
      notes: Array.isArray(ord.notes) ? ord.notes : []
    };
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/orders/admin`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        // Map backend document to frontend fields using unified helper
        const mappedOrders = data.orders.map(mapOrderData);
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error('Error fetching orders from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loggedIn = isLoggedIn || localStorage.getItem('isLoggedIn') === 'true';
    if (loggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn]);

  // Real-time updates via Socket.io
  useEffect(() => {
    const loggedIn = isLoggedIn || localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) return;

    const socket = io(WS_URL);

    socket.on('connect', () => {
      console.log('Connected to order socket server.');
    });

    socket.on('order_created', (newOrder: any) => {
      console.log('Socket: New order placed!', newOrder);
      const mapped = mapOrderData(newOrder);
      setOrders(prev => [mapped, ...prev]);
      
      // Play a subtle notification chime to wow the user
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-500.wav');
      audio.play().catch(() => {});
    });

    socket.on('order_updated', (updatedOrder: any) => {
      console.log('Socket: Order updated!', updatedOrder);
      const mapped = mapOrderData(updatedOrder);
      setOrders(prev => prev.map(o => o.id === mapped.id ? mapped : o));
    });

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn]);

  const updateOrderStatus = async (id: string, status: Order['orderStatus']) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders(); // Full reload to refresh timeline/activity logs
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const updatePaymentStatus = async (id: string, status: Order['paymentStatus']) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/${id}/payment`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ paymentStatus: status })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  const updateDeliveryStatus = async (id: string, status: Order['deliveryStatus']) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/${id}/delivery`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ deliveryStatus: status })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Error updating delivery status:', err);
    }
  };

  const cancelOrder = async (id: string) => {
    await updateOrderStatus(id, 'Cancelled');
  };

  const refundOrder = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/${id}/refund`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Error refunding order:', err);
    }
  };

  const addOrderNote = async (id: string, _author: string, content: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/${id}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Error adding order note:', err);
    }
  };

  const updateOrderDetails = async (id: string, updatedFields: Partial<Order>) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/${id}/details`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Error updating order details:', err);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.filter(o => o.id !== id));
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  const bulkUpdateStatus = async (ids: string[], status: Order['orderStatus']) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/bulk-status`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ids, status })
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrders();
      }
    } catch (err) {
      console.error('Error bulk updating order status:', err);
    }
  };

  const bulkDeleteOrders = async (ids: string[]) => {
    try {
      const res = await fetch(`${API_URL}/orders/admin/bulk-delete`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ids })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.filter(o => !ids.includes(o.id)));
      }
    } catch (err) {
      console.error('Error bulk deleting orders:', err);
    }
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        updateOrderStatus,
        updatePaymentStatus,
        updateDeliveryStatus,
        cancelOrder,
        refundOrder,
        addOrderNote,
        updateOrderDetails,
        deleteOrder,
        bulkUpdateStatus,
        bulkDeleteOrders,
        fetchOrders
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
