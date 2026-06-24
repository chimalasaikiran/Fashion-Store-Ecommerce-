const express = require("express");
const router = express.Router();
const auditController = require("./audit.controller");
const { protect } = require("../../middleware/auth.middleware");
const { checkPermission } = require("../../middleware/permission.middleware");

// Get audit logs for role/permission changes (requires view access to roles management)
router.get(
  "/",
  protect,
  checkPermission("roles", "Role & Access Management", "view"),
  auditController.getAuditLogs
);

module.exports = router;
