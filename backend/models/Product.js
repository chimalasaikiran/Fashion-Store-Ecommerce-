const mongoose = require("mongoose");

const ColorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  hex: {
    type: String,
    required: true,
    trim: true,
  },
});

const SellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    required: true,
    trim: true,
  },
});

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      required: [true, "Please add an original price"],
      min: [0, "Original price cannot be negative"],
    },
    rating: {
      type: String,
      default: "0.0",
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: [true, "Please add a primary product image"],
    },
    gallery: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    defaultSize: {
      type: String,
      default: "",
    },
    colors: {
      type: [ColorSchema],
      default: [],
    },
    defaultColor: {
      type: String,
      default: "",
    },
    seller: {
      type: SellerSchema,
      required: [true, "Please add seller information"],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      default: 10,
      min: [0, "Stock cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", ProductSchema);
