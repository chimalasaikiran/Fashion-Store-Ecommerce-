const mongoose = require("mongoose");

const ReplacementRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    originalOrderId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    originalProduct: {
      type: String,
      required: true,
    },
    replacementProduct: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Order Created", "Shipped"],
      default: "Pending",
    },
    requestDate: {
      type: String,
      required: true,
    },
    trackingNumber: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReplacementRequest", ReplacementRequestSchema);
