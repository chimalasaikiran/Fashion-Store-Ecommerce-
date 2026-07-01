import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { AGENTS, TICKET_CATEGORIES } from '../../data/mockDb';

export interface TicketMessage {
  id: string;
  sender: 'Customer' | 'Agent' | 'System';
  senderName: string;
  text: string;
  timestamp: string;
  avatar?: string;
}

export interface TicketNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface TicketActivity {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
}

export interface TicketAttachment {
  name: string;
  size: string;
  type: string;
}

export interface Ticket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved' | 'Closed';
  assignedAgent: string;
  createdDate: string;
  updatedDate: string;
  slaDue: string;
  slaStatus: 'Breached' | 'Warning' | 'Within Limits' | 'Resolved';
  messages: TicketMessage[];
  notes: TicketNote[];
  timeline: TicketActivity[];
  attachments: TicketAttachment[];
  escalationReason?: string;
  escalatedTo?: string;
  resolutionNotes?: string;
  feedbackRating?: number;
  feedbackComment?: string;
  closedDate?: string;
}

interface TicketsContextType {
  tickets: Ticket[];
  agents: string[];
  categories: string[];
  addReply: (ticketId: string, text: string, sender?: 'Customer' | 'Agent') => Promise<void>;
  addNote: (ticketId: string, text: string) => Promise<void>;
  assignTicket: (ticketId: string, agent: string) => Promise<void>;
  updatePriority: (ticketId: string, priority: Ticket['priority']) => Promise<void>;
  updateStatus: (ticketId: string, status: Ticket['status']) => Promise<void>;
  escalateTicket: (ticketId: string, reason: string, escalateTo: string) => Promise<void>;
  closeTicket: (ticketId: string, resolutionNotes: string, feedbackRating?: number, feedbackComment?: string) => Promise<void>;
  reopenTicket: (ticketId: string) => Promise<void>;
  uploadAttachment: (ticketId: string, attachment: TicketAttachment) => void;
  fetchTickets: () => Promise<void>;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com/api' : 'http://localhost:5000/api');
const WS_URL = import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? 'https://fashion-store-backend-3931.onrender.com' : 'http://localhost:5000');

export const TicketsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const getHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const mapTicketData = (t: any): Ticket => {
    return {
      id: t.id || t._id,
      customerName: t.customerName || 'Customer',
      customerEmail: t.customerEmail || 'customer@example.com',
      subject: t.subject || 'No Subject',
      category: t.category || 'General',
      priority: t.priority || 'MEDIUM',
      status: t.status || 'Open',
      assignedAgent: t.assignedAgent || 'Unassigned',
      createdDate: t.createdDate || '',
      updatedDate: t.updatedDate || '',
      slaDue: t.slaDue || '',
      slaStatus: t.slaStatus || 'Within Limits',
      messages: Array.isArray(t.messages) ? t.messages : [],
      notes: Array.isArray(t.notes) ? t.notes : [],
      timeline: Array.isArray(t.timeline) ? t.timeline : [],
      attachments: Array.isArray(t.attachments) ? t.attachments : [],
      escalationReason: t.escalationReason,
      escalatedTo: t.escalatedTo,
      resolutionNotes: t.resolutionNotes,
      feedbackRating: t.feedbackRating,
      feedbackComment: t.feedbackComment,
      closedDate: t.closedDate
    };
  };

  const fetchTickets = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/tickets/admin`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets.map(mapTicketData));
      }
    } catch (err) {
      console.error('Error fetching tickets from backend:', err);
    }
  };

  // Fetch tickets on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      fetchTickets();
    }
  }, []);

  // WebSocket / Socket.io real-time listener
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const socket = io(WS_URL);

    socket.on('connect', () => {
      console.log('Connected to tickets socket server.');
    });

    socket.on('ticket_created', (newTicket: any) => {
      console.log('Tickets Socket: New ticket created!', newTicket);
      const mapped = mapTicketData(newTicket);
      setTickets(prev => {
        if (prev.some(t => t.id === mapped.id)) return prev;
        return [mapped, ...prev];
      });
    });

    socket.on('ticket_updated', (updatedTicket: any) => {
      console.log('Tickets Socket: Ticket updated!', updatedTicket);
      const mapped = mapTicketData(updatedTicket);
      setTickets(prev => prev.map(t => t.id === mapped.id ? mapped : t));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const addReply = async (ticketId: string, text: string) => {
    try {
      const res = await fetch(`${API_URL}/tickets/admin/${ticketId}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? mapTicketData(data.ticket) : t));
      }
    } catch (err) {
      console.error('Error adding reply:', err);
    }
  };

  const addNote = async (ticketId: string, text: string) => {
    try {
      const res = await fetch(`${API_URL}/tickets/admin/${ticketId}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? mapTicketData(data.ticket) : t));
      }
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const assignTicket = async (ticketId: string, agent: string) => {
    try {
      const res = await fetch(`${API_URL}/tickets/admin/${ticketId}/assign`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ agent })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? mapTicketData(data.ticket) : t));
      }
    } catch (err) {
      console.error('Error assigning agent:', err);
    }
  };

  const updatePriority = async (ticketId: string, priority: Ticket['priority']) => {
    try {
      const res = await fetch(`${API_URL}/tickets/admin/${ticketId}/priority`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ priority })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? mapTicketData(data.ticket) : t));
      }
    } catch (err) {
      console.error('Error updating priority:', err);
    }
  };

  const updateStatus = async (ticketId: string, status: Ticket['status']) => {
    try {
      const res = await fetch(`${API_URL}/tickets/admin/${ticketId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? mapTicketData(data.ticket) : t));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const escalateTicket = async (ticketId: string, reason: string, escalateTo: string) => {
    try {
      const res = await fetch(`${API_URL}/tickets/admin/${ticketId}/escalate`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ reason, escalateTo })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? mapTicketData(data.ticket) : t));
      }
    } catch (err) {
      console.error('Error escalating ticket:', err);
    }
  };

  const closeTicket = async (ticketId: string, resolutionNotes: string) => {
    try {
      const res = await fetch(`${API_URL}/tickets/admin/${ticketId}/close`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ resolutionNotes })
      });
      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? mapTicketData(data.ticket) : t));
      }
    } catch (err) {
      console.error('Error closing ticket:', err);
    }
  };

  const reopenTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`${API_URL}/tickets/admin/${ticketId}/reopen`, {
        method: 'PUT',
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? mapTicketData(data.ticket) : t));
      }
    } catch (err) {
      console.error('Error reopening ticket:', err);
    }
  };

  const uploadAttachment = (ticketId: string, attachment: TicketAttachment) => {
    // Session-only local attachments update
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            attachments: [...t.attachments, attachment]
          };
        }
        return t;
      })
    );
  };

  return (
    <TicketsContext.Provider
      value={{
        tickets,
        agents: AGENTS,
        categories: TICKET_CATEGORIES,
        addReply,
        addNote,
        assignTicket,
        updatePriority,
        updateStatus,
        escalateTicket,
        closeTicket,
        reopenTicket,
        uploadAttachment,
        fetchTickets
      }}
    >
      {children}
    </TicketsContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketsContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketsProvider');
  }
  return context;
};
