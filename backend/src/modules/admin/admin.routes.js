const express = require("express");
const router = express.Router();
const adminController = require("./admin.controller");
const { protect } = require("../../middleware/auth.middleware");
const { checkPermission } = require("../../middleware/permission.middleware");


router.post("/login", adminController.login);


router.get("/me", protect, adminController.getMe);


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
