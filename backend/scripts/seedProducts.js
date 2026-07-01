require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Review = require("../models/Review");

const SEED_PRODUCTS = [
  {
    name: "Brown Coat",
    category: "Women",
    price: 75.0,
    originalPrice: 150.0,
    sku: "COAT-BRN-01",
    cost: 37.5,
    status: "Live",
    description: "Elegant brown wool blend coat featuring a double-breasted button closure, structured shoulders, and side flap pockets. Perfect for smart-casual winter layering.",
    seoTitle: "Premium Brown Wool Coat | Fashion Store",
    seoDescription: "Shop our premium brown wool blend coat. Double-breasted, warm, and elegant. Perfect for winter styling.",
    reorderLevel: 5,
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
    category: "Men",
    price: 70.0,
    originalPrice: 100.0,
    sku: "SHIRT-WHT-02",
    cost: 35.0,
    status: "Live",
    description: "A timeless, crisp white button-down shirt crafted from 100% breathable organic cotton. Featuring a classic collar, buttoned cuffs, and a tailored fit.",
    seoTitle: "Classy White Cotton Shirt | Fashion Store",
    seoDescription: "Timeless white button-down shirt crafted from organic cotton. Perfect for formal or smart-casual wear.",
    reorderLevel: 5,
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
    category: "Women",
    price: 63.0,
    originalPrice: 70.0,
    sku: "SWT-LBRN-03",
    cost: 30.0,
    status: "Live",
    description: "Cozy light brown knit sweater made from a premium wool-acrylic blend. Features a classic crew neckline and ribbed cuffs/hem for a relaxed yet polished look.",
    seoTitle: "Cozy Light Brown Knit Sweater | Fashion Store",
    seoDescription: "Stay warm with our light brown crewneck sweater. Knitted with premium wool blend for maximum comfort.",
    reorderLevel: 5,
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
    category: "Women",
    price: 165.0,
    originalPrice: 220.0,
    sku: "COAT-LGT-04",
    cost: 80.0,
    status: "Live",
    description: "Minimalist light beige overcoat designed with a clean silhouette, notched lapels, and a single-button closure. Offers lightweight warmth for spring and autumn.",
    seoTitle: "Minimalist Light Beige Overcoat | Fashion Store",
    seoDescription: "Clean, minimalist light beige overcoat. Notched lapels and single-button closure. Lightweight warmth.",
    reorderLevel: 3,
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
    category: "Women",
    price: 90.0,
    originalPrice: 100.0,
    sku: "DRS-BRN-05",
    cost: 45.0,
    status: "Live",
    description: "Charming A-line brown midi dress featuring a cinched waist, flowing skirt, and a subtle V-neckline. Elegant and versatile for day-to-night transitions.",
    seoTitle: "Elegant Brown Midi Dress | Fashion Store",
    seoDescription: "Charming A-line brown midi dress. Cinched waist and flowing skirt. Perfect for day-to-night styling.",
    reorderLevel: 4,
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
    category: "Women",
    price: 140.0,
    originalPrice: 200.0,
    sku: "JKT-LTH-06",
    cost: 70.0,
    status: "Live",
    description: "Edgy black motorcycle jacket made from premium faux leather. Features asymmetrical zip closure, silver-tone hardware, and zippered cuffs.",
    seoTitle: "Black Faux Leather Moto Jacket | Fashion Store",
    seoDescription: "Edgy black motorcycle jacket in premium faux leather. Asymmetrical zip closure and silver hardware.",
    reorderLevel: 5,
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
    category: "Women",
    price: 85.0,
    originalPrice: 170.0,
    sku: "COAT-FED-07",
    cost: 42.5,
    status: "Live",
    description: "Classic double-breasted trench coat in deep brown, styled with a waist belt, storm flaps, and adjustable cuff straps. A true wardrobe staple.",
    seoTitle: "Classic Double-Breasted Trench Coat | Fashion Store",
    seoDescription: "Classic double-breasted trench coat with waist belt and storm flaps. Timeless styling in deep brown.",
    reorderLevel: 3,
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
    category: "Women",
    price: 45.0,
    originalPrice: 90.0,
    sku: "SWT-YLW-08",
    cost: 22.5,
    status: "Live",
    description: "Vibrant mustard yellow cable-knit sweater made from soft acrylic yarn. Features a relaxed slouchy fit, crew neck, and drop shoulders.",
    seoTitle: "Mustard Yellow Cable-Knit Sweater | Fashion Store",
    seoDescription: "Vibrant mustard yellow cable-knit sweater. Soft acrylic yarn, relaxed slouchy fit, and crew neck.",
    reorderLevel: 5,
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
    category: "Men",
    price: 45.0,
    originalPrice: 50.0,
    sku: "SHIRT-BLK-09",
    cost: 22.5,
    status: "Draft",
    description: "Sleek and versatile black button-down shirt in a slim-fit cut. Made from stretch-cotton blend for comfortable daily wear.",
    seoTitle: "Slim-Fit Black Cotton Shirt | Fashion Store",
    seoDescription: "Sleek and versatile black button-down shirt. Slim-fit stretch-cotton blend. Classic daily wear.",
    reorderLevel: 5,
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
    category: "Women",
    price: 80.0,
    originalPrice: 100.0,
    sku: "DRS-PRT-10",
    cost: 40.0,
    status: "Live",
    description: "Stunning black cocktail dress featuring a fitted bodice, sweetheart neckline, and a flirty pleated skirt. Made for memorable evenings.",
    seoTitle: "Black Sweetheart Cocktail Dress | Fashion Store",
    seoDescription: "Stunning black cocktail dress with sweetheart neckline and pleated skirt. Perfect for evening parties.",
    reorderLevel: 3,
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
