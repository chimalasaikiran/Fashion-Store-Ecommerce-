const mongoose = require("mongoose");

const validateOrderCreate = (req, res, next) => {
  const { phone, paymentMethod, items, totalAmount } = req.body;

  if (!phone || phone.trim() === "") {
    return res.status(400).json({ success: false, message: "Please provide a customer phone number" });
  }

  if (!paymentMethod || paymentMethod.trim() === "") {
    return res.status(400).json({ success: false, message: "Please provide a payment method" });
  }

  if (totalAmount === undefined || isNaN(Number(totalAmount)) || Number(totalAmount) < 0) {
    return res.status(400).json({ success: false, message: "Total amount must be a non-negative number" });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Order must contain at least one item" });
  }

  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const { product, name, category, price, originalPrice, quantity, size, color, image } = item;

    if (!product || !mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} must have a valid product reference (ID)`,
      });
    }

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} must have a product name`,
      });
    }

    if (!category || category.trim() === "") {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} must have a category`,
      });
    }

    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} must have a non-negative price`,
      });
    }

    if (originalPrice === undefined || isNaN(Number(originalPrice)) || Number(originalPrice) < 0) {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} must have a non-negative original price`,
      });
    }

    if (quantity === undefined || isNaN(Number(quantity)) || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} must have a quantity of at least 1`,
      });
    }

    if (!size || size.trim() === "") {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} must specify a size`,
      });
    }

    if (!color || color.trim() === "") {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} must specify a color`,
      });
    }

    if (image === undefined || image === null) {
      return res.status(400).json({
        success: false,
        message: `Item at index ${i} must have an image reference`,
      });
    }
  }

  next();
};

module.exports = {
  validateOrderCreate,
};
