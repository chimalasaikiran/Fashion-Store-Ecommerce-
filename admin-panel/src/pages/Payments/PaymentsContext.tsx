import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { NOTIFICATION_TEMPLATES, STATUS_NOTIFICATIONS, formatCurrency } from '../../data/mockDb';

export interface Transaction {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  amount: number;
  tax: number;
  method: string;
  methodDetail: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  date: string;
  billingAddress: string;
  gateway: string;
  referenceId: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  number: string;
  orderRef: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  tax: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  date: string;
  items: InvoiceItem[];
}

export interface CreditNote {
  number: string;
  relatedInvoice: string;
  customerName: string;
  refundAmount: number;
  reason: string;
  status: 'Issued' | 'Draft';
  date: string;
}

export interface StatusNotification {
  id: string;
  type: 'Email' | 'SMS' | 'Push';
  recipient: string;
  title: string;
  body: string;
  status: 'Sent' | 'Failed' | 'Pending';
  date: string;
  event: string;
}

export interface NotificationTemplate {
  id: string;
  eventName: string;
  channel: 'Email' | 'SMS' | 'Push';
  subject?: string;
  body: string;
}

interface PaymentsContextType {
  transactions: Transaction[];
  invoices: Invoice[];
  creditNotes: CreditNote[];
  notifications: StatusNotification[];
  templates: NotificationTemplate[];
  initiateRefund: (txnId: string, reason: string) => Promise<void>;
  generateInvoice: (invoice: Omit<Invoice, 'number' | 'status' | 'date'>) => void;
  regenerateInvoice: (invoiceNumber: string) => void;
  emailInvoice: (invoiceNumber: string) => boolean;
  generateCreditNote: (creditNote: Omit<CreditNote, 'number' | 'status' | 'date'>) => void;
  emailCreditNote: (noteNumber: string) => boolean;
  sendManualNotification: (notification: Omit<StatusNotification, 'id' | 'status' | 'date'>) => void;
  resendNotification: (notificationId: string) => void;
  updateTemplate: (id: string, subject?: string, body?: string) => void;
  fetchTransactions: () => Promise<void>;
}

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com/api' : 'http://localhost:5000/api');
const WS_URL = import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com' : 'http://localhost:5000');

const initialTemplates: NotificationTemplate[] = NOTIFICATION_TEMPLATES as NotificationTemplate[];
const initialNotifications: StatusNotification[] = STATUS_NOTIFICATIONS as StatusNotification[];

export const PaymentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);

  const [notifications, setNotifications] = useState<StatusNotification[]>(() => {
    const saved = localStorage.getItem('fs_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [templates, setTemplates] = useState<NotificationTemplate[]>(() => {
    const saved = localStorage.getItem('fs_templates');
    return saved ? JSON.parse(saved) : initialTemplates;
  });

  useEffect(() => {
    localStorage.setItem('fs_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('fs_templates', JSON.stringify(templates));
  }, [templates]);

  const mapOrderToTransaction = (order: any): Transaction => {
    const amount = order.totalAmount || 0;
    const tax = Number((amount * 0.18).toFixed(2));
    
    let status: Transaction['status'] = 'PENDING';
    if (order.paymentStatus === 'Paid') status = 'SUCCESS';
    else if (order.paymentStatus === 'Failed') status = 'FAILED';
    else if (order.paymentStatus === 'Refunded') status = 'REFUNDED';

    let method = order.paymentMethod || 'Wallet';
    let methodDetail = 'Standard';
    
    const m = method.toLowerCase();
    if (m === 'wallet') {
      method = 'Wallet';
      methodDetail = 'Wallet Account';
    } else if (m === 'cash' || m === 'cod') {
      method = 'COD';
      methodDetail = 'Cash on Delivery';
    } else if (m === 'paypal') {
      method = 'PayPal';
      methodDetail = 'PayPal Account';
    } else if (m === 'applepay') {
      method = 'Apple Pay';
      methodDetail = 'Apple Pay Wallet';
    } else if (m === 'googlepay') {
      method = 'Google Pay';
      methodDetail = 'Google Pay Wallet';
    } else {
      method = 'Card';
      methodDetail = 'Visa ending in 4242';
    }

    const billingStr = order.billingAddress 
      ? `${order.billingAddress.name || order.customerName}, ${order.billingAddress.street}, ${order.billingAddress.city}, ${order.billingAddress.state || ''} ${order.billingAddress.zip}, ${order.billingAddress.country}`
      : (order.shippingAddress 
          ? `${order.shippingAddress.name || order.customerName}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zip}, ${order.shippingAddress.country}`
          : 'N/A');

    return {
      id: order.transactionId || `TXN-${order._id || order.id}`,
      orderId: order.orderId,
      customerName: order.customerName || (order.user && order.user.name) || 'Customer',
      customerEmail: order.customerEmail || (order.user && order.user.email) || `${(order.customerName || 'customer').toLowerCase().replace(/\s+/g, '')}@example.com`,
      amount,
      tax,
      method,
      methodDetail,
      status,
      date: order.createdAt || order.date || new Date().toISOString(),
      billingAddress: billingStr,
      gateway: method === 'Wallet' ? 'Wallet Gateway' : method === 'COD' ? 'Cash on Delivery' : 'Razorpay Gateway',
      referenceId: order.transactionId || `ref_${order._id || order.id}`
    };
  };

  const fetchTransactions = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/payments/admin`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  // Fetch transactions on mount if logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetchTransactions();
    }
  }, []);

  // Socket.io integration for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const socket = io(WS_URL);

    socket.on('connect', () => {
      console.log('Connected to payments socket server.');
    });

    socket.on('order_created', (newOrder: any) => {
      console.log('Payments Socket: New order created!', newOrder);
      const newTxn = mapOrderToTransaction(newOrder);
      setTransactions(prev => {
        if (prev.some(t => t.id === newTxn.id)) return prev;
        return [newTxn, ...prev];
      });
    });

    socket.on('order_updated', (updatedOrder: any) => {
      console.log('Payments Socket: Order updated!', updatedOrder);
      const updatedTxn = mapOrderToTransaction(updatedOrder);
      setTransactions(prev => prev.map(t => t.id === updatedTxn.id || t.orderId === updatedTxn.orderId ? updatedTxn : t));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Derive invoices and credit notes from transactions state
  useEffect(() => {
    // Invoices
    const derivedInvoices: Invoice[] = transactions.map(txn => {
      const invNumber = `INV-2026-${txn.id.replace('TR', '')}`;
      return {
        number: invNumber,
        orderRef: txn.orderId,
        customerName: txn.customerName,
        customerEmail: txn.customerEmail,
        amount: txn.amount,
        tax: txn.tax,
        status: txn.status === 'SUCCESS' ? 'Paid' as const : (txn.status === 'REFUNDED' ? 'Paid' as const : 'Unpaid' as const),
        date: new Date(txn.date).toISOString().split('T')[0],
        items: [
          {
            description: `Payment for Order ${txn.orderId}`,
            quantity: 1,
            price: Number((txn.amount - txn.tax).toFixed(2))
          }
        ]
      };
    });
    setInvoices(derivedInvoices);

    // Credit Notes
    const derivedCreditNotes: CreditNote[] = transactions
      .filter(txn => txn.status === 'REFUNDED')
      .map(txn => {
        const invNumber = `INV-2026-${txn.id.replace('TR', '')}`;
        return {
          number: `CN-2026-${txn.id.replace('TR', '')}`,
          relatedInvoice: invNumber,
          customerName: txn.customerName,
          refundAmount: txn.amount,
          reason: 'Refund Processed',
          status: 'Issued' as const,
          date: new Date(txn.date).toISOString().split('T')[0]
        };
      });
    setCreditNotes(derivedCreditNotes);
  }, [transactions]);

  const initiateRefund = async (txnId: string, reason: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/orders/admin/${txnId}/refund`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        // Update local state immediately
        setTransactions(prev => prev.map(txn => {
          if (txn.id === txnId) {
            return { ...txn, status: 'REFUNDED' };
          }
          return txn;
        }));

        // Log notification
        const txn = transactions.find(t => t.id === txnId);
        if (txn) {
          const newNotif: StatusNotification = {
            id: `notif-${Date.now()}`,
            type: 'Email',
            recipient: txn.customerEmail,
            title: `Refund Processed: Transaction ${txnId}`,
            body: `Hi ${txn.customerName},\n\nA refund of ${formatCurrency(txn.amount)} has been initiated for transaction ${txnId}.\nReason: ${reason || 'Not specified'}.\n\nFashion Store Support`,
            status: 'Sent',
            date: new Date().toISOString(),
            event: 'Refund Processed'
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      }
    } catch (err) {
      console.error('Error initiating refund on backend:', err);
    }
  };

  const generateInvoice = (newInvData: Omit<Invoice, 'number' | 'status' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const serial = Math.floor(10000 + Math.random() * 90000);
    const newInvoice: Invoice = {
      ...newInvData,
      number: `INV-2026-IN${serial}`,
      status: 'Unpaid',
      date: today
    };

    setInvoices(prev => [newInvoice, ...prev]);

    const newTxn: Transaction = {
      id: `TXN-IN${serial}`,
      orderId: newInvData.orderRef,
      customerName: newInvData.customerName,
      customerEmail: newInvData.customerEmail,
      amount: newInvData.amount,
      tax: newInvData.tax,
      method: 'Visa',
      methodDetail: 'Scheduled Payment',
      status: 'PENDING',
      date: new Date().toISOString(),
      billingAddress: 'Billing address on file',
      gateway: 'Razorpay Gateway',
      referenceId: `txn_auto_${serial}`
    };
    setTransactions(prev => [newTxn, ...prev]);
  };

  const regenerateInvoice = (invoiceNumber: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.number === invoiceNumber) {
        return {
          ...inv,
          date: new Date().toISOString().split('T')[0]
        };
      }
      return inv;
    }));
  };

  const emailInvoice = (invoiceNumber: string): boolean => {
    const inv = invoices.find(i => i.number === invoiceNumber);
    if (!inv) return false;

    const newNotif: StatusNotification = {
      id: `notif-${Date.now()}`,
      type: 'Email',
      recipient: inv.customerEmail,
      title: `Invoice ${invoiceNumber} Details`,
      body: `Hi ${inv.customerName},\n\nPlease review your invoice ${invoiceNumber} for Order ${inv.orderRef} total of ${formatCurrency(inv.amount)}.\n\nFashion Store Support`,
      status: 'Sent',
      date: new Date().toISOString(),
      event: 'Invoice Sent'
    };

    setNotifications(prev => [newNotif, ...prev]);
    return true;
  };

  const generateCreditNote = (newCNData: Omit<CreditNote, 'number' | 'status' | 'date'>) => {
    const serial = Math.floor(10000 + Math.random() * 90000);
    const newCN: CreditNote = {
      ...newCNData,
      number: `CN-2026-CR${serial}`,
      status: 'Issued',
      date: new Date().toISOString().split('T')[0]
    };

    setCreditNotes(prev => [newCN, ...prev]);

    const newNotif: StatusNotification = {
      id: `notif-${Date.now()}`,
      type: 'Email',
      recipient: 'customer@client-business.com',
      title: `Credit Note Issued: ${newCN.number}`,
      body: `A credit note of ${formatCurrency(newCN.refundAmount)} was generated for related invoice ${newCN.relatedInvoice}.\nReason: ${newCN.reason}.\n\nFashion Store Support`,
      status: 'Sent',
      date: new Date().toISOString(),
      event: 'Credit Note Dispatched'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const emailCreditNote = (noteNumber: string): boolean => {
    const note = creditNotes.find(c => c.number === noteNumber);
    if (!note) return false;

    const newNotif: StatusNotification = {
      id: `notif-${Date.now()}`,
      type: 'Email',
      recipient: 'customer@client-business.com',
      title: `Credit Note Issued: ${noteNumber}`,
      body: `Hi ${note.customerName},\n\nA credit note of ${formatCurrency(note.refundAmount)} has been issued for related invoice ${note.relatedInvoice}.\n\nFashion Store Support`,
      status: 'Sent',
      date: new Date().toISOString(),
      event: 'Credit Note Sent'
    };

    setNotifications(prev => [newNotif, ...prev]);
    return true;
  };

  const sendManualNotification = (newNotifData: Omit<StatusNotification, 'id' | 'status' | 'date'>) => {
    const newNotif: StatusNotification = {
      ...newNotifData,
      id: `notif-${Date.now()}`,
      status: 'Sent',
      date: new Date().toISOString()
    };

    setNotifications(prev => [newNotif, ...prev]);
  };

  const resendNotification = (notificationId: string) => {
    const notif = notifications.find(n => n.id === notificationId);
    if (!notif) return;

    const newNotif: StatusNotification = {
      ...notif,
      id: `notif-resend-${Date.now()}`,
      status: 'Sent',
      date: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const updateTemplate = (id: string, subject?: string, body?: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          ...(subject ? { subject } : {}),
          ...(body ? { body } : {})
        };
      }
      return t;
    }));
  };

  return (
    <PaymentsContext.Provider value={{
      transactions,
      invoices,
      creditNotes,
      notifications,
      templates,
      initiateRefund,
      generateInvoice,
      regenerateInvoice,
      emailInvoice,
      generateCreditNote,
      emailCreditNote,
      sendManualNotification,
      resendNotification,
      updateTemplate,
      fetchTransactions
    }}>
      {children}
    </PaymentsContext.Provider>
  );
};

export const usePayments = () => {
  const context = useContext(PaymentsContext);
  if (context === undefined) {
    throw new Error('usePayments must be used within a PaymentsProvider');
  }
  return context;
};
