const express = require("express");
const router = express.Router();
const roleController = require("./role.controller");
const { protect } = require("../../middleware/auth.middleware");
const { checkPermission } = require("../../middleware/permission.middleware");
const { validateRoleCreate, validateRoleUpdate } = require("./role.validation");


router.use(protect);


router.get(
  "/",
  checkPermission("roles", "Role & Access Management", "view"),
  roleController.getAllRoles
);


router.get(
  "/:id",
  checkPermission("roles", "Role & Access Management", "view"),
  roleController.getRoleById
);


router.post(
  "/",
  checkPermission("roles", "Role & Access Management", "create"),
  validateRoleCreate,
  roleController.createRole
);


router.put(
  "/:id",
  checkPermission("roles", "Role & Access Management", "edit"),
  validateRoleUpdate,
  roleController.updateRole
);


router.delete(
  "/:id",
  checkPermission("roles", "Role & Access Management", "delete"),
  roleController.deleteRole
);

module.exports = router;
