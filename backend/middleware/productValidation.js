const validateReview = (req, res, next) => {
  const { name, rating, text } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ success: false, message: "Please provide a reviewer name" });
  }
  if (rating === undefined || typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5" });
  }

  if (!text || text.trim() === "") {
    return res.status(400).json({ success: false, message: "Review comment text is required" });
  }

  next();
};
const validateProductQuery = (req, res, next) => {
  const { minPrice, maxPrice, rating } = req.query;
  if (minPrice && isNaN(Number(minPrice))) {
    return res.status(400).json({ success: false, message: "minPrice must be a number" });
  }
  if (maxPrice && isNaN(Number(maxPrice))) {
    return res.status(400).json({ success: false, message: "maxPrice must be a number" });
  }
  if (rating && isNaN(Number(rating))) {
    return res.status(400).json({ success: false, message: "rating must be a number" });
  }
  next();
};
const validateProductCreate = (req, res, next) => {
  const { name, category, price, originalPrice, image, seller } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ success: false, message: "Product name is required" });
  }
  if (!category || category.trim() === "") {
    return res.status(400).json({ success: false, message: "Product category is required" });
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ success: false, message: "Price must be a non-negative number" });
  }
  if (originalPrice === undefined || isNaN(Number(originalPrice)) || Number(originalPrice) < 0) {
    return res.status(400).json({ success: false, message: "Original price must be a non-negative number" });
  }
  if (!image || image.trim() === "") {
    return res.status(400).json({ success: false, message: "Product primary thumbnail image is required" });
  }
  if (!seller || !seller.name || !seller.role || !seller.avatar) {
    return res.status(400).json({ success: false, message: "Complete seller info (name, role, avatar) is required" });
  }
  next();
};

module.exports = {
  validateReview,
  validateProductQuery,
  validateProductCreate,
};
