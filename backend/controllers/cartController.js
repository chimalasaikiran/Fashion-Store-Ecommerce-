const User = require("../models/User");

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, userId: user._id.toString(), cart: user.cart || [] });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error retrieving cart" });
  }
};

const syncCart = async (req, res) => {
  try {
    const { cart } = req.body;
    if (!Array.isArray(cart)) {
      return res.status(400).json({ success: false, message: "Cart must be an array of items" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.cart = cart;
    await user.save();

    // Emit real-time socket event
    if (global.io) {
      console.log(`[Socket Cart] Emitting cart_updated_${req.user.id}`);
      global.io.emit(`cart_updated_${req.user.id}`, user.cart);
    }

    res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    console.error("Sync Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error synchronizing cart" });
  }
};

module.exports = {
  getCart,
  syncCart,
};
