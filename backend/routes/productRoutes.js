const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  getProductReviews,
  createProductReview,
} = require("../controllers/productController");
const {
  validateReview,
  validateProductQuery,
  validateProductCreate,
} = require("../middleware/productValidation");
const { protect } = require("../src/middleware/auth.middleware");
const { checkPermission } = require("../src/middleware/permission.middleware");

router.route("/")
  .get(validateProductQuery, getProducts)
  .post(protect, checkPermission("products", "Product List", "create"), validateProductCreate, createProduct);

router.route("/:id")
  .get(getProductById);

router.route("/:id/reviews")
  .get(getProductReviews)
  .post(validateReview, createProductReview);

module.exports = router;
