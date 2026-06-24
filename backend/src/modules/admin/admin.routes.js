const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const { protect } = require("../../middleware/auth.middleware");
const { checkPermission } = require("../../middleware/permission.middleware");

// Public route for admin login
router.post("/login", adminController.login);

// Protected route to get the logged-in admin's profile
router.get("/me", protect, adminController.getMe);

// Protected routes to manage other admin accounts (requires roles & access permissions)
router.get(
  "/",
  protect,
  checkPermission("roles", "Role & Access Management", "view"),
  adminController.getAllAdmins
);

router.post(
  "/",
  protect,
  checkPermission("roles", "Role & Access Management", "create"),
  adminController.createAdmin
);

router.put(
  "/:id",
  protect,
  checkPermission("roles", "Role & Access Management", "edit"),
  adminController.updateAdmin
);

router.delete(
  "/:id",
  protect,
  checkPermission("roles", "Role & Access Management", "delete"),
  adminController.deleteAdmin
);

module.exports = router;
