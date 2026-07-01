const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");
const Order = require("../models/Order");
const { formatEventDate, createInitialTimeline } = require("../utils/orderOrchestrator");
const { serializeOrder } = require("./orderController");

// Helper to sync order timeline and status based on shipment updates
const updateOrderTimelineAndStatus = (order, targetStatus, courier, trackingId, estDeliveryDate) => {
  order.status = targetStatus;
  if (courier) order.courierPartner = courier;
  if (trackingId) order.trackingId = trackingId;
  if (estDeliveryDate) order.deliveryDate = estDeliveryDate;

  const timestampStr = formatEventDate();
  
  // Ensure timeline is initialized
  if (!order.timeline || order.timeline.length === 0) {
    order.timeline = createInitialTimeline(order.date || timestampStr, order.paymentStatus === "Paid");
  }

  // Add Shipment Created event if it doesn't exist
  const hasShipmentEvent = order.timeline.some(e => e.id === "evt-shipment-created");
  if (!hasShipmentEvent) {
    const confirmedIndex = order.timeline.findIndex(e => e.id === "evt-confirmed");
    const newEvent = {
      id: "evt-shipment-created",
      title: "Shipment Created",
      description: `Your shipment has been created. Courier: ${courier || order.courierPartner || "Delhivery"}`,
      timestamp: timestampStr,
      status: "completed"
    };
    if (confirmedIndex !== -1) {
      order.timeline.splice(confirmedIndex + 1, 0, newEvent);
    } else {
      order.timeline.push(newEvent);
    }
  }

  // Map targetStatus to timeline event IDs
  const statusToEventId = {
    "Dispatched": "evt-dispatched",
    "Shipped": "evt-shipped",
    "Out For Delivery": "evt-out-for-delivery",
    "Delivered": "evt-delivered"
  };

  const targetEventId = statusToEventId[targetStatus];
  if (targetEventId) {
    const standardIds = ["evt-payment", "evt-confirmed", "evt-shipment-created", "evt-dispatched", "evt-shipped", "evt-out-for-delivery", "evt-delivered"];
    const targetIdx = standardIds.indexOf(targetEventId);

    order.timeline = order.timeline.map(evt => {
      if (evt.id === targetEventId) {
        return {
          ...evt,
          status: "completed",
          timestamp: evt.timestamp || timestampStr
        };
      }
      const currentIdx = standardIds.indexOf(evt.id);
      if (currentIdx !== -1 && currentIdx < targetIdx) {
        return {
          ...evt,
          status: "completed",
          timestamp: evt.timestamp || timestampStr
        };
      }
      return evt;
    });
  }

  if (targetStatus === "Delivered") {
    order.deliveryStatus = "Delivered";
    order.paymentStatus = "Paid";
    if (order.items) {
      order.items.forEach(item => {
        item.status = "completed";
      });
    }
  } else if (targetStatus === "Shipped") {
    order.deliveryStatus = "In Transit";
  }

  order.activityLogs.unshift({
    id: `act-${Date.now()}`,
    action: `Shipment status updated: Order status set to ${targetStatus}`,
    user: "System",
    timestamp: new Date()
  });
};

// Map shipment status to order status
const mapShipmentStatusToOrderStatus = (shipmentStatus) => {
  switch (shipmentStatus) {
    case "Draft":
      return "Pending";
    case "Ready to Ship":
      return "Confirmed";
    case "Dispatched":
      return "Dispatched";
    case "In Transit":
      return "Shipped";
    case "Delivered":
      return "Delivered";
    case "Delayed":
      return "Processing";
    default:
      return "Processing";
  }
};

// @desc    Get all shipments
// @route   GET /api/shipments
// @access  Private/Admin
const getShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({}).sort({ createdAt: -1 });
    
    // Map database shipments to match the frontend Shipment interface
    const mapped = shipments.map(s => ({
      id: s.shipmentId,
      orderId: s.orderId,
      customerName: s.customerName,
      customerEmail: s.customerEmail,
      shippingAddress: s.shippingAddress,
      courier: s.courier,
      shippingMethod: s.shippingMethod,
      packageSummary: s.packageSummary,
      shippingCost: s.shippingCost,
      trackingNumber: s.trackingNumber,
      labelGenerated: s.labelGenerated,
      status: s.status,
      dispatchDate: s.dispatchDate,
      estDeliveryDate: s.estDeliveryDate
    }));

    res.status(200).json({
      success: true,
      count: mapped.length,
      shipments: mapped
    });
  } catch (error) {
    console.error("Get Shipments Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching shipments" });
  }
};

// @desc    Create a shipment
// @route   POST /api/shipments
// @access  Private/Admin
const createShipment = async (req, res) => {
  const {
    orderId,
    customerName,
    customerEmail,
    shippingAddress,
    courier,
    shippingMethod,
    packageSummary,
    shippingCost,
    status,
    dispatchDate,
    estDeliveryDate
  } = req.body;

  try {
    // Find the corresponding order by orderId or _id
    const order = await Order.findOne({
      $or: [
        { orderId },
        { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null }
      ].filter(Boolean)
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const shipmentId = `SH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = status === "Draft" ? "" : `DLV-${Math.floor(100000 + Math.random() * 900000)}-IND`;
    const labelGenerated = status !== "Draft";

    const shipment = await Shipment.create({
      shipmentId,
      orderId: order.orderId,
      order: order._id,
      customerName,
      customerEmail,
      shippingAddress,
      courier,
      shippingMethod,
      packageSummary,
      shippingCost,
      trackingNumber,
      labelGenerated,
      status,
      dispatchDate,
      estDeliveryDate
    });

    // Update order with shipment details if not Draft
    if (status !== "Draft") {
      const orderStatus = mapShipmentStatusToOrderStatus(status);
      updateOrderTimelineAndStatus(order, orderStatus, courier, trackingNumber, estDeliveryDate);
      await order.save();
      
      if (global.io) {
        global.io.emit("order_updated", serializeOrder(order));
      }
    }

    const responseData = {
      id: shipment.shipmentId,
      orderId: shipment.orderId,
      customerName: shipment.customerName,
      customerEmail: shipment.customerEmail,
      shippingAddress: shipment.shippingAddress,
      courier: shipment.courier,
      shippingMethod: shipment.shippingMethod,
      packageSummary: shipment.packageSummary,
      shippingCost: shipment.shippingCost,
      trackingNumber: shipment.trackingNumber,
      labelGenerated: shipment.labelGenerated,
      status: shipment.status,
      dispatchDate: shipment.dispatchDate,
      estDeliveryDate: shipment.estDeliveryDate
    };

    if (global.io) {
      global.io.emit("shipment_created", responseData);
    }

    res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      shipment: responseData
    });
  } catch (error) {
    console.error("Create Shipment Error:", error);
    res.status(500).json({ success: false, message: "Server error creating shipment" });
  }
};

// @desc    Update shipment status or tracking details
// @route   PUT /api/shipments/:id
// @access  Private/Admin
const updateShipment = async (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;

  try {
    const shipment = await Shipment.findOne({ shipmentId: id });
    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    shipment.status = status || shipment.status;
    if (trackingNumber !== undefined) {
      shipment.trackingNumber = trackingNumber;
    }

    // If status is updated to something other than Draft, make sure it has a tracking number
    if (shipment.status !== "Draft" && !shipment.trackingNumber) {
      shipment.trackingNumber = `DLV-${Math.floor(100000 + Math.random() * 900000)}-IND`;
      shipment.labelGenerated = true;
    }

    await shipment.save();

    // Sync corresponding order
    const order = await Order.findById(shipment.order);
    if (order) {
      const orderStatus = mapShipmentStatusToOrderStatus(shipment.status);
      updateOrderTimelineAndStatus(order, orderStatus, shipment.courier, shipment.trackingNumber, shipment.estDeliveryDate);
      await order.save();

      if (global.io) {
        global.io.emit("order_updated", serializeOrder(order));
      }
    }

    const responseData = {
      id: shipment.shipmentId,
      orderId: shipment.orderId,
      customerName: shipment.customerName,
      customerEmail: shipment.customerEmail,
      shippingAddress: shipment.shippingAddress,
      courier: shipment.courier,
      shippingMethod: shipment.shippingMethod,
      packageSummary: shipment.packageSummary,
      shippingCost: shipment.shippingCost,
      trackingNumber: shipment.trackingNumber,
      labelGenerated: shipment.labelGenerated,
      status: shipment.status,
      dispatchDate: shipment.dispatchDate,
      estDeliveryDate: shipment.estDeliveryDate
    };

    if (global.io) {
      global.io.emit("shipment_updated", responseData);
    }

    res.status(200).json({
      success: true,
      message: "Shipment updated successfully",
      shipment: responseData
    });
  } catch (error) {
    console.error("Update Shipment Error:", error);
    res.status(500).json({ success: false, message: "Server error updating shipment" });
  }
};

// @desc    Generate shipping label
// @route   PUT /api/shipments/:id/label
// @access  Private/Admin
const generateShippingLabel = async (req, res) => {
  const { id } = req.params;

  try {
    const shipment = await Shipment.findOne({ shipmentId: id });
    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    if (!shipment.trackingNumber) {
      shipment.trackingNumber = `DLV-${Math.floor(100000 + Math.random() * 900000)}-IND`;
    }
    shipment.labelGenerated = true;
    if (shipment.status === "Draft") {
      shipment.status = "Ready to Ship";
    }

    await shipment.save();

    // Sync corresponding order
    const order = await Order.findById(shipment.order);
    if (order) {
      const orderStatus = mapShipmentStatusToOrderStatus(shipment.status);
      updateOrderTimelineAndStatus(order, orderStatus, shipment.courier, shipment.trackingNumber, shipment.estDeliveryDate);
      await order.save();

      if (global.io) {
        global.io.emit("order_updated", serializeOrder(order));
      }
    }

    const responseData = {
      id: shipment.shipmentId,
      orderId: shipment.orderId,
      customerName: shipment.customerName,
      customerEmail: shipment.customerEmail,
      shippingAddress: shipment.shippingAddress,
      courier: shipment.courier,
      shippingMethod: shipment.shippingMethod,
      packageSummary: shipment.packageSummary,
      shippingCost: shipment.shippingCost,
      trackingNumber: shipment.trackingNumber,
      labelGenerated: shipment.labelGenerated,
      status: shipment.status,
      dispatchDate: shipment.dispatchDate,
      estDeliveryDate: shipment.estDeliveryDate
    };

    if (global.io) {
      global.io.emit("shipment_updated", responseData);
    }

    res.status(200).json({
      success: true,
      message: "Shipping label generated successfully",
      shipment: responseData
    });
  } catch (error) {
    console.error("Generate Label Error:", error);
    res.status(500).json({ success: false, message: "Server error generating shipping label" });
  }
};

// @desc    Delete shipment record
// @route   DELETE /api/shipments/:id
// @access  Private/Admin
const deleteShipment = async (req, res) => {
  const { id } = req.params;

  try {
    const shipment = await Shipment.findOneAndDelete({ shipmentId: id });
    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    // Clear tracking details from corresponding order
    const order = await Order.findById(shipment.order);
    if (order) {
      order.trackingId = "";
      order.courierPartner = "";
      
      // Remove shipment created timeline event
      if (order.timeline) {
        order.timeline = order.timeline.filter(e => e.id !== "evt-shipment-created");
      }
      
      await order.save();

      if (global.io) {
        global.io.emit("order_updated", serializeOrder(order));
      }
    }

    if (global.io) {
      global.io.emit("shipment_deleted", { id });
    }

    res.status(200).json({
      success: true,
      message: "Shipment deleted successfully"
    });
  } catch (error) {
    console.error("Delete Shipment Error:", error);
    res.status(500).json({ success: false, message: "Server error deleting shipment" });
  }
};

module.exports = {
  getShipments,
  createShipment,
  updateShipment,
  generateShippingLabel,
  deleteShipment
};
