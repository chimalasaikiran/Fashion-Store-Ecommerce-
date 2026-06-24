const adminService = require("./admin.service");

class AdminController {
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password",
        });
      }

      const data = await adminService.login(email, password);
      res.status(200).json({
        success: true,
        message: "Login successful",
        data,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message || "Invalid credentials",
      });
    }
  };

  getMe = async (req, res, next) => {
    try {
      // req.admin is set by protect middleware
      res.status(200).json({
        success: true,
        data: req.admin,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve profile",
      });
    }
  };

  createAdmin = async (req, res, next) => {
    try {
      const creatorName = req.admin ? req.admin.name : "System";
      const admin = await adminService.createAdmin(req.body, creatorName);
      res.status(201).json({
        success: true,
        message: "Admin account created successfully",
        data: admin,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create admin account",
      });
    }
  };

  getAllAdmins = async (req, res, next) => {
    try {
      const admins = await adminService.getAllAdmins();
      res.status(200).json({
        success: true,
        data: admins,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch admins list",
      });
    }
  };

  updateAdmin = async (req, res, next) => {
    try {
      const modifierName = req.admin ? req.admin.name : "System";
      const admin = await adminService.updateAdmin(req.params.id, req.body, modifierName);
      res.status(200).json({
        success: true,
        message: "Admin account updated successfully",
        data: admin,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update admin account",
      });
    }
  };

  deleteAdmin = async (req, res, next) => {
    try {
      const deleterName = req.admin ? req.admin.name : "System";
      await adminService.deleteAdmin(req.params.id, deleterName);
      res.status(200).json({
        success: true,
        message: "Admin account deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete admin account",
      });
    }
  };
}

module.exports = new AdminController();
