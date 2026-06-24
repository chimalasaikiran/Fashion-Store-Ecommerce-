const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../src/middleware/auth.middleware");
const { checkPermission } = require("../src/middleware/permission.middleware");

// Unified User List
router.get(
  "/",
  protect,
  checkPermission("customers", "User List", "view"),
  userController.getAllUsers
);

router.post(
  "/",
  protect,
  checkPermission("customers", "User List", "create"),
  userController.createUser
);

// Global Notification Preferences (placed above id routes to prevent matching as params)
router.get(
  "/preferences/notifications",
  protect,
  checkPermission("customers", "Notification Preferences", "view"),
  userController.getNotificationPreferences
);

router.put(
  "/preferences/notifications",
  protect,
  checkPermission("customers", "Notification Preferences", "edit"),
  userController.updateNotificationPreferences
);

// Unified Activity Logs
router.get(
  "/activity/logs",
  protect,
  checkPermission("customers", "Activity Log", "view"),
  userController.getActivityLogs
);

// User Detail and Modifiers
router.get(
  "/:id",
  protect,
  checkPermission("customers", "User Details", "view"),
  userController.getUserById
);

router.put(
  "/:id",
  protect,
  checkPermission("customers", "User Details", "edit"),
  userController.updateUser
);

router.delete(
  "/:id",
  protect,
  checkPermission("customers", "User Details", "delete"),
  userController.deleteUser
);

router.post(
  "/:id/block",
  protect,
  checkPermission("customers", "User Details", "edit"),
  userController.blockUser
);

router.post(
  "/:id/unblock",
  protect,
  checkPermission("customers", "User Details", "edit"),
  userController.unblockUser
);

module.exports = router;
