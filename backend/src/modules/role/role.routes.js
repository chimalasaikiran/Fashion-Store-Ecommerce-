const express = require("express");
const router = express.Router();
const roleController = require("./role.controller");
const { protect } = require("../../middleware/auth.middleware");
const { checkPermission } = require("../../middleware/permission.middleware");
const { validateRoleCreate, validateRoleUpdate } = require("./role.validation");

// All role routes require authentication
router.use(protect);

// Retrieve all roles
router.get(
  "/",
  checkPermission("roles", "Role & Access Management", "view"),
  roleController.getAllRoles
);

// Retrieve a single role
router.get(
  "/:id",
  checkPermission("roles", "Role & Access Management", "view"),
  roleController.getRoleById
);

// Create a new role (requires roles:create permission)
router.post(
  "/",
  checkPermission("roles", "Role & Access Management", "create"),
  validateRoleCreate,
  roleController.createRole
);

// Update a role's permissions or details (requires roles:edit permission)
router.put(
  "/:id",
  checkPermission("roles", "Role & Access Management", "edit"),
  validateRoleUpdate,
  roleController.updateRole
);

// Delete a role (requires roles:delete permission)
router.delete(
  "/:id",
  checkPermission("roles", "Role & Access Management", "delete"),
  roleController.deleteRole
);

module.exports = router;
