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
      status: "active",
      date: formatOrderDate(now),
      deliveryDate: formatDeliveryDate(delivery),
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
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
      orders,
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
      order,
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

    if (order.status === "completed") {
      return res.status(400).json({ success: false, message: "Completed orders cannot be cancelled" });
    }

    
    order.status = "cancelled";
    order.items.forEach((item) => {
      item.status = "cancelled";
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ success: false, message: "Server error while cancelling order" });
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

    
    order.status = "active";
    order.items.forEach((item) => {
      item.status = "active";
    });

    
    const now = new Date();
    const delivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    order.date = formatOrderDate(now);
    order.deliveryDate = formatDeliveryDate(delivery);
    order.items.forEach((item) => {
      item.deliveryDate = formatDeliveryDate(delivery);
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Reordered successfully! Restored to Active Orders.",
      order,
    });
  } catch (error) {
    console.error("Reorder Error:", error);
    res.status(500).json({ success: false, message: "Server error while reordering" });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  reorder,
};
