const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect } = require("../src/middleware/auth.middleware");

router.route("/")
  .get(getCategories)
  .post(protect, createCategory);

router.route("/:id")
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

module.exports = router;
