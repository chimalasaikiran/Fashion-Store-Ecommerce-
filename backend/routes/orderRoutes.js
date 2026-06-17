const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  reorder,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { validateOrderCreate } = require("../middleware/orderValidation");

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
