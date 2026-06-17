const Product = require("../models/Product");
const Review = require("../models/Review");


const getImageUrl = (req, filename) => {
  if (!filename) return "";
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  
  const cleanFilename = filename.split("/").pop();
  const host = req.get("host");
  const protocol = req.protocol;
  return `${protocol}://${host}/images/${cleanFilename}`;
};




const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, color, size, search } = req.query;
    let query = {};

    
    if (category) {
      const filterCat = category.toLowerCase();
      if (filterCat === "women") {
        query.category = { $in: ["Coats", "Dresses", "Sweaters", "Jackets", "Dress"] };
      } else if (filterCat === "men") {
        query.category = { $in: ["Shirts", "Shirt", "Jackets", "Coats"] };
      } else if (filterCat === "t-shirts") {
        query.category = { $in: ["Shirts", "Shirt", "T-Shirts"] };
      } else if (filterCat === "handbags") {
        query.category = { $in: ["Handbags", "Bags"] };
      } else {
        
        query.category = { $regex: new RegExp(`^${category}$`, "i") };
      }
    }

    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    
    if (color) {
      query["colors.name"] = { $regex: new RegExp(`^${color}$`, "i") };
    }

    
    if (size) {
      query.sizes = size.toUpperCase();
    }

    
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ name: searchRegex }, { category: searchRegex }];
    }

    let products = await Product.find(query);

    
    const formattedProducts = products.map((prod) => {
      const p = prod.toObject();
      p.id = p._id.toString(); 
      p.image = getImageUrl(req, p.image);
      if (p.gallery) {
        p.gallery = p.gallery.map((img) => getImageUrl(req, img));
      }
      if (p.seller && p.seller.avatar) {
        p.seller.avatar = getImageUrl(req, p.seller.avatar);
      }
      return p;
    });

    res.status(200).json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching products" });
  }
};




const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const p = product.toObject();
    p.id = p._id.toString();
    p.image = getImageUrl(req, p.image);
    if (p.gallery) {
      p.gallery = p.gallery.map((img) => getImageUrl(req, img));
    }
    if (p.seller && p.seller.avatar) {
      p.seller.avatar = getImageUrl(req, p.seller.avatar);
    }

    res.status(200).json({
      success: true,
      product: p,
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(500).json({ success: false, message: "Server error fetching product details" });
  }
};




const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, message: "Server error creating product" });
  }
};




const getProductReviews = async (req, res) => {
  try {
    
    const productExists = await Product.exists({ _id: req.params.id });
    if (!productExists) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 });

    const formattedReviews = reviews.map((rev) => {
      const r = rev.toJSON(); 
      r.id = r._id.toString();
      if (r.avatar) {
        r.avatar = getImageUrl(req, r.avatar);
      }
      if (r.images) {
        r.images = r.images.map((img) => getImageUrl(req, img));
      }
      return r;
    });

    res.status(200).json({
      success: true,
      count: formattedReviews.length,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("Get Product Reviews Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching reviews" });
  }
};




const createProductReview = async (req, res) => {
  try {
    const { name, avatar, verified, rating, text, images } = req.body;
    const productId = req.params.id;

    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const review = await Review.create({
      product: productId,
      name,
      avatar: avatar || "seller_avatar.png", 
      verified: verified !== undefined ? verified : true,
      rating,
      text,
      images: images || [],
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully!",
      review,
    });
  } catch (error) {
    console.error("Create Product Review Error:", error);
    res.status(500).json({ success: false, message: "Server error creating review" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  getProductReviews,
  createProductReview,
};
