const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/supportTicketController");

const { protect } = require("../middleware/authMiddleware"); 
const { protect: protectAdmin } = require("../src/middleware/auth.middleware"); 
const { checkPermission } = require("../src/middleware/permission.middleware"); 



router.get(
  "/admin",
  protectAdmin,
  checkPermission("tickets", "Ticket Dashboard", "view"),
  adminGetAllTickets
);

router.get(
  "/admin/:id",
  protectAdmin,
  checkPermission("tickets", "Ticket Details", "view"),
  adminGetTicketById
);

router.post(
  "/admin/:id/messages",
  protectAdmin,
  checkPermission("tickets", "Ticket Details", "edit"),
  addMessage
);

router.post(
  "/admin/:id/notes",
  protectAdmin,
  checkPermission("tickets", "Ticket Details", "edit"),
  adminAddNote
);

router.put(
  "/admin/:id/status",
  protectAdmin,
  checkPermission("tickets", "Ticket Details", "edit"),
  adminUpdateStatus
);

router.put(
  "/admin/:id/assign",
  protectAdmin,
  checkPermission("tickets", "Ticket Details", "edit"),
  adminAssignAgent
);

router.put(
  "/admin/:id/priority",
  protectAdmin,
  checkPermission("tickets", "Ticket Details", "edit"),
  adminUpdatePriority
);

router.put(
  "/admin/:id/escalate",
  protectAdmin,
  checkPermission("tickets", "Ticket Escalation", "edit"),
  adminEscalateTicket
);

router.put(
  "/admin/:id/close",
  protectAdmin,
  checkPermission("tickets", "Ticket Closure", "edit"),
  adminCloseTicket
);

router.put(
  "/admin/:id/reopen",
  protectAdmin,
  checkPermission("tickets", "Ticket Details", "edit"),
  adminReopenTicket
);



router.route("/")
  .post(protect, createTicket)
  .get(protect, getMyTickets);

router.route("/:id/messages")
  .post(protect, addMessage);

module.exports = router;
