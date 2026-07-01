const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Please add a product reference"],
    },
    name: {
      type: String,
      required: [true, "Please add the product name"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please add the product category"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please add the item price"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      required: [true, "Please add the item original price"],
      min: [0, "Original price cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Please add the item image reference"],
    },
    quantity: {
      type: Number,
      required: [true, "Please add the item quantity"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    size: {
      type: String,
      required: [true, "Please add the item size"],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Please add the item color"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    deliveryDate: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const AddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, default: "" },
  zip: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, default: "" },
}, { _id: false });

const TimelineEventSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  timestamp: { type: String, default: "" },
  status: { type: String, enum: ["completed", "current", "upcoming"], default: "upcoming" }
}, { _id: false });

const OrderActivitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  action: { type: String, required: true },
  user: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const OrderNoteSchema = new mongoose.Schema({
  id: { type: String, required: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: String, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must be associated with a user"],
    },
    orderId: {
      type: String,
      required: [true, "Order must have a unique orderId"],
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Customer phone number is required"],
      trim: true,
    },
    promoCode: {
      type: String,
      default: "",
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      default: "Wallet",
      trim: true,
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true,
      trim: true,
    },
    items: {
      type: [OrderItemSchema],
      required: [true, "Order must contain at least one item"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "Pending", "Processing", "Confirmed", "Packed", "Dispatched", "Shipped", "Out For Delivery", "Delivered", "Cancelled", "Refunded"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded", "Failed"],
      default: "Pending",
    },
    deliveryStatus: {
      type: String,
      enum: ["Pending", "In Transit", "Delivered", "Cancelled"],
      default: "Pending",
    },
    shippingAddress: {
      type: AddressSchema,
      required: [true, "Shipping address is required"],
    },
    billingAddress: {
      type: AddressSchema,
      required: [true, "Billing address is required"],
    },
    shippingMethod: {
      type: String,
      default: "Economy",
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Order date string is required"],
    },
    deliveryDate: {
      type: String,
      required: [true, "Expected delivery date string is required"],
    },
    courierPartner: {
      type: String,
      default: "Delhivery",
    },
    trackingId: {
      type: String,
      default: "",
    },
    timeline: {
      type: [TimelineEventSchema],
      default: [],
    },
    activityLogs: {
      type: [OrderActivitySchema],
      default: [],
    },
    notes: {
      type: [OrderNoteSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


OrderSchema.index({ user: 1, status: 1 }); 
OrderSchema.index({ createdAt: -1 }); 

module.exports = mongoose.model("Order", OrderSchema);

