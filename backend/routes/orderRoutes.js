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



router.route("/")
  .post(protect, validateOrderCreate, createOrder)
  .get(protect, getMyOrders);

router.route("/:id")
  .get(protect, getOrderById);

router.route("/:id/cancel")
  .put(protect, cancelOrder);

router.route("/:id/reorder")
  .put(protect, reorder);

module.exports = router;
