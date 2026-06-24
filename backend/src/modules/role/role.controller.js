const roleService = require("./role.service");

class RoleController {
  createRole = async (req, res, next) => {
    try {
      const creatorName = req.admin ? req.admin.name : "System";
      const role = await roleService.createRole(req.body, creatorName);
      res.status(201).json({
        success: true,
        message: "Role created successfully",
        data: role,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "A role with this name already exists",
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create role",
      });
    }
  };

  getAllRoles = async (req, res, next) => {
    try {
      const roles = await roleService.getAllRoles();
      res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch roles",
      });
    }
  };

  getRoleById = async (req, res, next) => {
    try {
      const role = await roleService.getRoleById(req.params.id);
      if (!role) {
        return res.status(404).json({
          success: false,
          message: "Role not found",
        });
      }
      res.status(200).json({
        success: true,
        data: role,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch role",
      });
    }
  };

  updateRole = async (req, res, next) => {
    try {
      const modifierName = req.admin ? req.admin.name : "System";
      const role = await roleService.updateRole(req.params.id, req.body, modifierName);
      res.status(200).json({
        success: true,
        message: "Role updated successfully",
        data: role,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "A role with this name already exists",
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update role",
      });
    }
  };

  deleteRole = async (req, res, next) => {
    try {
      const deleterName = req.admin ? req.admin.name : "System";
      await roleService.deleteRole(req.params.id, deleterName);
      res.status(200).json({
        success: true,
        message: "Role deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete role",
      });
    }
  };
}

module.exports = new RoleController();
