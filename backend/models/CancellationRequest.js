const mongoose = require("mongoose");

const CancellationRequestSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    orderId: {
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
    reason: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    action: {
      type: String,
      enum: ["Refund", "Replacement"],
      default: "Refund",
    },
    previousStatus: {
      type: String,
      required: true,
    },
    requestDate: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CancellationRequest", CancellationRequestSchema);
