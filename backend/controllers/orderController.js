const Order = require("../models/Order");
const Product = require("../models/Product");
const CancellationRequest = require("../models/CancellationRequest");
const RefundRequest = require("../models/RefundRequest");
const ReturnRequest = require("../models/ReturnRequest");
const ReplacementRequest = require("../models/ReplacementRequest");


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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
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

const isOnlinePayment = (method) => {
  if (!method) return false;
  const m = method.toLowerCase();
  return m !== "cash" && m !== "cod";
};


const { createInitialTimeline, orchestrateTransition, formatEventDate } = require("../utils/orderOrchestrator");

const serializeOrder = (order, returnRequests = [], refundRequests = []) => {
  const obj = order.toObject ? order.toObject() : order;
  obj.id = obj._id.toString();

  if (!obj.courierPartner) {
    obj.courierPartner = "";
  }
  if (!obj.trackingId) {
    obj.trackingId = "";
  }

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

  
  if (obj.status === "Cancelled" || obj.status === "Refunded") {
    if (!obj.timeline || obj.timeline.length === 0 || (obj.timeline.length === 1 && obj.timeline[0].id === "evt-cancelled")) {
      const timeStr = obj.date || "N/A";
      const isPaid = obj.paymentStatus === "Paid";
      obj.timeline = createInitialTimeline(timeStr, isPaid);
    }
    if (!obj.timeline.some(e => e.id === "evt-cancelled")) {
      obj.timeline = obj.timeline.filter(e => e.status === "completed" || e.status === "current");
      obj.timeline = obj.timeline.filter(e => e.id !== "evt-cancelled");
      obj.timeline.push({
        id: "evt-cancelled",
        title: "Cancelled",
        description: obj.status === "Refunded" ? "Order has been cancelled and payment refunded." : "Order has been cancelled.",
        timestamp: obj.date || "N/A",
        status: "completed"
      });
    }
  } else if (!obj.timeline || obj.timeline.length === 0) {
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
      }
      return event;
    });
  }

  // Append Return Request events if any exist
  if (returnRequests && returnRequests.length > 0) {
    if (!obj.timeline) {
      obj.timeline = [];
    }
    returnRequests.forEach(ret => {
      // 1. Return Requested Event
      obj.timeline.push({
        id: `evt-return-requested-${ret._id}`,
        title: `Return Requested`,
        description: `Return requested for ${ret.productName}. Reason: ${ret.reason}`,
        timestamp: ret.requestDate,
        status: "completed"
      });

      // 2. Return Status Event
      if (ret.status === "Approved") {
        obj.timeline.push({
          id: `evt-return-approved-${ret._id}`,
          title: `Return Approved`,
          description: `Return request for ${ret.productName} has been approved.`,
          timestamp: formatEventDate(ret.updatedAt),
          status: "completed"
        });
      } else if (ret.status === "Pickup Scheduled") {
        obj.timeline.push({
          id: `evt-return-approved-${ret._id}`,
          title: `Return Approved`,
          description: `Return request for ${ret.productName} has been approved.`,
          timestamp: formatEventDate(ret.updatedAt),
          status: "completed"
        });
        obj.timeline.push({
          id: `evt-return-pickup-${ret._id}`,
          title: `Pickup Scheduled`,
          description: `Pickup has been scheduled for ${ret.productName}.`,
          timestamp: formatEventDate(ret.updatedAt),
          status: "completed"
        });
      } else if (ret.status === "Rejected") {
        obj.timeline.push({
          id: `evt-return-rejected-${ret._id}`,
          title: `Return Rejected`,
          description: `Return request for ${ret.productName} was rejected.`,
          timestamp: formatEventDate(ret.updatedAt),
          status: "completed"
        });
      } else if (ret.status === "Pending") {
        obj.timeline.push({
          id: `evt-return-pending-${ret._id}`,
          title: `Return Pending`,
          description: `Awaiting merchant approval for ${ret.productName}.`,
          timestamp: "",
          status: "current"
        });
      }
    });
  }

  // Append Refund Request events if any exist
  if (refundRequests && refundRequests.length > 0) {
    if (!obj.timeline) {
      obj.timeline = [];
    }
    refundRequests.forEach(ref => {
      if (ref.timeline && ref.timeline.length > 0) {
        ref.timeline.forEach((evt, idx) => {
          let status = "completed";
          if (ref.status === "Pending" && idx === ref.timeline.length - 1) {
            status = "current";
          }
          
          let eventId = `evt-refund-other-${ref._id}-${idx}`;
          if (evt.title === "Refund Initiated") eventId = `evt-refund-initiated-${ref._id}`;
          else if (evt.title === "Approved by Merchant") eventId = `evt-refund-approved-${ref._id}`;
          else if (evt.title === "Refund Rejected") eventId = `evt-refund-rejected-${ref._id}`;
          else if (evt.title === "Processed through Gateway") eventId = `evt-refund-processed-${ref._id}`;
          else if (evt.title === "Gateway Cleared") eventId = `evt-refund-cleared-${ref._id}`;

          obj.timeline.push({
            id: eventId,
            title: evt.title,
            description: `Refund amount: ₹${ref.amount.toFixed(2)}. Status: ${ref.status}`,
            timestamp: evt.timestamp,
            status: status
          });
        });

        // If pending, add an upcoming step for processed
        if (ref.status === "Pending" && !ref.timeline.some(e => e.title === "Processed through Gateway")) {
          obj.timeline.push({
            id: `evt-refund-processed-upcoming-${ref._id}`,
            title: "Refund Processed",
            description: "Refund will be credited to your original payment method.",
            timestamp: "",
            status: "upcoming"
          });
        }
      }
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

const restockOrderItems = async (order) => {
  if (order.items && Array.isArray(order.items)) {
    for (const item of order.items) {
      if (item.product) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += Number(item.quantity || 1);
          await product.save();

          // Emit socket event for real-time sync
          if (global.io) {
            const p = product.toObject();
            p.id = p._id.toString();
            global.io.emit("product_updated", p);
          }
        }
      }
    }
  }
};

const createOrder = async (req, res) => {
  const { phone, promoCode, paymentMethod, items, totalAmount, shippingMethod } = req.body;

  try {
    // Verify stock availability
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }
      if (product.stock !== undefined && product.stock < Number(item.quantity || 1)) {
        return res.status(400).json({
          success: false,
          message: `Item out of stock or insufficient quantity: ${item.name} (Available: ${product.stock})`
        });
      }
    }

    // Decrement stock levels
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - Number(item.quantity || 1));
        await product.save();

        // Emit socket event for real-time sync
        if (global.io) {
          const p = product.toObject();
          p.id = p._id.toString();
          global.io.emit("product_updated", p);
        }
      }
    }

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
      paymentStatus: isOnlinePayment(paymentMethod) ? "Paid" : "Pending",
      deliveryStatus: "Pending",
      shippingAddress: defaultShippingAddress,
      billingAddress: defaultBillingAddress,
      shippingMethod: shippingMethod || "Economy",
      date: orderDateStr,
      deliveryDate: formatDeliveryDate(delivery),
      timeline: createInitialTimeline(orderDateStr, isOnlinePayment(paymentMethod)),
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

    const orderIds = orders.map(o => o._id);
    const returnRequests = await ReturnRequest.find({ order: { $in: orderIds } });
    const refundRequests = await RefundRequest.find({ order: { $in: orderIds } });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(order => {
        const orderReturns = returnRequests.filter(r => r.order.toString() === order._id.toString());
        const orderRefunds = refundRequests.filter(r => r.order.toString() === order._id.toString());
        return serializeOrder(order, orderReturns, orderRefunds);
      }),
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

    const returnRequests = await ReturnRequest.find({ order: order._id });
    const refundRequests = await RefundRequest.find({ order: order._id });

    res.status(200).json({
      success: true,
      order: serializeOrder(order, returnRequests, refundRequests),
    });
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching order details" });
  }
};

const cancelOrder = async (req, res) => {
  const { id } = req.params;
  const { reason, comments } = req.body;

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

    if (order.status === "Delivered" || order.status === "completed" || order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Order cannot be cancelled in its current state" });
    }

    const previousStatus = order.status;

    // Stop the timeline at the current order stage and add the cancellation events
    const timestampStr = formatEventDate();
    
    // Ensure timeline is initialized
    if (!order.timeline || order.timeline.length === 0) {
      order.timeline = createInitialTimeline(order.date || timestampStr, order.paymentStatus === "Paid");
    }

    // Map current status to the last allowed standard event ID
    const eventOrder = ["evt-payment", "evt-confirmed", "evt-dispatched", "evt-shipped", "evt-out-for-delivery", "evt-delivered"];
    const statusToLastEvent = {
      "Pending": "evt-payment",
      "Confirmed": "evt-confirmed",
      "Processing": "evt-confirmed",
      "Packed": "evt-dispatched",
      "Dispatched": "evt-dispatched",
      "Shipped": "evt-shipped",
      "Out For Delivery": "evt-out-for-delivery",
      "Delivered": "evt-delivered"
    };

    const lastEventId = statusToLastEvent[order.status] || "evt-payment";
    const lastEventIndex = eventOrder.indexOf(lastEventId);

    // Keep only the events up to the last event index
    order.timeline = order.timeline.filter(e => {
      const idx = eventOrder.indexOf(e.id);
      return idx !== -1 && idx <= lastEventIndex;
    });

    // Mark kept events as completed
    order.timeline = order.timeline.map(e => ({
      ...e,
      status: "completed",
      timestamp: e.timestamp || timestampStr
    }));

    // Add Cancellation Requested
    order.timeline.push({
      id: "evt-cancellation-requested",
      title: "Cancellation Requested",
      description: "You have submitted a request to cancel this order.",
      timestamp: timestampStr,
      status: "completed"
    });

    // Add Cancelled (Awaiting admin approval)
    order.timeline.push({
      id: "evt-cancelled",
      title: "Cancelled",
      description: "Awaiting admin approval.",
      timestamp: "",
      status: "current"
    });

    // Do NOT transition the order status immediately or restock items
    order.activityLogs.unshift({
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: "Cancellation Requested by Customer",
      user: req.user.name || "Customer",
      timestamp: new Date()
    });
    await order.save();
    
    // Create CancellationRequest
    const cancellation = await CancellationRequest.create({
      order: order._id,
      orderId: order.orderId,
      customerName: req.user.name || "Customer",
      customerEmail: req.user.email || `${(req.user.name || "customer").toLowerCase().replace(/\s+/g, "")}@example.com`,
      reason: reason || "No reason specified",
      comments: comments || "",
      status: "Pending",
      action: "Refund",
      previousStatus,
      requestDate: formatEventDate()
    });

    const serialized = serializeOrder(order);

    if (global.io) {
      global.io.emit("order_updated", serialized);
      global.io.emit("cancellation_created", {
        id: cancellation._id.toString(),
        orderId: cancellation.orderId,
        customerName: cancellation.customerName,
        customerEmail: cancellation.customerEmail,
        reason: cancellation.reason,
        comments: cancellation.comments,
        status: cancellation.status,
        action: cancellation.action,
        requestDate: cancellation.requestDate
      });
    }

    res.status(200).json({
      success: true,
      message: "Cancellation request submitted successfully",
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
    order.paymentStatus = isOnlinePayment(order.paymentMethod) ? "Paid" : "Pending";
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

    const orderIds = orders.map(o => o._id);
    const returnRequests = await ReturnRequest.find({ order: { $in: orderIds } });
    const refundRequests = await RefundRequest.find({ order: { $in: orderIds } });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(order => {
        const orderReturns = returnRequests.filter(r => r.order.toString() === order._id.toString());
        const orderRefunds = refundRequests.filter(r => r.order.toString() === order._id.toString());
        return serializeOrder(order, orderReturns, orderRefunds);
      })
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
    if (status === "Cancelled" || status === "Refunded") {
      await restockOrderItems(updatedOrder);
    }
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
    const order = await Order.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { orderId: id },
        { transactionId: id }
      ].filter(Boolean)
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const updatedOrder = orchestrateTransition(order, "Refunded", adminName);
    await restockOrderItems(updatedOrder);
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
  const { shippingAddress, courierPartner, trackingId, deliveryDate } = req.body;
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
    if (courierPartner !== undefined) {
      order.courierPartner = courierPartner;
    }
    if (trackingId !== undefined) {
      order.trackingId = trackingId;
    }
    if (deliveryDate !== undefined) {
      order.deliveryDate = deliveryDate;
    }

    order.activityLogs.unshift({
      id: `act-${Date.now()}`,
      action: "Updated order shipping and delivery details",
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
      message: "Shipping and delivery details updated successfully",
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

const adminGetCancellations = async (req, res) => {
  try {
    const cancellations = await CancellationRequest.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      cancellations: cancellations.map(c => ({
        id: c._id.toString(),
        orderId: c.orderId,
        customerName: c.customerName,
        customerEmail: c.customerEmail,
        reason: c.reason,
        comments: c.comments,
        status: c.status,
        action: c.action,
        requestDate: c.requestDate
      }))
    });
  } catch (error) {
    console.error("Admin Get Cancellations Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching cancellation requests" });
  }
};

const adminApproveCancellation = async (req, res) => {
  const { id } = req.params;
  const adminName = req.admin ? req.admin.name : "Store Admin";

  try {
    const cancellation = await CancellationRequest.findById(id);
    if (!cancellation) {
      return res.status(404).json({ success: false, message: "Cancellation request not found" });
    }

    cancellation.status = "Approved";
    await cancellation.save();

    // Find the order
    const order = await Order.findOne({ orderId: cancellation.orderId });
    if (order) {
      // Transition order status to Cancelled and restock items
      const updatedOrder = orchestrateTransition(order, "Cancelled", adminName);
      await restockOrderItems(updatedOrder);
      await updatedOrder.save();

      // Create a Refund Request automatically
      const refund = await RefundRequest.create({
        order: order._id,
        orderId: order.orderId,
        amount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        reason: cancellation.reason,
        status: "Pending",
        requestDate: formatEventDate(),
        timeline: [
          { title: "Refund Initiated", timestamp: formatEventDate() }
        ]
      });

      if (global.io) {
        global.io.emit("order_updated", serializeOrder(updatedOrder));
        global.io.emit("refund_created", {
          id: refund._id.toString(),
          orderId: refund.orderId,
          amount: refund.amount,
          paymentMethod: refund.paymentMethod,
          reason: refund.reason,
          status: refund.status,
          requestDate: refund.requestDate,
          timeline: refund.timeline
        });
      }
    }

    const serializedCancellation = {
      id: cancellation._id.toString(),
      orderId: cancellation.orderId,
      customerName: cancellation.customerName,
      customerEmail: cancellation.customerEmail,
      reason: cancellation.reason,
      comments: cancellation.comments,
      status: cancellation.status,
      action: cancellation.action,
      requestDate: cancellation.requestDate
    };

    if (global.io) {
      global.io.emit("cancellation_updated", serializedCancellation);
    }

    res.status(200).json({
      success: true,
      message: "Cancellation request approved and refund initiated",
      cancellation: serializedCancellation
    });
  } catch (error) {
    console.error("Admin Approve Cancellation Error:", error);
    res.status(500).json({ success: false, message: "Server error while approving cancellation" });
  }
};

const adminRejectCancellation = async (req, res) => {
  const { id } = req.params;
  const adminName = req.admin ? req.admin.name : "Store Admin";

  try {
    const cancellation = await CancellationRequest.findById(id);
    if (!cancellation) {
      return res.status(404).json({ success: false, message: "Cancellation request not found" });
    }

    cancellation.status = "Rejected";
    await cancellation.save();

    // The order was never transitioned to Cancelled, so we just log a rejection activity and save the order
    const order = await Order.findOne({ orderId: cancellation.orderId });
    if (order) {
      // Revert the timeline to the normal flow since the cancellation was rejected
      const timeStr = order.date || formatEventDate();
      const isPaid = order.paymentStatus === "Paid";
      order.timeline = createInitialTimeline(timeStr, isPaid);
      
      // Update the timeline status based on the current order status
      const statusOrder = ["evt-payment", "evt-confirmed", "evt-dispatched", "evt-shipped", "evt-out-for-delivery", "evt-delivered"];
      let targetStepId = "";
      if (order.status === "Pending") {
        targetStepId = "evt-payment";
      } else if (order.status === "Confirmed" || order.status === "Processing") {
        targetStepId = "evt-confirmed";
      } else if (order.status === "Dispatched") {
        targetStepId = "evt-dispatched";
      } else if (order.status === "Shipped") {
        targetStepId = "evt-shipped";
      } else if (order.status === "Out For Delivery" || order.status === "Out for Delivery") {
        targetStepId = "evt-out-for-delivery";
      } else if (order.status === "Delivered") {
        targetStepId = "evt-delivered";
      }

      if (targetStepId) {
        const targetIndex = statusOrder.indexOf(targetStepId);
        order.timeline = order.timeline.map(event => {
          const eventIndex = statusOrder.indexOf(event.id);
          if (eventIndex < targetIndex) {
            return {
              ...event,
              status: "completed",
              timestamp: event.timestamp || timeStr
            };
          } else if (eventIndex === targetIndex) {
            return {
              ...event,
              status: "completed",
              timestamp: timeStr
            };
          } else if (eventIndex === targetIndex + 1) {
            return {
              ...event,
              status: "current",
              timestamp: ""
            };
          } else {
            return {
              ...event,
              status: "upcoming",
              timestamp: ""
            };
          }
        });
      }

      order.activityLogs.unshift({
        id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        action: "Cancellation Request Rejected by Admin",
        user: adminName,
        timestamp: new Date()
      });
      await order.save();

      if (global.io) {
        global.io.emit("order_updated", serializeOrder(order));
      }
    }

    const serializedCancellation = {
      id: cancellation._id.toString(),
      orderId: cancellation.orderId,
      customerName: cancellation.customerName,
      customerEmail: cancellation.customerEmail,
      reason: cancellation.reason,
      comments: cancellation.comments,
      status: cancellation.status,
      action: cancellation.action,
      requestDate: cancellation.requestDate
    };

    if (global.io) {
      global.io.emit("cancellation_updated", serializedCancellation);
    }

    res.status(200).json({
      success: true,
      message: "Cancellation request rejected",
      cancellation: serializedCancellation
    });
  } catch (error) {
    console.error("Admin Reject Cancellation Error:", error);
    res.status(500).json({ success: false, message: "Server error while rejecting cancellation" });
  }
};

const adminGetRefunds = async (req, res) => {
  try {
    const refunds = await RefundRequest.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      refunds: refunds.map(r => ({
        id: r._id.toString(),
        orderId: r.orderId,
        amount: r.amount,
        paymentMethod: r.paymentMethod,
        reason: r.reason,
        status: r.status,
        requestDate: r.requestDate,
        transactionId: r.transactionId,
        timeline: r.timeline
      }))
    });
  } catch (error) {
    console.error("Admin Get Refunds Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching refund requests" });
  }
};

const adminApproveRefund = async (req, res) => {
  const { id } = req.params;

  try {
    const refund = await RefundRequest.findById(id);
    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund request not found" });
    }

    refund.status = "Pending";
    if (!refund.timeline.some(t => t.title === "Approved by Merchant")) {
      refund.timeline.push({
        title: "Approved by Merchant",
        timestamp: formatEventDate()
      });
    }
    await refund.save();

    const serializedRefund = {
      id: refund._id.toString(),
      orderId: refund.orderId,
      amount: refund.amount,
      paymentMethod: refund.paymentMethod,
      reason: refund.reason,
      status: refund.status,
      requestDate: refund.requestDate,
      transactionId: refund.transactionId,
      timeline: refund.timeline
    };

    if (global.io) {
      global.io.emit("refund_updated", serializedRefund);
      const order = await Order.findOne({ orderId: refund.orderId });
      if (order) {
        const returnRequests = await ReturnRequest.find({ order: order._id });
        global.io.emit("order_updated", serializeOrder(order, returnRequests, [refund]));
      }
    }

    res.status(200).json({
      success: true,
      message: "Refund approved for gateway release",
      refund: serializedRefund
    });
  } catch (error) {
    console.error("Admin Approve Refund Error:", error);
    res.status(500).json({ success: false, message: "Server error while approving refund" });
  }
};

const adminRejectRefund = async (req, res) => {
  const { id } = req.params;

  try {
    const refund = await RefundRequest.findById(id);
    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund request not found" });
    }

    refund.status = "Failed";
    refund.timeline.push({
      title: "Refund Rejected",
      timestamp: formatEventDate()
    });
    await refund.save();

    const serializedRefund = {
      id: refund._id.toString(),
      orderId: refund.orderId,
      amount: refund.amount,
      paymentMethod: refund.paymentMethod,
      reason: refund.reason,
      status: refund.status,
      requestDate: refund.requestDate,
      transactionId: refund.transactionId,
      timeline: refund.timeline
    };

    if (global.io) {
      global.io.emit("refund_updated", serializedRefund);
      const order = await Order.findOne({ orderId: refund.orderId });
      if (order) {
        const returnRequests = await ReturnRequest.find({ order: order._id });
        global.io.emit("order_updated", serializeOrder(order, returnRequests, [refund]));
      }
    }

    res.status(200).json({
      success: true,
      message: "Refund request rejected",
      refund: serializedRefund
    });
  } catch (error) {
    console.error("Admin Reject Refund Error:", error);
    res.status(500).json({ success: false, message: "Server error while rejecting refund" });
  }
};

const adminProcessRefund = async (req, res) => {
  const { id } = req.params;
  const adminName = req.admin ? req.admin.name : "Store Admin";

  try {
    const refund = await RefundRequest.findById(id);
    if (!refund) {
      return res.status(404).json({ success: false, message: "Refund request not found" });
    }

    const transactionId = "RF" + Math.floor(10000000 + Math.random() * 90000000);
    refund.status = "Processed";
    refund.transactionId = transactionId;
    refund.timeline.push(
      { title: "Processed through Gateway", timestamp: formatEventDate() },
      { title: "Gateway Cleared", timestamp: formatEventDate() }
    );
    await refund.save();

    // Update the order payment status to Refunded
    const order = await Order.findOne({ orderId: refund.orderId });
    if (order) {
      order.paymentStatus = "Refunded";
      order.status = "Refunded";
      order.activityLogs.unshift({
        id: `act-${Date.now()}`,
        action: "Order Refund Processed",
        user: adminName,
        timestamp: new Date()
      });
      await order.save();

      if (global.io) {
        const returnRequests = await ReturnRequest.find({ order: order._id });
        global.io.emit("order_updated", serializeOrder(order, returnRequests, [refund]));
      }
    }

    const serializedRefund = {
      id: refund._id.toString(),
      orderId: refund.orderId,
      amount: refund.amount,
      paymentMethod: refund.paymentMethod,
      reason: refund.reason,
      status: refund.status,
      requestDate: refund.requestDate,
      transactionId: refund.transactionId,
      timeline: refund.timeline
    };

    if (global.io) {
      global.io.emit("refund_updated", serializedRefund);
    }

    res.status(200).json({
      success: true,
      message: "Refund processed successfully through payment gateway",
      refund: serializedRefund
    });
  } catch (error) {
    console.error("Admin Process Refund Error:", error);
    res.status(500).json({ success: false, message: "Server error while processing refund" });
  }
};

const createReturnRequest = async (req, res) => {
  const { id } = req.params;
  const { reason, productName, productPrice } = req.body;

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

    let returnRequest;
    const existing = await ReturnRequest.findOne({ order: order._id, productName });
    if (existing) {
      if (existing.status === "Pending" || existing.status === "Rejected") {
        existing.reason = reason || "No reason specified";
        existing.status = "Pending";
        existing.requestDate = formatEventDate();
        await existing.save();
        returnRequest = existing;
      } else {
        return res.status(400).json({ success: false, message: `Return request is already ${existing.status.toLowerCase()}` });
      }
    } else {
      returnRequest = await ReturnRequest.create({
        order: order._id,
        orderId: order.orderId,
        customerName: req.user.name || "Customer",
        customerEmail: req.user.email || `${(req.user.name || "customer").toLowerCase().replace(/\s+/g, "")}@example.com`,
        productName: productName || (order.items && order.items[0] ? order.items[0].name : "Unknown Product"),
        productPrice: Number(productPrice) || (order.items && order.items[0] ? order.items[0].price : order.totalAmount),
        reason: reason || "No reason specified",
        status: "Pending",
        requestDate: formatEventDate()
      });
    }

    const serialized = {
      id: returnRequest._id.toString(),
      orderId: returnRequest.orderId,
      customerName: returnRequest.customerName,
      customerEmail: returnRequest.customerEmail,
      reason: returnRequest.reason,
      productName: returnRequest.productName,
      productPrice: returnRequest.productPrice,
      status: returnRequest.status,
      requestDate: returnRequest.requestDate
    };

    if (global.io) {
      global.io.emit("return_created", serialized);
      global.io.emit("order_updated", serializeOrder(order, [returnRequest]));
    }

    res.status(existing ? 200 : 201).json({
      success: true,
      message: existing ? "Return request updated successfully" : "Return request created successfully",
      returnRequest: serialized
    });
  } catch (error) {
    console.error("Create Return Request Error:", error);
    res.status(500).json({ success: false, message: "Server error while creating return request" });
  }
};

const createReplacementRequest = async (req, res) => {
  const { id } = req.params;
  const { reason, originalProduct, replacementProduct } = req.body;

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

    let replacement;
    const existing = await ReplacementRequest.findOne({ order: order._id, originalProduct });
    if (existing) {
      if (existing.status === "Pending" || existing.status === "Rejected") {
        existing.reason = reason || "No reason specified";
        existing.status = "Pending";
        existing.replacementProduct = replacementProduct || originalProduct;
        existing.requestDate = formatEventDate();
        await existing.save();
        replacement = existing;
      } else {
        return res.status(400).json({ success: false, message: `Replacement request is already ${existing.status.toLowerCase()}` });
      }
    } else {
      replacement = await ReplacementRequest.create({
        order: order._id,
        originalOrderId: order.orderId,
        customerName: req.user.name || "Customer",
        customerEmail: req.user.email || `${(req.user.name || "customer").toLowerCase().replace(/\s+/g, "")}@example.com`,
        originalProduct: originalProduct || (order.items && order.items[0] ? order.items[0].name : "Unknown Product"),
        replacementProduct: replacementProduct || originalProduct || (order.items && order.items[0] ? order.items[0].name : "Unknown Product"),
        reason: reason || "No reason specified",
        status: "Pending",
        requestDate: formatEventDate()
      });
    }

    const serialized = {
      id: replacement._id.toString(),
      originalOrderId: replacement.originalOrderId,
      customerName: replacement.customerName,
      customerEmail: replacement.customerEmail,
      originalProduct: replacement.originalProduct,
      replacementProduct: replacement.replacementProduct,
      reason: replacement.reason,
      status: replacement.status,
      requestDate: replacement.requestDate,
      trackingNumber: replacement.trackingNumber
    };

    if (global.io) {
      global.io.emit("replacement_created", serialized);
    }

    res.status(existing ? 200 : 201).json({
      success: true,
      message: existing ? "Replacement request updated successfully" : "Replacement request created successfully",
      replacement: serialized
    });
  } catch (error) {
    console.error("Create Replacement Request Error:", error);
    res.status(500).json({ success: false, message: "Server error while creating replacement request" });
  }
};

const adminGetReturns = async (req, res) => {
  try {
    const returns = await ReturnRequest.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      returnRequests: returns.map(r => ({
        id: r._id.toString(),
        orderId: r.orderId,
        customerName: r.customerName,
        customerEmail: r.customerEmail,
        productName: r.productName,
        productPrice: r.productPrice,
        reason: r.reason,
        status: r.status,
        requestDate: r.requestDate
      }))
    });
  } catch (error) {
    console.error("Admin Get Returns Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching return requests" });
  }
};

const adminApproveReturn = async (req, res) => {
  const { id } = req.params;
  try {
    const returnReq = await ReturnRequest.findById(id);
    if (!returnReq) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }
    returnReq.status = "Approved";
    await returnReq.save();

    // Find the order
    const order = await Order.findById(returnReq.order);
    let refund = null;
    if (order) {
      // Create a Refund Request automatically
      refund = await RefundRequest.create({
        order: order._id,
        orderId: order.orderId,
        amount: returnReq.productPrice,
        paymentMethod: order.paymentMethod,
        reason: `Return Approved: ${returnReq.reason}`,
        status: "Pending",
        requestDate: formatEventDate(),
        timeline: [
          { title: "Refund Initiated", timestamp: formatEventDate() }
        ]
      });

      if (global.io) {
        global.io.emit("refund_created", {
          id: refund._id.toString(),
          orderId: refund.orderId,
          amount: refund.amount,
          paymentMethod: refund.paymentMethod,
          reason: refund.reason,
          status: refund.status,
          requestDate: refund.requestDate,
          timeline: refund.timeline
        });
      }
    }

    const serialized = {
      id: returnReq._id.toString(),
      orderId: returnReq.orderId,
      customerName: returnReq.customerName,
      customerEmail: returnReq.customerEmail,
      productName: returnReq.productName,
      productPrice: returnReq.productPrice,
      reason: returnReq.reason,
      status: returnReq.status,
      requestDate: returnReq.requestDate
    };

    if (global.io) {
      global.io.emit("return_updated", serialized);
      if (order) {
        global.io.emit("order_updated", serializeOrder(order, [returnReq], refund ? [refund] : []));
      }
    }

    res.status(200).json({ success: true, returnRequest: serialized });
  } catch (error) {
    console.error("Admin Approve Return Error:", error);
    res.status(500).json({ success: false, message: "Server error while approving return request" });
  }
};

const adminRejectReturn = async (req, res) => {
  const { id } = req.params;
  try {
    const returnReq = await ReturnRequest.findById(id);
    if (!returnReq) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }
    returnReq.status = "Rejected";
    await returnReq.save();

    const serialized = {
      id: returnReq._id.toString(),
      orderId: returnReq.orderId,
      customerName: returnReq.customerName,
      customerEmail: returnReq.customerEmail,
      productName: returnReq.productName,
      productPrice: returnReq.productPrice,
      reason: returnReq.reason,
      status: returnReq.status,
      requestDate: returnReq.requestDate
    };

    if (global.io) {
      global.io.emit("return_updated", serialized);
      const order = await Order.findById(returnReq.order);
      if (order) {
        global.io.emit("order_updated", serializeOrder(order, [returnReq]));
      }
    }

    res.status(200).json({ success: true, returnRequest: serialized });
  } catch (error) {
    console.error("Admin Reject Return Error:", error);
    res.status(500).json({ success: false, message: "Server error while rejecting return request" });
  }
};

const adminScheduleReturnPickup = async (req, res) => {
  const { id } = req.params;
  try {
    const returnReq = await ReturnRequest.findById(id);
    if (!returnReq) {
      return res.status(404).json({ success: false, message: "Return request not found" });
    }
    returnReq.status = "Pickup Scheduled";
    await returnReq.save();

    const serialized = {
      id: returnReq._id.toString(),
      orderId: returnReq.orderId,
      customerName: returnReq.customerName,
      customerEmail: returnReq.customerEmail,
      productName: returnReq.productName,
      productPrice: returnReq.productPrice,
      reason: returnReq.reason,
      status: returnReq.status,
      requestDate: returnReq.requestDate
    };

    if (global.io) {
      global.io.emit("return_updated", serialized);
      const order = await Order.findById(returnReq.order);
      if (order) {
        global.io.emit("order_updated", serializeOrder(order, [returnReq]));
      }
    }

    res.status(200).json({ success: true, returnRequest: serialized });
  } catch (error) {
    console.error("Admin Schedule Return Pickup Error:", error);
    res.status(500).json({ success: false, message: "Server error while scheduling return pickup" });
  }
};

const adminGetReplacements = async (req, res) => {
  try {
    const replacements = await ReplacementRequest.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      replacements: replacements.map(r => ({
        id: r._id.toString(),
        originalOrderId: r.originalOrderId,
        customerName: r.customerName,
        customerEmail: r.customerEmail,
        originalProduct: r.originalProduct,
        replacementProduct: r.replacementProduct,
        reason: r.reason,
        status: r.status,
        requestDate: r.requestDate,
        trackingNumber: r.trackingNumber
      }))
    });
  } catch (error) {
    console.error("Admin Get Replacements Error:", error);
    res.status(500).json({ success: false, message: "Server error while fetching replacement requests" });
  }
};

const adminApproveReplacement = async (req, res) => {
  const { id } = req.params;
  try {
    const replacement = await ReplacementRequest.findById(id);
    if (!replacement) {
      return res.status(404).json({ success: false, message: "Replacement request not found" });
    }
    replacement.status = "Approved";
    await replacement.save();

    const serialized = {
      id: replacement._id.toString(),
      originalOrderId: replacement.originalOrderId,
      customerName: replacement.customerName,
      customerEmail: replacement.customerEmail,
      originalProduct: replacement.originalProduct,
      replacementProduct: replacement.replacementProduct,
      reason: replacement.reason,
      status: replacement.status,
      requestDate: replacement.requestDate,
      trackingNumber: replacement.trackingNumber
    };

    if (global.io) {
      global.io.emit("replacement_updated", serialized);
    }

    res.status(200).json({ success: true, replacement: serialized });
  } catch (error) {
    console.error("Admin Approve Replacement Error:", error);
    res.status(500).json({ success: false, message: "Server error while approving replacement request" });
  }
};

const adminRejectReplacement = async (req, res) => {
  const { id } = req.params;
  try {
    const replacement = await ReplacementRequest.findById(id);
    if (!replacement) {
      return res.status(404).json({ success: false, message: "Replacement request not found" });
    }
    replacement.status = "Rejected";
    await replacement.save();

    const serialized = {
      id: replacement._id.toString(),
      originalOrderId: replacement.originalOrderId,
      customerName: replacement.customerName,
      customerEmail: replacement.customerEmail,
      originalProduct: replacement.originalProduct,
      replacementProduct: replacement.replacementProduct,
      reason: replacement.reason,
      status: replacement.status,
      requestDate: replacement.requestDate,
      trackingNumber: replacement.trackingNumber
    };

    if (global.io) {
      global.io.emit("replacement_updated", serialized);
    }

    res.status(200).json({ success: true, replacement: serialized });
  } catch (error) {
    console.error("Admin Reject Replacement Error:", error);
    res.status(500).json({ success: false, message: "Server error while rejecting replacement request" });
  }
};

const adminCreateReplacementOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const replacement = await ReplacementRequest.findById(id);
    if (!replacement) {
      return res.status(404).json({ success: false, message: "Replacement request not found" });
    }
    replacement.status = "Order Created";
    await replacement.save();

    const serialized = {
      id: replacement._id.toString(),
      originalOrderId: replacement.originalOrderId,
      customerName: replacement.customerName,
      customerEmail: replacement.customerEmail,
      originalProduct: replacement.originalProduct,
      replacementProduct: replacement.replacementProduct,
      reason: replacement.reason,
      status: replacement.status,
      requestDate: replacement.requestDate,
      trackingNumber: replacement.trackingNumber
    };

    if (global.io) {
      global.io.emit("replacement_updated", serialized);
    }

    res.status(200).json({ success: true, replacement: serialized });
  } catch (error) {
    console.error("Admin Create Replacement Order Error:", error);
    res.status(500).json({ success: false, message: "Server error while creating replacement order" });
  }
};

const adminGenerateReplacementShipment = async (req, res) => {
  const { id } = req.params;
  try {
    const replacement = await ReplacementRequest.findById(id);
    if (!replacement) {
      return res.status(404).json({ success: false, message: "Replacement request not found" });
    }
    const trackNum = `BD-${Math.floor(100000 + Math.random() * 900000)}-IND`;
    replacement.status = "Shipped";
    replacement.trackingNumber = trackNum;
    await replacement.save();

    const serialized = {
      id: replacement._id.toString(),
      originalOrderId: replacement.originalOrderId,
      customerName: replacement.customerName,
      customerEmail: replacement.customerEmail,
      originalProduct: replacement.originalProduct,
      replacementProduct: replacement.replacementProduct,
      reason: replacement.reason,
      status: replacement.status,
      requestDate: replacement.requestDate,
      trackingNumber: replacement.trackingNumber
    };

    if (global.io) {
      global.io.emit("replacement_updated", serialized);
    }

    res.status(200).json({ success: true, replacement: serialized });
  } catch (error) {
    console.error("Admin Generate Replacement Shipment Error:", error);
    res.status(500).json({ success: false, message: "Server error while generating replacement shipment" });
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
  adminGenerateReplacementShipment,
  serializeOrder
};
