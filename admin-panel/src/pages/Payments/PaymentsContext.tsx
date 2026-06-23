import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSACTIONS, INVOICES, CREDIT_NOTES, NOTIFICATION_TEMPLATES, STATUS_NOTIFICATIONS, formatCurrency } from '../../data/mockDb';

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
  initiateRefund: (txnId: string, reason: string) => void;
  generateInvoice: (invoice: Omit<Invoice, 'number' | 'status' | 'date'>) => void;
  regenerateInvoice: (invoiceNumber: string) => void;
  emailInvoice: (invoiceNumber: string) => boolean;
  generateCreditNote: (creditNote: Omit<CreditNote, 'number' | 'status' | 'date'>) => void;
  emailCreditNote: (noteNumber: string) => boolean;
  sendManualNotification: (notification: Omit<StatusNotification, 'id' | 'status' | 'date'>) => void;
  resendNotification: (notificationId: string) => void;
  updateTemplate: (id: string, subject?: string, body?: string) => void;
}

const PaymentsContext = createContext<PaymentsContextType | undefined>(undefined);

const initialTransactions: Transaction[] = TRANSACTIONS as Transaction[];
const initialInvoices: Invoice[] = INVOICES as Invoice[];
const initialCreditNotes: CreditNote[] = CREDIT_NOTES as CreditNote[];
const initialTemplates: NotificationTemplate[] = NOTIFICATION_TEMPLATES as NotificationTemplate[];
const initialNotifications: StatusNotification[] = STATUS_NOTIFICATIONS as StatusNotification[];

export const PaymentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fs_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('fs_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(() => {
    const saved = localStorage.getItem('fs_credit_notes');
    return saved ? JSON.parse(saved) : initialCreditNotes;
  });

  const [notifications, setNotifications] = useState<StatusNotification[]>(() => {
    const saved = localStorage.getItem('fs_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [templates, setTemplates] = useState<NotificationTemplate[]>(() => {
    const saved = localStorage.getItem('fs_templates');
    return saved ? JSON.parse(saved) : initialTemplates;
  });

  useEffect(() => {
    localStorage.setItem('fs_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fs_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('fs_credit_notes', JSON.stringify(creditNotes));
  }, [creditNotes]);

  useEffect(() => {
    localStorage.setItem('fs_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('fs_templates', JSON.stringify(templates));
  }, [templates]);

  const initiateRefund = (txnId: string, reason: string) => {
    setTransactions(prev => prev.map(txn => {
      if (txn.id === txnId) {
        return { ...txn, status: 'REFUNDED' };
      }
      return txn;
    }));

    const txn = transactions.find(t => t.id === txnId);
    if (txn) {
      const relatedInvoiceNum = `INV-2023-${txn.id.split('-')[1]}`;
      setInvoices(prev => prev.map(inv => {
        if (inv.number === relatedInvoiceNum) {
          return { ...inv, status: 'Unpaid' };
        }
        return inv;
      }));

      const newCN: CreditNote = {
        number: `CN-2023-${txn.id.split('-')[1]}`,
        relatedInvoice: relatedInvoiceNum,
        customerName: txn.customerName,
        refundAmount: txn.amount,
        reason: reason || 'Customer Request',
        status: 'Issued',
        date: new Date().toISOString().split('T')[0]
      };
      setCreditNotes(prev => [newCN, ...prev]);

      const newNotif: StatusNotification = {
        id: `notif-${Date.now()}`,
        type: 'Email',
        recipient: txn.customerEmail,
        title: `Refund Processed: Credit Note ${newCN.number}`,
        body: `Hi ${txn.customerName},\n\nA refund of ${formatCurrency(txn.amount)} has been initiated for transaction ${txnId}.\nReason: ${reason || 'Not specified'}.\n\nFashion Store Support`,
        status: 'Sent',
        date: new Date().toISOString(),
        event: 'Refund Processed'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const generateInvoice = (newInvData: Omit<Invoice, 'number' | 'status' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const serial = Math.floor(10000 + Math.random() * 90000);
    const newInvoice: Invoice = {
      ...newInvData,
      number: `INV-2023-IN${serial}`,
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
      number: `CN-2023-CR${serial}`,
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
      updateTemplate
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
