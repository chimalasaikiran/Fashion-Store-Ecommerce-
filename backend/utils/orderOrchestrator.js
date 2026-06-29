const TRANSITIONS = {
  "active": ["Pending", "Processing", "Cancelled"], 
  "Pending": ["Processing", "Cancelled"],
  "Processing": ["Dispatched", "Cancelled"],
  "Dispatched": ["Shipped"],
  "Shipped": ["Out For Delivery"],
  "Out For Delivery": ["Delivered"],
  "Delivered": ["Refunded"], 
  "Cancelled": [],
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
  
  "Confirmed": "Order has been confirmed by the store.",
  "Packed": "Order has been packed and is ready for dispatch.",
};


const isValidTransition = (currentStatus, nextStatus) => {
  if (!currentStatus) return nextStatus === "Pending" || nextStatus === "active";
  
  const allowed = TRANSITIONS[currentStatus];
  if (!allowed) return false;
  
  return allowed.includes(nextStatus);
};


const createInitialTimeline = (dateStr, isPaid = true) => {
  return [
    {
      id: "evt-placed",
      title: "Order Placed",
      description: "Your order has been placed successfully.",
      timestamp: dateStr,
      status: "completed"
    },
    {
      id: "evt-payment",
      title: "Payment Successful",
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
      id: "evt-processing",
      title: "Processing Started",
      description: "The store has started processing your items.",
      timestamp: "",
      status: "upcoming"
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
      title: "Out For Delivery",
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


const formatEventDate = () => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const d = new Date();
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

  
  if (!order.timeline || order.timeline.length === 0) {
    order.timeline = createInitialTimeline(order.date || timestampStr, order.paymentStatus === "Paid");
  }

  order.timeline = order.timeline.map(event => {
    
    if (nextStatus === "Processing") {
      if (event.id === "evt-confirmed") {
        return { ...event, status: "completed", timestamp: event.timestamp || timestampStr, description: "Your order has been confirmed by the store." };
      }
      if (event.id === "evt-processing") {
        return { ...event, status: "completed", timestamp: timestampStr, description: "The store has started processing your items." };
      }
      if (event.id === "evt-dispatched") {
        return { ...event, status: "current" };
      }
    }
    
    
    if (nextStatus === "Dispatched") {
      if (["evt-confirmed", "evt-processing"].includes(event.id)) {
        return { ...event, status: "completed", timestamp: event.timestamp || timestampStr };
      }
      if (event.id === "evt-dispatched") {
        return { ...event, status: "completed", timestamp: timestampStr, description: "Your items have been packed and dispatched to our logistics partner." };
      }
      if (event.id === "evt-shipped") {
        return { ...event, status: "current" };
      }
    }
    
    
    if (nextStatus === "Shipped") {
      if (["evt-confirmed", "evt-processing", "evt-dispatched"].includes(event.id)) {
        return { ...event, status: "completed", timestamp: event.timestamp || timestampStr };
      }
      if (event.id === "evt-shipped") {
        return { ...event, status: "completed", timestamp: timestampStr, description: "Your package has been shipped and is on its way to you." };
      }
      if (event.id === "evt-out-for-delivery") {
        return { ...event, status: "current" };
      }
    }
    
    
    if (nextStatus === "Out For Delivery") {
      if (["evt-confirmed", "evt-processing", "evt-dispatched", "evt-shipped"].includes(event.id)) {
        return { ...event, status: "completed", timestamp: event.timestamp || timestampStr };
      }
      if (event.id === "evt-out-for-delivery") {
        return { ...event, status: "completed", timestamp: timestampStr, description: "Your package is out for delivery with the courier agent." };
      }
      if (event.id === "evt-delivered") {
        return { ...event, status: "current" };
      }
    }
    
    
    if (nextStatus === "Delivered") {
      if (["evt-confirmed", "evt-processing", "evt-dispatched", "evt-shipped", "evt-out-for-delivery"].includes(event.id)) {
        return { ...event, status: "completed", timestamp: event.timestamp || timestampStr };
      }
      if (event.id === "evt-delivered") {
        return { ...event, status: "completed", timestamp: timestampStr, description: "Your package has been delivered. Thank you for shopping with us!" };
      }
    }

    
    if (nextStatus === "Cancelled" || nextStatus === "Refunded") {
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

  
  if (nextStatus === "Cancelled" || nextStatus === "Refunded") {
    order.timeline.push({
      id: `evt-${Date.now()}`,
      title: nextStatus === "Refunded" ? "Order Refunded" : "Order Cancelled",
      description: STATUS_DESCRIPTIONS[nextStatus],
      timestamp: timestampStr,
      status: "completed"
    });
  }

  
  order.activityLogs.unshift({
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action: nextStatus === "Refunded" ? "Order Refunded & Cancelled" : `Order Status changed to ${nextStatus}`,
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
