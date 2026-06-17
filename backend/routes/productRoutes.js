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

router.route("/")
  .get(validateProductQuery, getProducts)
  .post(validateProductCreate, createProduct);

router.route("/:id")
  .get(getProductById);

router.route("/:id/reviews")
  .get(getProductReviews)
  .post(validateReview, createProductReview);

module.exports = router;
