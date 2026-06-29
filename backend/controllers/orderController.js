const Order = require("../models/Order");
const Product = require("../models/Product");


const formatOrderDate = (date) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; 
  const strTime = hours.toString().padStart(2, "0") + ":" + minutes + " " + ampm;
  return `${day} ${month} ${year}, ${strTime}`;
};


const formatDeliveryDate = (date) => {
  const months = [
    "March", "April", "May", "June", "July", "August", 
    "September", "October", "November", "December", "January", "February"
  ];
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${month} ${day}, ${year} | 03:00 PM`;
};


const generateOrderId = async () => {
  let isUnique = false;
  let orderId = "";
  while (!isUnique) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    orderId = `#FN${randomNum}`;
    const existingOrder = await Order.findOne({ orderId });
    if (!existingOrder) {
      isUnique = true;
    }
  }
  return orderId;
};


const generateTransactionId = async () => {
  let isUnique = false;
  let transactionId = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  while (!isUnique) {
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    transactionId = `TR${result}`;
    const existingOrder = await Order.findOne({ transactionId });
    if (!existingOrder) {
      isUnique = true;
    }
  }
  return transactionId;
};




const { createInitialTimeline, orchestrateTransition, formatEventDate } = require("../utils/orderOrchestrator");

const serializeOrder = (order) => {
  const obj = order.toObject ? order.toObject() : order;
  obj.id = obj._id.toString();

  
  if (obj.status === "active") {
    obj.status = "Pending";
  } else if (obj.status === "completed") {
    obj.status = "Delivered";
  } else if (obj.status === "cancelled") {
    obj.status = "Cancelled";
  }

  
  if (!obj.shippingAddress) {
    obj.shippingAddress = {
      name: obj.customerName || "Customer",
      street: "123 Apparel Blvd, Suite 400",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      country: "United States",
      phone: obj.phone || ""
    };
  }

  
  if (!obj.billingAddress) {
    obj.billingAddress = {
      name: obj.customerName || "Customer",
      street: "123 Apparel Blvd, Suite 400",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      country: "United States",
      phone: obj.phone || ""
    };
  }

  
  if (!obj.timeline || obj.timeline.length === 0) {
    const timeStr = obj.date || "N/A";
    const isPaid = obj.paymentStatus === "Paid";
    obj.timeline = createInitialTimeline(timeStr, isPaid);
    
    
    obj.timeline = obj.timeline.map(event => {
      if (obj.status === "Processing") {
        if (["evt-confirmed", "evt-processing"].includes(event.id)) {
          return { ...event, status: "completed", timestamp: timeStr };
        }
        if (event.id === "evt-dispatched") {
          return { ...event, status: "current" };
        }
      } else if (obj.status === "Dispatched") {
        if (["evt-confirmed", "evt-processing", "evt-dispatched"].includes(event.id)) {
          return { ...event, status: "completed", timestamp: timeStr };
        }
        if (event.id === "evt-shipped") {
          return { ...event, status: "current" };
        }
      } else if (obj.status === "Shipped") {
        if (["evt-confirmed", "evt-processing", "evt-dispatched", "evt-shipped"].includes(event.id)) {
          return { ...event, status: "completed", timestamp: timeStr };
        }
        if (event.id === "evt-out-for-delivery") {
          return { ...event, status: "current" };
        }
      } else if (obj.status === "Out For Delivery") {
        if (["evt-confirmed", "evt-processing", "evt-dispatched", "evt-shipped", "evt-out-for-delivery"].includes(event.id)) {
          return { ...event, status: "completed", timestamp: timeStr };
        }
        if (event.id === "evt-delivered") {
          return { ...event, status: "current" };
        }
      } else if (obj.status === "Delivered") {
        if (["evt-confirmed", "evt-processing", "evt-dispatched", "evt-shipped", "evt-out-for-delivery", "evt-delivered"].includes(event.id)) {
          return { ...event, status: "completed", timestamp: timeStr };
        }
      } else if (obj.status === "Cancelled" || obj.status === "Refunded") {
        if (event.status === "current" || event.status === "upcoming") {
          return {
            ...event,
            status: "upcoming",
            title: `${event.title} (Cancelled)`,
            description: `This step was cancelled because the order was terminated.`
          };
        }
      }
      return event;
    });
  }

  if (obj.items && Array.isArray(obj.items)) {
    obj.items = obj.items.map(item => {
      if (item._id) item.id = item._id.toString();
      return item;
    });
  }
  return obj;
};

const createOrder = async (req, res) => {
  const { phone, promoCode, paymentMethod, items, totalAmount } = req.body;

  try {
    const orderId = await generateOrderId();
    const transactionId = await generateTransactionId();
    
    const now = new Date();
    const delivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); 

    const orderItems = items.map((item) => ({
      product: item.product,
      name: item.name,
      category: item.category,
      price: Number(item.price),
      originalPrice: Number(item.originalPrice || item.price),
      image: item.image,
      quantity: Number(item.quantity || 1),
      size: item.size,
      color: item.color,
      status: "active",
      deliveryDate: formatDeliveryDate(delivery),
    }));

    const defaultShippingAddress = req.body.shippingAddress || {
      name: req.user.name || "Customer",
      street: "123 Apparel Blvd, Suite 400",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      country: "United States",
      phone: phone || req.user.phone || "+1 (208) 555-0112"
    };

    const defaultBillingAddress = req.body.billingAddress || {
      name: req.user.name || "Customer",
      street: "123 Apparel Blvd, Suite 400",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      country: "United States"
    };

    const orderDateStr = formatOrderDate(now);

    const order = await Order.create({
      user: req.user.id,
      orderId,
      customerName: req.user.name,
      phone,
      promoCode: promoCode || "",
      paymentMethod: paymentMethod || "Wallet",
      transactionId,
      items: orderItems,
      totalAmount: Number(totalAmount),
      status: "Pending",
      paymentStatus: paymentMethod === "Wallet" ? "Paid" : "Pending",
      deliveryStatus: "Pending",
      shippingAddress: defaultShippingAddress,
      billingAddress: defaultBillingAddress,
      date: orderDateStr,
      deliveryDate: formatDeliveryDate(delivery),
      timeline: createInitialTimeline(orderDateStr, paymentMethod === "Wallet"),
      activityLogs: [
        {
          id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          action: "Order Placed by Customer",
          user: req.user.name || "Customer",
          timestamp: now
        }
      ],
      notes: []
    });

    const serialized = serializeOrder(order);

    
    if (global.io) {
      global.io.emit("order_created", serialized);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: serialized,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: "Server error while placing order" });
  }
};

const getMyOrders = async (req, res) => {
  const { status } = req.query;

  try {
    const query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(serializeOrder),
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching orders" });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    let order;

    if (id.startsWith("#FN")) {
      order = await Order.findOne({ orderId: id, user: req.user.id });
    } else if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findOne({ _id: id, user: req.user.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order: serializeOrder(order),
    });
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching order details" });
  }
};

const cancelOrder = async (req, res) => {
  const { id } = req.params;

  try {
    let order;

    if (id.startsWith("#FN")) {
      order = await Order.findOne({ orderId: id, user: req.user.id });
    } else if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findOne({ _id: id, user: req.user.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "Delivered" || order.status === "completed") {
      return res.status(400).json({ success: false, message: "Delivered orders cannot be cancelled" });
    }

    const updatedOrder = orchestrateTransition(order, "Cancelled", req.user.name || "Customer");
    await updatedOrder.save();
    
    const serialized = serializeOrder(updatedOrder);

    
    if (global.io) {
      global.io.emit("order_updated", serialized);
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: serialized,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error while cancelling order" });
  }
};

const reorder = async (req, res) => {
  const { id } = req.params;

  try {
    let order;

    if (id.startsWith("#FN")) {
      order = await Order.findOne({ orderId: id, user: req.user.id });
    } else if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findOne({ _id: id, user: req.user.id });
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    
    order.status = "Pending";
    order.paymentStatus = order.paymentMethod === "Wallet" ? "Paid" : "Pending";
    order.deliveryStatus = "Pending";
    order.items.forEach((item) => {
      item.status = "active";
    });

    const now = new Date();
    const delivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const orderDateStr = formatOrderDate(now);
    
    order.date = orderDateStr;
    order.deliveryDate = formatDeliveryDate(delivery);
    order.timeline = createInitialTimeline(orderDateStr);
    order.activityLogs.unshift({
      id: `act-${Date.now()}`,
      action: "Order Replaced (Reordered)",
      user: req.user.name || "Customer",
      timestamp: now
    });

    await order.save();
    const serialized = serializeOrder(order);

    if (global.io) {
      global.io.emit("order_created", serialized);
    }

    res.status(200).json({
      success: true,
      message: "Reordered successfully! Restored to Pending Orders.",
      order: serialized,
    });
  } catch (error) {
    console.error("Reorder Error:", error);
    res.status(500).json({ success: false, message: "Server error while reordering" });
  }
};



const adminGetAllOrders = async (req, res) => {
  try {
    const { searchQuery, orderStatus, paymentStatus, sortBy, sortOrder } = req.query;
    const query = {};

    
    if (searchQuery) {
      const regex = new RegExp(searchQuery, "i");
      query.$or = [
        { orderId: regex },
        { customerName: regex },
        { phone: regex }
      ];
    }

    
    if (orderStatus && orderStatus !== "All") {
      query.status = orderStatus;
    }
    if (paymentStatus && paymentStatus !== "All") {
      query.paymentStatus = paymentStatus;
    }

    
    let sortObj = { createdAt: -1 };
    if (sortBy) {
      const orderDir = sortOrder === "desc" ? -1 : 1;
      if (sortBy === "id") sortObj = { orderId: orderDir };
      else if (sortBy === "customerName") sortObj = { customerName: orderDir };
      else if (sortBy === "totalAmount") sortObj = { totalAmount: orderDir };
      else if (sortBy === "createdDate") sortObj = { createdAt: orderDir };
    }

    const orders = await Order.find(query).sort(sortObj);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(serializeOrder)
    });
  } catch (error) {
    console.error("Admin Get All Orders Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching administrative orders list" });
  }
};

const adminGetOrderMetrics = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    const processingOrders = await Order.countDocuments({ status: "Processing" });
    const dispatchedOrders = await Order.countDocuments({ status: "Dispatched" });
    const shippedOrders = await Order.countDocuments({ status: "Shipped" });
    const outForDeliveryOrders = await Order.countDocuments({ status: "Out For Delivery" });
    const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });
    const refundRequests = await Order.countDocuments({ paymentStatus: "Refunded" });

    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });

    
    const revenueAggregate = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].total : 0;

    res.status(200).json({
      success: true,
      metrics: {
        totalOrders,
        pendingOrders,
        processingOrders,
        dispatchedOrders,
        shippedOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        refundRequests,
        todayOrders,
        totalRevenue
      }
    });
  } catch (error) {
    console.error("Admin Get Order Metrics Error:", error);
    res.status(500).json({ success: false, message: "Server error while aggregating order statistics" });
  }
};

const adminUpdateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const adminName = req.admin ? req.admin.name : "Store Admin";

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found in database" });
    }

    const updatedOrder = orchestrateTransition(order, status, adminName);
    await updatedOrder.save();

    const serialized = serializeOrder(updatedOrder);

    
    if (global.io) {
      global.io.emit("order_updated", serialized);
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: serialized
    });
  } catch (error) {
    console.error("Admin Update Order Status Error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to update status" });
  }
};

const adminUpdatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;
  const adminName = req.admin ? req.admin.name : "Store Admin";

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.paymentStatus = paymentStatus;
    
    
    if (paymentStatus === "Paid") {
      const timestampStr = formatEventDate();
      order.timeline = order.timeline.map(evt => {
        if (evt.id === "evt-payment") {
          return { ...evt, status: "completed", timestamp: timestampStr, description: "Your payment has been successfully processed and cleared." };
        }
        return evt;
      });
    }

    order.activityLogs.unshift({
      id: `act-${Date.now()}`,
      action: `Payment Status changed to ${paymentStatus}`,
      user: adminName,
      timestamp: new Date()
    });

    await order.save();
    const serialized = serializeOrder(order);

    if (global.io) {
      global.io.emit("order_updated", serialized);
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated",
      order: serialized
    });
  } catch (error) {
    console.error("Admin Payment Status Update Error:", error);
    res.status(500).json({ success: false, message: "Server error updating payment status" });
  }
};

const adminUpdateDeliveryStatus = async (req, res) => {
  const { id } = req.params;
  const { deliveryStatus } = req.body;
  const adminName = req.admin ? req.admin.name : "Store Admin";

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.deliveryStatus = deliveryStatus;
    const timestampStr = formatEventDate();

    
    if (deliveryStatus === "In Transit" && order.status !== "Shipped") {
      order.status = "Shipped";
      order.timeline = order.timeline.map(evt => {
        if (evt.id === "evt-shipped") return { ...evt, status: "completed", timestamp: timestampStr };
        return evt;
      });
    } else if (deliveryStatus === "Delivered" && order.status !== "Delivered") {
      order.status = "Delivered";
      order.paymentStatus = "Paid";
      order.timeline = order.timeline.map(evt => {
        if (evt.id === "evt-delivered") return { ...evt, status: "completed", timestamp: timestampStr };
        return evt;
      });
    }

    order.activityLogs.unshift({
      id: `act-${Date.now()}`,
      action: `Delivery Status changed to ${deliveryStatus}`,
      user: adminName,
      timestamp: new Date()
    });

    await order.save();
    const serialized = serializeOrder(order);

    if (global.io) {
      global.io.emit("order_updated", serialized);
    }

    res.status(200).json({
      success: true,
      message: "Delivery status updated",
      order: serialized
    });
  } catch (error) {
    console.error("Admin Delivery Status Update Error:", error);
    res.status(500).json({ success: false, message: "Server error updating logistic delivery status" });
  }
};

const adminRefundOrder = async (req, res) => {
  const { id } = req.params;
  const adminName = req.admin ? req.admin.name : "Store Admin";

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const updatedOrder = orchestrateTransition(order, "Refunded", adminName);
    await updatedOrder.save();
    
    const serialized = serializeOrder(updatedOrder);

    if (global.io) {
      global.io.emit("order_updated", serialized);
    }

    res.status(200).json({
      success: true,
      message: "Order successfully refunded and cancelled",
      order: serialized
    });
  } catch (error) {
    console.error("Admin Refund Error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to process refund" });
  }
};

const adminAddNote = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const authorName = req.admin ? req.admin.name : "Store Admin";

  try {
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Comment content cannot be empty" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const timestampStr = formatEventDate();

    order.notes.push({
      id: `note-${Date.now()}`,
      author: authorName,
      content: content.trim(),
      timestamp: timestampStr
    });

    order.activityLogs.unshift({
      id: `act-${Date.now()}`,
      action: "Added administrative comment note to order",
      user: authorName,
      timestamp: new Date()
    });

    await order.save();
    const serialized = serializeOrder(order);

    res.status(200).json({
      success: true,
      message: "Administrative comment note logged successfully",
      order: serialized
    });
  } catch (error) {
    console.error("Admin Add Note Error:", error);
    res.status(500).json({ success: false, message: "Server error while saving note" });
  }
};

const adminUpdateDetails = async (req, res) => {
  const { id } = req.params;
  const { shippingAddress } = req.body;
  const adminName = req.admin ? req.admin.name : "Store Admin";

  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (shippingAddress) {
      order.shippingAddress = {
        ...order.shippingAddress,
        ...shippingAddress
      };
    }

    order.activityLogs.unshift({
      id: `act-${Date.now()}`,
      action: "Updated order shipping destination details",
      user: adminName,
      timestamp: new Date()
    });

    await order.save();
    const serialized = serializeOrder(order);

    res.status(200).json({
      success: true,
      message: "Shipping destination updated successfully",
      order: serialized
    });
  } catch (error) {
    console.error("Admin Update Details Error:", error);
    res.status(500).json({ success: false, message: "Server error while saving address details" });
  }
};

const adminDeleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found in database" });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted permanently from records"
    });
  } catch (error) {
    console.error("Admin Delete Order Error:", error);
    res.status(500).json({ success: false, message: "Server error while deleting order records" });
  }
};

const adminBulkUpdateStatus = async (req, res) => {
  const { ids, status } = req.body;
  const adminName = req.admin ? req.admin.name : "Store Admin";

  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Order IDs array is required" });
    }

    const updatedOrders = [];
    for (const id of ids) {
      const order = await Order.findById(id);
      if (order) {
        try {
          const transitioned = orchestrateTransition(order, status, adminName);
          await transitioned.save();
          updatedOrders.push(serializeOrder(transitioned));
        } catch (err) {
          console.warn(`Bulk update skipped for order ${id}: ${err.message}`);
        }
      }
    }

    
    if (global.io && updatedOrders.length > 0) {
      updatedOrders.forEach(o => global.io.emit("order_updated", o));
    }

    res.status(200).json({
      success: true,
      message: `Bulk updated ${updatedOrders.length} orders successfully`,
      orders: updatedOrders
    });
  } catch (error) {
    console.error("Admin Bulk Update Error:", error);
    res.status(500).json({ success: false, message: "Server error executing bulk status update" });
  }
};

const adminBulkDelete = async (req, res) => {
  const { ids } = req.body;

  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Order IDs array is required" });
    }

    await Order.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `Bulk deleted ${ids.length} orders successfully`
    });
  } catch (error) {
    console.error("Admin Bulk Delete Error:", error);
    res.status(500).json({ success: false, message: "Server error executing bulk delete" });
  }
};

module.exports = {
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
  adminBulkDelete
};
