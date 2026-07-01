const Order = require("../models/Order");

const getPaymentLogs = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "email name").sort({ createdAt: -1 });
    
    const transactions = orders.map(order => {
      const amount = order.totalAmount || 0;
      const tax = Number((amount * 0.18).toFixed(2)); // 18% GST simulation
      
      let status = "PENDING";
      if (order.paymentStatus === "Paid") status = "SUCCESS";
      else if (order.paymentStatus === "Failed") status = "FAILED";
      else if (order.paymentStatus === "Refunded") status = "REFUNDED";

      let method = order.paymentMethod || "Wallet";
      let methodDetail = "Standard";
      
      const m = method.toLowerCase();
      if (m === "wallet") {
        method = "Wallet";
        methodDetail = "Wallet Account";
      } else if (m === "cash" || m === "cod") {
        method = "COD";
        methodDetail = "Cash on Delivery";
      } else if (m === "paypal") {
        method = "PayPal";
        methodDetail = "PayPal Account";
      } else if (m === "applepay") {
        method = "Apple Pay";
        methodDetail = "Apple Pay Wallet";
      } else if (m === "googlepay") {
        method = "Google Pay";
        methodDetail = "Google Pay Wallet";
      } else {
        // Visa or card
        method = "Card";
        methodDetail = "Visa ending in 4242";
      }

      const billingStr = order.billingAddress 
        ? `${order.billingAddress.name || order.customerName}, ${order.billingAddress.street}, ${order.billingAddress.city}, ${order.billingAddress.state || ''} ${order.billingAddress.zip}, ${order.billingAddress.country}`
        : (order.shippingAddress 
            ? `${order.shippingAddress.name || order.customerName}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zip}, ${order.shippingAddress.country}`
            : "N/A");

      return {
        id: order.transactionId || `TXN-${order._id}`,
        orderId: order.orderId,
        customerName: order.customerName || (order.user && order.user.name) || "Customer",
        customerEmail: (order.user && order.user.email) || `${(order.customerName || "customer").toLowerCase().replace(/\s+/g, '')}@example.com`,
        amount,
        tax,
        method,
        methodDetail,
        status,
        date: order.createdAt || new Date(),
        billingAddress: billingStr,
        gateway: method === "Wallet" ? "Wallet Gateway" : method === "COD" ? "Cash on Delivery" : "Razorpay Gateway",
        referenceId: order.transactionId || `ref_${order._id}`
      };
    });

    res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error("Get Payment Logs Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching payment logs" });
  }
};

module.exports = {
  getPaymentLogs
};
