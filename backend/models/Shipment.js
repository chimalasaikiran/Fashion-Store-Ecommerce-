const mongoose = require("mongoose");

const ShipmentSchema = new mongoose.Schema(
  {
    shipmentId: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
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
    shippingAddress: {
      type: String,
      required: true,
    },
    courier: {
      type: String,
      required: true,
    },
    shippingMethod: {
      type: String,
      enum: ["Air", "Sea", "Land"],
      default: "Air",
    },
    packageSummary: {
      type: String,
      default: "",
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    trackingNumber: {
      type: String,
      default: "",
    },
    labelGenerated: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Draft", "Ready to Ship", "Dispatched", "In Transit", "Delivered", "Delayed"],
      default: "Draft",
    },
    dispatchDate: {
      type: String,
      default: "",
    },
    estDeliveryDate: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shipment", ShipmentSchema);
