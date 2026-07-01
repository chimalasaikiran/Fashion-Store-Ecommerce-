const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  reorder,
  adminGetAllOrders,
  adminGetOrderMetrics,
  adminUpdateOrderStatus,
  adminUpdatePaymentStatus,
  adminUpdateDeliveryStatus,
  adminRefundOrder,
  adminAddNote,
  adminUpdateDetails,
  adminDeleteOrder,
  adminBulkUpdateStatus,
  adminBulkDelete,
  adminGetCancellations,
  adminApproveCancellation,
  adminRejectCancellation,
  adminGetRefunds,
  adminApproveRefund,
  adminRejectRefund,
  adminProcessRefund,
  createReturnRequest,
  createReplacementRequest,
  adminGetReturns,
  adminApproveReturn,
  adminRejectReturn,
  adminScheduleReturnPickup,
  adminGetReplacements,
  adminApproveReplacement,
  adminRejectReplacement,
  adminCreateReplacementOrder,
  adminGenerateReplacementShipment
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware"); 
const { validateOrderCreate } = require("../middleware/orderValidation");


const { protect: protectAdmin } = require("../src/middleware/auth.middleware");
const { checkPermission } = require("../src/middleware/permission.middleware");



router.get(
  "/admin",
  protectAdmin,
  checkPermission("orders", "Order List", "view"),
  adminGetAllOrders
);

router.get(
  "/admin/metrics",
  protectAdmin,
  checkPermission("dashboard", "Dashboard View", "view"),
  adminGetOrderMetrics
);

router.put(
  "/admin/:id/status",
  protectAdmin,
  checkPermission("orders", "Order Details", "edit"),
  adminUpdateOrderStatus
);

router.put(
  "/admin/:id/payment",
  protectAdmin,
  checkPermission("orders", "Order Details", "edit"),
  adminUpdatePaymentStatus
);

router.put(
  "/admin/:id/delivery",
  protectAdmin,
  checkPermission("orders", "Order Details", "edit"),
  adminUpdateDeliveryStatus
);

router.put(
  "/admin/:id/refund",
  protectAdmin,
  checkPermission("orders", "Refund Management", "edit"),
  adminRefundOrder
);

router.post(
  "/admin/:id/notes",
  protectAdmin,
  checkPermission("orders", "Order Details", "edit"),
  adminAddNote
);

router.put(
  "/admin/:id/details",
  protectAdmin,
  checkPermission("orders", "Order Details", "edit"),
  adminUpdateDetails
);

router.delete(
  "/admin/:id",
  protectAdmin,
  checkPermission("orders", "Order Details", "delete"),
  adminDeleteOrder
);

router.post(
  "/admin/bulk-status",
  protectAdmin,
  checkPermission("orders", "Order List", "edit"),
  adminBulkUpdateStatus
);

router.post(
  "/admin/bulk-delete",
  protectAdmin,
  checkPermission("orders", "Order List", "delete"),
  adminBulkDelete
);


// Cancellation Requests admin routes
router.get(
  "/admin/cancellations",
  protectAdmin,
  checkPermission("shipments", "Cancellation Requests", "view"),
  adminGetCancellations
);

router.put(
  "/admin/cancellations/:id/approve",
  protectAdmin,
  checkPermission("shipments", "Cancellation Requests", "edit"),
  adminApproveCancellation
);

router.put(
  "/admin/cancellations/:id/reject",
  protectAdmin,
  checkPermission("shipments", "Cancellation Requests", "edit"),
  adminRejectCancellation
);

// Refund Requests admin routes
router.get(
  "/admin/refunds",
  protectAdmin,
  checkPermission("shipments", "Refund Processing", "view"),
  adminGetRefunds
);

router.put(
  "/admin/refunds/:id/approve",
  protectAdmin,
  checkPermission("shipments", "Refund Processing", "edit"),
  adminApproveRefund
);

router.put(
  "/admin/refunds/:id/reject",
  protectAdmin,
  checkPermission("shipments", "Refund Processing", "edit"),
  adminRejectRefund
);

router.put(
  "/admin/refunds/:id/process",
  protectAdmin,
  checkPermission("shipments", "Refund Processing", "edit"),
  adminProcessRefund
);


router.route("/")
  .post(protect, validateOrderCreate, createOrder)
  .get(protect, getMyOrders);

router.route("/:id")
  .get(protect, getOrderById);

router.route("/:id/cancel")
  .put(protect, cancelOrder);

router.route("/:id/reorder")
  .put(protect, reorder);

// Return Requests admin routes
router.get(
  "/admin/returns",
  protectAdmin,
  checkPermission("shipments", "Return Requests", "view"),
  adminGetReturns
);
router.put(
  "/admin/returns/:id/approve",
  protectAdmin,
  checkPermission("shipments", "Return Requests", "edit"),
  adminApproveReturn
);
router.put(
  "/admin/returns/:id/reject",
  protectAdmin,
  checkPermission("shipments", "Return Requests", "edit"),
  adminRejectReturn
);
router.put(
  "/admin/returns/:id/pickup",
  protectAdmin,
  checkPermission("shipments", "Return Requests", "edit"),
  adminScheduleReturnPickup
);

// Replacement Requests admin routes
router.get(
  "/admin/replacements",
  protectAdmin,
  checkPermission("shipments", "Replacement Orders", "view"),
  adminGetReplacements
);
router.put(
  "/admin/replacements/:id/approve",
  protectAdmin,
  checkPermission("shipments", "Replacement Orders", "edit"),
  adminApproveReplacement
);
router.put(
  "/admin/replacements/:id/reject",
  protectAdmin,
  checkPermission("shipments", "Replacement Orders", "edit"),
  adminRejectReplacement
);
router.put(
  "/admin/replacements/:id/create-order",
  protectAdmin,
  checkPermission("shipments", "Replacement Orders", "edit"),
  adminCreateReplacementOrder
);
router.put(
  "/admin/replacements/:id/ship",
  protectAdmin,
  checkPermission("shipments", "Replacement Orders", "edit"),
  adminGenerateReplacementShipment
);

// User Return / Replacement routes
router.route("/:id/return")
  .post(protect, createReturnRequest);

router.route("/:id/replacement")
  .post(protect, createReplacementRequest);


module.exports = router;
