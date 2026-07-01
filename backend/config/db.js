const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");

const seedProductsAndCategories = async () => {
  try {
    const defaultCategories = [
      { name: "Men", description: "Men's fashion and clothing" },
      { name: "Women", description: "Women's fashion and clothing" },
      { name: "Kids", description: "Kids' clothing and toys" },
      { name: "Shoes", description: "Footwear for men, women, and kids" },
      { name: "Accessories", description: "Bags, watches, sunglasses, and more" },
      { name: "Electronics", description: "Gadgets, devices, and accessories" }
    ];

    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log(`[Seed] Created category: ${cat.name}`);
      }
    }

    // Map existing product categories:
    const categoryMapping = {
      "Coats": "Women",
      "Jackets": "Women",
      "Sweaters": "Women",
      "Dress": "Women",
      "Shirts": "Men",
      "Shirt": "Men"
    };

    for (const [oldCat, newCat] of Object.entries(categoryMapping)) {
      const res = await Product.updateMany({ category: oldCat }, { category: newCat });
      if (res.modifiedCount > 0) {
        console.log(`[Migration] Updated ${res.modifiedCount} products from category "${oldCat}" to "${newCat}"`);
      }
    }
  } catch (error) {
    console.error(`[Seed/Migration Error] Failed to seed/migrate: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedProductsAndCategories();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
