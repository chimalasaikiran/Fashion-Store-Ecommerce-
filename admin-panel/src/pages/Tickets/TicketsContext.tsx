import React, { createContext, useContext, useState, useEffect } from 'react';
import { TICKETS, AGENTS, TICKET_CATEGORIES } from '../../data/mockDb';

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
  addReply: (ticketId: string, text: string, sender: 'Customer' | 'Agent') => void;
  addNote: (ticketId: string, text: string) => void;
  assignTicket: (ticketId: string, agent: string) => void;
  updatePriority: (ticketId: string, priority: Ticket['priority']) => void;
  updateStatus: (ticketId: string, status: Ticket['status']) => void;
  escalateTicket: (ticketId: string, reason: string, escalateTo: string) => void;
  closeTicket: (ticketId: string, resolutionNotes: string, feedbackRating?: number, feedbackComment?: string) => void;
  reopenTicket: (ticketId: string) => void;
  uploadAttachment: (ticketId: string, attachment: TicketAttachment) => void;
}

const TicketsContext = createContext<TicketsContextType | undefined>(undefined);

const initialTickets: Ticket[] = TICKETS as Ticket[];

export const TicketsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('tickets_data');
    return saved ? JSON.parse(saved) : initialTickets;
  });

  useEffect(() => {
    localStorage.setItem('tickets_data', JSON.stringify(tickets));
  }, [tickets]);

  const addReply = (ticketId: string, text: string, sender: 'Customer' | 'Agent') => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const timestamp = new Date().toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          const newMsg: TicketMessage = {
            id: `msg-${Date.now()}`,
            sender,
            senderName: sender === 'Agent' ? 'Agent (You)' : t.customerName,
            text,
            timestamp,
            avatar: sender === 'Customer' ? t.customerName.split(' ').map(n => n[0]).join('') : undefined
          };
          
          const updatedTimeline: TicketActivity = {
            id: `act-${Date.now()}`,
            action: sender === 'Agent' ? 'Replied by Agent' : 'Replied by Customer',
            actor: sender === 'Agent' ? 'Agent' : t.customerName,
            timestamp
          };

          return {
            ...t,
            messages: [...t.messages, newMsg],
            timeline: [...t.timeline, updatedTimeline],
            updatedDate: timestamp
          };
        }
        return t;
      })
    );
  };

  const addNote = (ticketId: string, text: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const timestamp = new Date().toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          const newNote: TicketNote = {
            id: `note-${Date.now()}`,
            author: 'Agent (You)',
            text,
            timestamp
          };

          const updatedTimeline: TicketActivity = {
            id: `act-${Date.now()}`,
            action: 'Internal Note Added',
            actor: 'Agent',
            timestamp
          };

          return {
            ...t,
            notes: [...t.notes, newNote],
            timeline: [...t.timeline, updatedTimeline],
            updatedDate: timestamp
          };
        }
        return t;
      })
    );
  };

  const assignTicket = (ticketId: string, agent: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const timestamp = new Date().toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          
          const updatedTimeline: TicketActivity = {
            id: `act-${Date.now()}`,
            action: `Ticket Assigned to ${agent}`,
            actor: 'Agent',
            timestamp
          };

          return {
            ...t,
            assignedAgent: agent,
            timeline: [...t.timeline, updatedTimeline],
            updatedDate: timestamp
          };
        }
        return t;
      })
    );
  };

  const updatePriority = (ticketId: string, priority: Ticket['priority']) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const timestamp = new Date().toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          
          const updatedTimeline: TicketActivity = {
            id: `act-${Date.now()}`,
            action: `Priority updated to ${priority}`,
            actor: 'Agent',
            timestamp
          };

          return {
            ...t,
            priority,
            timeline: [...t.timeline, updatedTimeline],
            updatedDate: timestamp
          };
        }
        return t;
      })
    );
  };

  const updateStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const timestamp = new Date().toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          
          const updatedTimeline: TicketActivity = {
            id: `act-${Date.now()}`,
            action: `Status changed to ${status}`,
            actor: 'Agent',
            timestamp
          };

          // Auto-adjust SLA Status if status becomes Resolved or Closed
          let slaVal = t.slaStatus;
          if (status === 'Resolved' || status === 'Closed') {
            slaVal = 'Resolved';
          }

          return {
            ...t,
            status,
            slaStatus: slaVal,
            timeline: [...t.timeline, updatedTimeline],
            updatedDate: timestamp
          };
        }
        return t;
      })
    );
  };

  const escalateTicket = (ticketId: string, reason: string, escalateTo: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const timestamp = new Date().toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          
          const updatedTimeline: TicketActivity = {
            id: `act-${Date.now()}`,
            action: `Ticket escalated to ${escalateTo}`,
            actor: 'Agent',
            timestamp
          };

          const sysMessage: TicketMessage = {
            id: `msg-sys-${Date.now()}`,
            sender: 'System',
            senderName: 'Escalation Engine',
            text: `Ticket priority escalated to CRITICAL and routed to ${escalateTo}. Reason: ${reason}`,
            timestamp
          };

          return {
            ...t,
            status: 'Escalated',
            priority: 'CRITICAL',
            slaStatus: 'Breached', // Escalation is usually triggered on breaching or immediate threat
            escalationReason: reason,
            escalatedTo: escalateTo,
            messages: [...t.messages, sysMessage],
            timeline: [...t.timeline, updatedTimeline],
            updatedDate: timestamp
          };
        }
        return t;
      })
    );
  };

  const closeTicket = (ticketId: string, resolutionNotes: string, feedbackRating?: number, feedbackComment?: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const timestamp = new Date().toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          
          const updatedTimeline: TicketActivity = {
            id: `act-${Date.now()}`,
            action: `Ticket closed`,
            actor: 'Agent',
            timestamp
          };

          const sysMessage: TicketMessage = {
            id: `msg-sys-${Date.now()}`,
            sender: 'System',
            senderName: 'Closure Engine',
            text: `Ticket resolved and officially CLOSED. Resolution details: ${resolutionNotes}`,
            timestamp
          };

          return {
            ...t,
            status: 'Closed',
            slaStatus: 'Resolved',
            resolutionNotes,
            feedbackRating,
            feedbackComment,
            closedDate: timestamp,
            messages: [...t.messages, sysMessage],
            timeline: [...t.timeline, updatedTimeline],
            updatedDate: timestamp
          };
        }
        return t;
      })
    );
  };

  const reopenTicket = (ticketId: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const timestamp = new Date().toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          
          const updatedTimeline: TicketActivity = {
            id: `act-${Date.now()}`,
            action: 'Ticket Re-opened',
            actor: 'Agent',
            timestamp
          };

          const sysMessage: TicketMessage = {
            id: `msg-sys-${Date.now()}`,
            sender: 'System',
            senderName: 'Workflow Engine',
            text: 'Closed ticket has been re-opened by operator. Restoring active SLA queue monitoring.',
            timestamp
          };

          return {
            ...t,
            status: 'Open',
            slaStatus: 'Within Limits',
            resolutionNotes: undefined,
            feedbackRating: undefined,
            feedbackComment: undefined,
            closedDate: undefined,
            messages: [...t.messages, sysMessage],
            timeline: [...t.timeline, updatedTimeline],
            updatedDate: timestamp
          };
        }
        return t;
      })
    );
  };

  const uploadAttachment = (ticketId: string, attachment: TicketAttachment) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const timestamp = new Date().toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          
          const updatedTimeline: TicketActivity = {
            id: `act-${Date.now()}`,
            action: `File uploaded: ${attachment.name}`,
            actor: 'Agent',
            timestamp
          };

          return {
            ...t,
            attachments: [...t.attachments, attachment],
            timeline: [...t.timeline, updatedTimeline],
            updatedDate: timestamp
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
        uploadAttachment
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
