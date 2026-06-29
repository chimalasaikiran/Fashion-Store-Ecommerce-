const mongoose = require("mongoose");

const TicketMessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sender: { type: String, enum: ["Customer", "Agent", "System"], required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true },
  avatar: { type: String }
}, { _id: false });

const TicketNoteSchema = new mongoose.Schema({
  id: { type: String, required: true },
  author: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: String, required: true }
}, { _id: false });

const TicketActivitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  action: { type: String, required: true },
  actor: { type: String, required: true },
  timestamp: { type: String, required: true }
}, { _id: false });

const TicketAttachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, required: true },
  type: { type: String, required: true }
}, { _id: false });

const SupportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
    default: "MEDIUM"
  },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Escalated", "Resolved", "Closed"],
    default: "Open"
  },
  assignedAgent: {
    type: String,
    default: "Unassigned"
  },
  createdDate: {
    type: String,
    required: true
  },
  updatedDate: {
    type: String,
    required: true
  },
  slaDue: {
    type: String,
    default: ""
  },
  slaStatus: {
    type: String,
    enum: ["Breached", "Warning", "Within Limits", "Resolved"],
    default: "Within Limits"
  },
  messages: {
    type: [TicketMessageSchema],
    default: []
  },
  notes: {
    type: [TicketNoteSchema],
    default: []
  },
  timeline: {
    type: [TicketActivitySchema],
    default: []
  },
  attachments: {
    type: [TicketAttachmentSchema],
    default: []
  },
  escalationReason: { type: String },
  escalatedTo: { type: String },
  resolutionNotes: { type: String },
  feedbackRating: { type: Number },
  feedbackComment: { type: String },
  closedDate: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model("SupportTicket", SupportTicketSchema);
