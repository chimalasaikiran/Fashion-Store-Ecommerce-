const SupportTicket = require("../models/SupportTicket");


const formatTicketDate = (date = new Date()) => {
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};


const generateTicketId = async () => {
  let isUnique = false;
  let ticketId = "";
  while (!isUnique) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    ticketId = `#TK${randomNum}`;
    const existingTicket = await SupportTicket.findOne({ ticketId });
    if (!existingTicket) {
      isUnique = true;
    }
  }
  return ticketId;
};






const createTicket = async (req, res) => {
  const { subject, category, priority, message } = req.body;

  try {
    if (!subject || !category || !message) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields" });
    }

    const ticketId = await generateTicketId();
    const now = new Date();
    const formattedNow = formatTicketDate(now);
    
    
    const slaDueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const formattedSlaDue = formatTicketDate(slaDueDate);

    const initialMessage = {
      id: `msg-${Date.now()}`,
      sender: "Customer",
      senderName: req.user.name || "Customer",
      text: message,
      timestamp: formattedNow,
      avatar: req.user.name ? req.user.name.split(" ").map(n => n[0]).join("") : "C"
    };

    const initialTimeline = {
      id: `act-${Date.now()}`,
      action: "Ticket Created",
      actor: req.user.name || "Customer",
      timestamp: formattedNow
    };

    const ticket = await SupportTicket.create({
      ticketId,
      user: req.user.id,
      customerName: req.user.name || "Customer",
      customerEmail: req.user.email || "customer@example.com",
      subject,
      category,
      priority: priority || "MEDIUM",
      status: "Open",
      assignedAgent: "Unassigned",
      createdDate: formattedNow,
      updatedDate: formattedNow,
      slaDue: formattedSlaDue,
      slaStatus: "Within Limits",
      messages: [initialMessage],
      notes: [],
      timeline: [initialTimeline],
      attachments: []
    });

    
    if (global.io) {
      global.io.emit("ticket_created", ticket);
    }

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    res.status(500).json({ success: false, message: "Server error while creating ticket" });
  }
};


const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Get My Tickets Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching tickets" });
  }
};






const addMessage = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text cannot be empty" });
    }

    
    let ticket = await SupportTicket.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { ticketId: id },
        { ticketId: `#${id}` }
      ].filter(Boolean)
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    
    if (req.user && ticket.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to access this ticket" });
    }

    const timestamp = formatTicketDate();
    const isAgent = !!req.admin;
    const senderName = isAgent ? (req.admin.name || "Agent (You)") : (req.user.name || ticket.customerName);
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: isAgent ? "Agent" : "Customer",
      senderName,
      text,
      timestamp,
      avatar: isAgent ? undefined : senderName.split(" ").map(n => n[0]).join("")
    };

    const newActivity = {
      id: `act-${Date.now()}`,
      action: isAgent ? "Replied by Agent" : "Replied by Customer",
      actor: senderName,
      timestamp
    };

    ticket.messages.push(newMessage);
    ticket.timeline.push(newActivity);
    ticket.updatedDate = timestamp;

    
    if (!isAgent && (ticket.status === "Closed" || ticket.status === "Resolved")) {
      ticket.status = "Open";
      ticket.slaStatus = "Within Limits";
      ticket.timeline.push({
        id: `act-reopen-${Date.now()}`,
        action: "Ticket Re-opened by Customer Reply",
        actor: senderName,
        timestamp
      });
    }

    await ticket.save();

    
    if (global.io) {
      global.io.emit("ticket_updated", ticket);
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Add Message Error:", error);
    res.status(500).json({ success: false, message: "Server error while adding message" });
  }
};






const adminGetAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Admin Get All Tickets Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching tickets" });
  }
};


const adminGetTicketById = async (req, res) => {
  const { id } = req.params;

  try {
    const ticket = await SupportTicket.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { ticketId: id },
        { ticketId: `#${id}` }
      ].filter(Boolean)
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Admin Get Ticket Details Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching ticket" });
  }
};


const adminAddNote = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const authorName = req.admin ? req.admin.name : "Agent";

  try {
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Note text cannot be empty" });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const timestamp = formatTicketDate();
    const newNote = {
      id: `note-${Date.now()}`,
      author: authorName,
      text: text.trim(),
      timestamp
    };

    const newActivity = {
      id: `act-${Date.now()}`,
      action: "Internal Note Added",
      actor: authorName,
      timestamp
    };

    ticket.notes.push(newNote);
    ticket.timeline.push(newActivity);
    ticket.updatedDate = timestamp;

    await ticket.save();

    if (global.io) {
      global.io.emit("ticket_updated", ticket);
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Admin Add Note Error:", error);
    res.status(500).json({ success: false, message: "Server error adding internal note" });
  }
};


const adminAssignAgent = async (req, res) => {
  const { id } = req.params;
  const { agent } = req.body;
  const actor = req.admin ? req.admin.name : "Agent";

  try {
    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const timestamp = formatTicketDate();
    ticket.assignedAgent = agent;
    
    
    if (ticket.status === "Open" && agent !== "Unassigned") {
      ticket.status = "In Progress";
    }

    ticket.timeline.push({
      id: `act-${Date.now()}`,
      action: `Ticket Assigned to ${agent}`,
      actor,
      timestamp
    });
    ticket.updatedDate = timestamp;

    await ticket.save();

    if (global.io) {
      global.io.emit("ticket_updated", ticket);
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Admin Assign Agent Error:", error);
    res.status(500).json({ success: false, message: "Server error assigning agent" });
  }
};


const adminUpdatePriority = async (req, res) => {
  const { id } = req.params;
  const { priority } = req.body;
  const actor = req.admin ? req.admin.name : "Agent";

  try {
    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const timestamp = formatTicketDate();
    ticket.priority = priority;
    ticket.timeline.push({
      id: `act-${Date.now()}`,
      action: `Priority updated to ${priority}`,
      actor,
      timestamp
    });
    ticket.updatedDate = timestamp;

    await ticket.save();

    if (global.io) {
      global.io.emit("ticket_updated", ticket);
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Admin Update Priority Error:", error);
    res.status(500).json({ success: false, message: "Server error updating priority" });
  }
};


const adminUpdateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const actor = req.admin ? req.admin.name : "Agent";

  try {
    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const timestamp = formatTicketDate();
    ticket.status = status;
    
    if (status === "Resolved" || status === "Closed") {
      ticket.slaStatus = "Resolved";
    }

    ticket.timeline.push({
      id: `act-${Date.now()}`,
      action: `Status changed to ${status}`,
      actor,
      timestamp
    });
    ticket.updatedDate = timestamp;

    await ticket.save();

    if (global.io) {
      global.io.emit("ticket_updated", ticket);
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Admin Update Status Error:", error);
    res.status(500).json({ success: false, message: "Server error updating status" });
  }
};


const adminEscalateTicket = async (req, res) => {
  const { id } = req.params;
  const { reason, escalateTo } = req.body;
  const actor = req.admin ? req.admin.name : "Agent";

  try {
    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const timestamp = formatTicketDate();
    ticket.status = "Escalated";
    ticket.priority = "CRITICAL";
    ticket.slaStatus = "Breached";
    ticket.escalationReason = reason;
    ticket.escalatedTo = escalateTo;

    const sysMessage = {
      id: `msg-sys-${Date.now()}`,
      sender: "System",
      senderName: "Escalation Engine",
      text: `Ticket priority escalated to CRITICAL and routed to ${escalateTo}. Reason: ${reason}`,
      timestamp
    };

    ticket.messages.push(sysMessage);
    ticket.timeline.push({
      id: `act-${Date.now()}`,
      action: `Ticket escalated to ${escalateTo}`,
      actor,
      timestamp
    });
    ticket.updatedDate = timestamp;

    await ticket.save();

    if (global.io) {
      global.io.emit("ticket_updated", ticket);
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Admin Escalate Ticket Error:", error);
    res.status(500).json({ success: false, message: "Server error escalating ticket" });
  }
};


const adminCloseTicket = async (req, res) => {
  const { id } = req.params;
  const { resolutionNotes } = req.body;
  const actor = req.admin ? req.admin.name : "Agent";

  try {
    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const timestamp = formatTicketDate();
    ticket.status = "Closed";
    ticket.slaStatus = "Resolved";
    ticket.resolutionNotes = resolutionNotes;
    ticket.closedDate = timestamp;

    const sysMessage = {
      id: `msg-sys-${Date.now()}`,
      sender: "System",
      senderName: "Closure Engine",
      text: `Ticket resolved and officially CLOSED. Resolution details: ${resolutionNotes}`,
      timestamp
    };

    ticket.messages.push(sysMessage);
    ticket.timeline.push({
      id: `act-${Date.now()}`,
      action: "Ticket closed",
      actor,
      timestamp
    });
    ticket.updatedDate = timestamp;

    await ticket.save();

    if (global.io) {
      global.io.emit("ticket_updated", ticket);
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Admin Close Ticket Error:", error);
    res.status(500).json({ success: false, message: "Server error closing ticket" });
  }
};


const adminReopenTicket = async (req, res) => {
  const { id } = req.params;
  const actor = req.admin ? req.admin.name : "Agent";

  try {
    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const timestamp = formatTicketDate();
    ticket.status = "Open";
    ticket.slaStatus = "Within Limits";
    ticket.resolutionNotes = undefined;
    ticket.closedDate = undefined;

    const sysMessage = {
      id: `msg-sys-${Date.now()}`,
      sender: "System",
      senderName: "Workflow Engine",
      text: "Closed ticket has been re-opened by operator. Restoring active SLA queue monitoring.",
      timestamp
    };

    ticket.messages.push(sysMessage);
    ticket.timeline.push({
      id: `act-${Date.now()}`,
      action: "Ticket Re-opened",
      actor,
      timestamp
    });
    ticket.updatedDate = timestamp;

    await ticket.save();

    if (global.io) {
      global.io.emit("ticket_updated", ticket);
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Admin Reopen Ticket Error:", error);
    res.status(500).json({ success: false, message: "Server error reopening ticket" });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  addMessage,
  adminGetAllTickets,
  adminGetTicketById,
  adminAddNote,
  adminAssignAgent,
  adminUpdatePriority,
  adminUpdateStatus,
  adminEscalateTicket,
  adminCloseTicket,
  adminReopenTicket
};
