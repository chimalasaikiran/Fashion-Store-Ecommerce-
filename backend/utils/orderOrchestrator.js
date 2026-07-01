const TRANSITIONS = {
  "active": ["Pending", "Processing", "Cancelled"], 
  "Pending": ["Processing", "Cancelled"],
  "Processing": ["Dispatched", "Cancelled"],
  "Dispatched": ["Shipped", "Cancelled"],
  "Shipped": ["Out For Delivery", "Cancelled"],
  "Out For Delivery": ["Delivered", "Cancelled"],
  "Delivered": ["Refunded"], 
  "Cancelled": ["Pending", "Processing"], // Allow reverting if rejected
  "Refunded": [],
  "Confirmed": ["Packed", "Processing", "Dispatched", "Cancelled"],
  "Packed": ["Shipped", "Dispatched", "Cancelled"],
};

const STATUS_DESCRIPTIONS = {
  "Pending": "Order placed, awaiting confirmation.",
  "Processing": "Order confirmed, processing started.",
  "Dispatched": "Order packed and dispatched to courier.",
  "Shipped": "Order handed to courier and in transit.",
  "Out For Delivery": "Order package is out for delivery.",
  "Delivered": "Order successfully delivered.",
  "Cancelled": "Order has been cancelled.",
  "Refunded": "Order has been cancelled and payment refunded.",
};

const isValidTransition = (currentStatus, nextStatus) => {
  if (!currentStatus) return nextStatus === "Pending" || nextStatus === "active";
  
  // Allow transitions to Cancelled from anywhere except Delivered / Refunded
  if (nextStatus === "Cancelled") {
    return currentStatus !== "Delivered" && currentStatus !== "Refunded";
  }

  const allowed = TRANSITIONS[currentStatus];
  if (!allowed) return false;
  
  return allowed.includes(nextStatus);
};

const createInitialTimeline = (dateStr, isPaid = true) => {
  return [
    {
      id: "evt-payment",
      title: "User Paid",
      description: isPaid ? "Your payment has been successfully processed and cleared." : "Awaiting payment clearance.",
      timestamp: isPaid ? dateStr : "",
      status: isPaid ? "completed" : "current"
    },
    {
      id: "evt-confirmed",
      title: "Order Confirmed",
      description: isPaid ? "Your order has been confirmed by the store." : "Awaiting payment confirmation.",
      timestamp: "",
      status: isPaid ? "current" : "upcoming"
    },
    {
      id: "evt-dispatched",
      title: "Dispatched",
      description: "Your items have been packed and dispatched to our logistics partner.",
      timestamp: "",
      status: "upcoming"
    },
    {
      id: "evt-shipped",
      title: "Shipped",
      description: "Your package has been shipped and is on its way to you.",
      timestamp: "",
      status: "upcoming"
    },
    {
      id: "evt-out-for-delivery",
      title: "Out for Delivery",
      description: "Your package is out for delivery with the courier agent.",
      timestamp: "",
      status: "upcoming"
    },
    {
      id: "evt-delivered",
      title: "Delivered",
      description: "Your package has been delivered. Thank you for shopping with us!",
      timestamp: "",
      status: "upcoming"
    }
  ];
};

const formatEventDate = (date) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const d = date ? new Date(date) : new Date();
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

const orchestrateTransition = (order, nextStatus, actor = "Admin") => {
  if (!isValidTransition(order.status, nextStatus)) {
    throw new Error(`Invalid status transition from ${order.status} to ${nextStatus}`);
  }

  const timestampStr = formatEventDate();
  order.status = nextStatus;

  if (nextStatus === "Shipped") {
    order.deliveryStatus = "In Transit";
  } else if (nextStatus === "Delivered") {
    order.deliveryStatus = "Delivered";
    order.paymentStatus = "Paid"; 
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        item.status = "completed";
      });
    }
  } else if (nextStatus === "Cancelled") {
    order.deliveryStatus = "Cancelled";
    if (order.paymentStatus === "Pending") {
      order.paymentStatus = "Failed";
    }
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        item.status = "cancelled";
      });
    }
  } else if (nextStatus === "Refunded") {
    order.paymentStatus = "Refunded";
    order.deliveryStatus = "Cancelled";
    order.status = "Cancelled"; 
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        item.status = "cancelled";
      });
    }
  }

  // Handle Cancelled Timeline (append "Cancelled" to the end)
  if (nextStatus === "Cancelled" || nextStatus === "Refunded") {
    if (!order.timeline || order.timeline.length === 0 || (order.timeline.length === 1 && order.timeline[0].id === "evt-cancelled")) {
      order.timeline = createInitialTimeline(order.date || timestampStr, order.paymentStatus === "Paid");
    }

    const hasRequest = order.timeline.some(e => e.id === "evt-cancellation-requested");
    if (hasRequest) {
      order.timeline = order.timeline.map(e => {
        if (e.id === "evt-cancelled") {
          return {
            ...e,
            status: "completed",
            description: nextStatus === "Refunded" ? "Order has been cancelled and payment refunded." : "Order has been cancelled.",
            timestamp: timestampStr
          };
        }
        return e;
      });
    } else {
      order.timeline = order.timeline.filter(e => e.status === "completed" || e.status === "current");
      order.timeline = order.timeline.filter(e => e.id !== "evt-cancelled");
      order.timeline.push({
        id: "evt-cancelled",
        title: "Cancelled",
        description: nextStatus === "Refunded" ? "Order has been cancelled and payment refunded." : "Order has been cancelled.",
        timestamp: timestampStr,
        status: "completed"
      });
    }

    order.activityLogs.unshift({
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: nextStatus === "Refunded" ? "Order Refunded & Cancelled" : `Order Status changed to Cancelled`,
      user: actor,
      timestamp: new Date()
    });

    return order;
  }

  // Initialize timeline if not present
  if (!order.timeline || order.timeline.length === 0 || order.timeline.some(e => e.id === "evt-cancelled")) {
    order.timeline = createInitialTimeline(order.date || timestampStr, order.paymentStatus === "Paid");
  }

  // Update timeline for normal flow
  const statusOrder = ["evt-payment", "evt-confirmed", "evt-dispatched", "evt-shipped", "evt-out-for-delivery", "evt-delivered"];
  let targetStepId = "";
  if (nextStatus === "Pending") {
    targetStepId = "evt-payment";
  } else if (nextStatus === "Confirmed" || nextStatus === "Processing") {
    targetStepId = "evt-confirmed";
  } else if (nextStatus === "Dispatched") {
    targetStepId = "evt-dispatched";
  } else if (nextStatus === "Shipped") {
    targetStepId = "evt-shipped";
  } else if (nextStatus === "Out For Delivery" || nextStatus === "Out for Delivery") {
    targetStepId = "evt-out-for-delivery";
  } else if (nextStatus === "Delivered") {
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
          timestamp: event.timestamp || timestampStr
        };
      } else if (eventIndex === targetIndex) {
        return {
          ...event,
          status: "completed",
          timestamp: timestampStr
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

  // Ensure payment event is marked completed if paid
  if (order.paymentStatus === "Paid") {
    order.timeline = order.timeline.map(event => {
      if (event.id === "evt-payment") {
        return {
          ...event,
          status: "completed",
          timestamp: event.timestamp || timestampStr,
          description: "Your payment has been successfully processed and cleared."
        };
      }
      return event;
    });
  }

  order.activityLogs.unshift({
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action: `Order Status changed to ${nextStatus}`,
    user: actor,
    timestamp: new Date()
  });

  return order;
};

module.exports = {
  isValidTransition,
  createInitialTimeline,
  orchestrateTransition,
  formatEventDate
};
