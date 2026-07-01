const express = require("express");
const router = express.Router();
const { getPaymentLogs } = require("../controllers/paymentController");
const { protect: protectAdmin } = require("../src/middleware/auth.middleware");
const { checkPermission } = require("../src/middleware/permission.middleware");

router.get(
  "/admin",
  protectAdmin,
  checkPermission("payments", "Payment Logs", "view"),
  getPaymentLogs
);

module.exports = router;
