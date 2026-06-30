require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Review = require("../models/Review");

const SEED_PRODUCTS = [
  {
    name: "Brown Coat",
    category: "Coats",
    price: 75.0,
    originalPrice: 150.0,
    rating: "4.8",
    reviewsCount: 3,
    image: "fashion_portrait_3_1781014096781.png",
    gallery: [
      "fashion_portrait_3_1781014096781.png",
      "brown_coat_pose1.png",
      "brown_coat_pose2.png",
      "brown_coat_pose3.png",
      "brown_coat_pose4.png"
    ],
    sizes: ["S", "M", "L", "XL", "XXL", "XXXL"],
    defaultSize: "M",
    colors: [
      { name: "Brown", hex: "#5A3825" },
      { name: "Beige", hex: "#DFBAA7" },
      { name: "Tan", hex: "#C28B59" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "White", hex: "#EDEDED" }
    ],
    defaultColor: "Brown",
    seller: {
      name: "Leslie Alexander",
      role: "Manager",
      avatar: "seller_avatar.png"
    },
    isFeatured: true,
    stock: 15
  },
  {
    name: "Classy White Shirt",
    category: "Shirts",
    price: 70.0,
    originalPrice: 100.0,
    rating: "4.7",
    reviewsCount: 1,
    image: "fashion_portrait_5_1781014303170.png",
    gallery: [
      "fashion_portrait_5_1781014303170.png"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    defaultSize: "M",
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" }
    ],
    defaultColor: "White",
    seller: {
      name: "Jenny Wilson",
      role: "Sales Executive",
      avatar: "jenny_avatar.png"
    },
    stock: 10
  },
  {
    name: "Light Brown Sweater",
    category: "Sweaters",
    price: 63.0,
    originalPrice: 70.0,
    rating: "4.7",
    reviewsCount: 1,
    image: "fashion_portrait_1_1781014071035.png",
    gallery: [
      "fashion_portrait_1_1781014071035.png"
    ],
    sizes: ["S", "M", "L", "XL"],
    defaultSize: "M",
    colors: [
      { name: "Light Brown", hex: "#DFBAA7" }
    ],
    defaultColor: "Light Brown",
    seller: {
      name: "Leslie Alexander",
      role: "Manager",
      avatar: "seller_avatar.png"
    },
    stock: 8
  },
  {
    name: "Classy Light Coat",
    category: "Coats",
    price: 165.0,
    originalPrice: 220.0,
    rating: "4.9",
    reviewsCount: 1,
    image: "fashion_portrait_2_1781014083606.png",
    gallery: [
      "fashion_portrait_2_1781014083606.png"
    ],
    sizes: ["S", "M", "L", "XL"],
    defaultSize: "M",
    colors: [
      { name: "Beige", hex: "#DFBAA7" }
    ],
    defaultColor: "Beige",
    seller: {
      name: "Leslie Alexander",
      role: "Manager",
      avatar: "seller_avatar.png"
    },
    stock: 12
  },
  {
    name: "Brown Dress",
    category: "Dress",
    price: 90.0,
    originalPrice: 100.0,
    rating: "4.8",
    reviewsCount: 1,
    image: "fashion_portrait_4_1781014289331.png",
    gallery: [
      "fashion_portrait_4_1781014289331.png"
    ],
    sizes: ["S", "M", "L"],
    defaultSize: "S",
    colors: [
      { name: "Brown", hex: "#5A3825" }
    ],
    defaultColor: "Brown",
    seller: {
      name: "Leslie Alexander",
      role: "Manager",
      avatar: "seller_avatar.png"
    },
    stock: 5
  },
  {
    name: "Chic Leather Jacket",
    category: "Jackets",
    price: 140.0,
    originalPrice: 200.0,
    rating: "4.8",
    reviewsCount: 1,
    image: "fashion_portrait_6_1781014316459.png",
    gallery: [
      "fashion_portrait_6_1781014316459.png"
    ],
    sizes: ["M", "L", "XL"],
    defaultSize: "L",
    colors: [
      { name: "Black", hex: "#1A1A1A" }
    ],
    defaultColor: "Black",
    seller: {
      name: "Jenny Wilson",
      role: "Sales Executive",
      avatar: "jenny_avatar.png"
    },
    stock: 20
  },
  {
    name: "Classic Fedora Trench",
    category: "Coats",
    price: 85.0,
    originalPrice: 170.0,
    rating: "4.7",
    reviewsCount: 0,
    image: "fashion_portrait_3_1781014096781.png",
    gallery: [
      "fashion_portrait_3_1781014096781.png"
    ],
    sizes: ["S", "M", "L", "XL"],
    defaultSize: "M",
    colors: [
      { name: "Brown", hex: "#5A3825" }
    ],
    defaultColor: "Brown",
    seller: {
      name: "Leslie Alexander",
      role: "Manager",
      avatar: "seller_avatar.png"
    },
    stock: 7
  },
  {
    name: "Dark Yellow Sweater",
    category: "Sweaters",
    price: 45.0,
    originalPrice: 90.0,
    rating: "4.8",
    reviewsCount: 0,
    image: "fashion_portrait_1_1781014071035.png",
    gallery: [
      "fashion_portrait_1_1781014071035.png"
    ],
    sizes: ["S", "M", "L"],
    defaultSize: "M",
    colors: [
      { name: "Yellow", hex: "#C27B3A" }
    ],
    defaultColor: "Yellow",
    seller: {
      name: "Leslie Alexander",
      role: "Manager",
      avatar: "seller_avatar.png"
    },
    stock: 14
  },
  {
    name: "Classic Black Shirt",
    category: "Shirt",
    price: 45.0,
    originalPrice: 50.0,
    rating: "5.0",
    reviewsCount: 0,
    image: "fashion_portrait_5_1781014303170.png",
    gallery: [
      "fashion_portrait_5_1781014303170.png"
    ],
    sizes: ["S", "M", "L"],
    defaultSize: "M",
    colors: [
      { name: "Black", hex: "#000000" }
    ],
    defaultColor: "Black",
    seller: {
      name: "Jenny Wilson",
      role: "Sales Executive",
      avatar: "jenny_avatar.png"
    },
    stock: 0
  },
  {
    name: "Modern Party Dress",
    category: "Dress",
    price: 80.0,
    originalPrice: 100.0,
    rating: "5.0",
    reviewsCount: 0,
    image: "fashion_portrait_4_1781014289331.png",
    gallery: [
      "fashion_portrait_4_1781014289331.png"
    ],
    sizes: ["S", "M", "L"],
    defaultSize: "S",
    colors: [
      { name: "Black", hex: "#000000" }
    ],
    defaultColor: "Black",
    seller: {
      name: "Leslie Alexander",
      role: "Manager",
      avatar: "seller_avatar.png"
    },
    stock: 6
  }
];

const SEED_REVIEWS = [
  {
    productName: "Brown Coat",
    name: "Leslie Alexander",
    avatar: "leslie_avatar.png",
    verified: true,
    rating: 5.0,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt"
  },
  {
    productName: "Brown Coat",
    name: "Jenny Wilson",
    avatar: "jenny_avatar.png",
    verified: true,
    rating: 5.0,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
    images: ["review_hat_girl.png", "review_hat_girl.png"]
  },
  {
    productName: "Brown Coat",
    name: "Courtney Henry",
    avatar: "seller_avatar.png",
    verified: true,
    rating: 4.8,
    text: "This coat exceeded my expectations! The wool blend is thick and premium, fitting perfectly. The brown color is rich and elegant."
  },
  {
    productName: "Classy White Shirt",
    name: "Albert Flores",
    avatar: "fashion_portrait_6_1781014316459.png",
    verified: false,
    rating: 4.5,
    text: "Very cozy shirt, looks wonderful with turtle necks. Only minor issue was shipping took a couple of extra days, but customer support was very helpful."
  },
  {
    productName: "Light Brown Sweater",
    name: "Kristin Watson",
    avatar: "fashion_portrait_4_1781014289331.png",
    verified: true,
    rating: 5.0,
    text: "Exceptional quality. Soft lining and perfect sizing. Exactly what I wanted for the autumn weather!"
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is missing from .env");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected. Seeding database...");

    
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log("Cleared existing Products and Reviews.");

    
    const createdProducts = await Product.insertMany(SEED_PRODUCTS);
    console.log(`Seeded ${createdProducts.length} Products.`);

    
    const reviewsToInsert = [];
    for (const rev of SEED_REVIEWS) {
      const dbProduct = createdProducts.find(p => p.name === rev.productName);
      if (dbProduct) {
        reviewsToInsert.push({
          product: dbProduct._id,
          name: rev.name,
          avatar: rev.avatar,
          verified: rev.verified,
          rating: rev.rating,
          text: rev.text,
          images: rev.images || []
        });
      }
    }

    const createdReviews = await Review.insertMany(reviewsToInsert);
    console.log(`Seeded ${createdReviews.length} Reviews.`);

    
    console.log("Calculating average ratings and counts...");
    for (const prod of createdProducts) {
      await Review.getAverageRating(prod._id);
    }
    console.log("Calculated ratings successfully.");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedDB();
