const mongoose = require("mongoose");

const RefundRequestSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Processed", "Failed"],
      default: "Pending",
    },
    requestDate: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      default: "",
    },
    timeline: [
      {
        title: { type: String, required: true },
        timestamp: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("RefundRequest", RefundRequestSchema);
