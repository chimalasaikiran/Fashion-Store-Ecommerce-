const User = require("../models/User");
const Admin = require("../src/modules/admin/admin.model");
const Role = require("../src/modules/role/role.model");
const Order = require("../models/Order");
const ActivityLog = require("../models/ActivityLog");
const SystemSetting = require("../models/SystemSetting");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Helper: Map DB user/admin to unified frontend User interface
const mapToUnifiedUser = (doc, type, orderStats) => {
  const id = doc._id.toString();
  const stats = orderStats[id] || { count: 0, spent: 0 };

  if (type === "Customer") {
    let status = "Active";
    if (doc.isBlocked) {
      status = "Blocked";
    } else if (!doc.isVerified) {
      status = "Pending";
    }

    return {
      id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone || "",
      orders: stats.count,
      spent: stats.spent,
      status,
      role: "Customer",
      createdDate: doc.createdAt
        ? new Date(doc.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "N/A",
      blockReason: doc.blockReason || "",
      blockedAt: doc.blockedAt || null,
      notificationPreferences: doc.notificationPreferences || {},
    };
  } else {
    // Admin or Super Admin
    const roleName = doc.role && doc.role.name ? doc.role.name : "Admin";
    const status = doc.status === "Inactive" ? "Blocked" : "Active";

    return {
      id,
      name: doc.name,
      email: doc.email,
      phone: "",
      orders: 0,
      spent: 0,
      status,
      role: roleName,
      createdDate: doc.createdAt
        ? new Date(doc.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "N/A",
      blockReason: doc.blockReason || "",
      blockedAt: doc.blockedAt || null,
    };
  }
};

class UserController {
  // GET /api/users
  getAllUsers = async (req, res) => {
    try {
      const {
        search = "",
        status = "All",
        role = "All",
        sortBy = "name",
        sortOrder = "asc",
        page = 1,
        limit = 5,
      } = req.query;

      // 1. Fetch all completed/active order statistics to compute total spent & order count
      const ordersStats = await Order.aggregate([
        {
          $group: {
            _id: "$user",
            count: { $sum: 1 },
            spent: { $sum: "$totalAmount" },
          },
        },
      ]);

      const orderStatsMap = {};
      ordersStats.forEach((stat) => {
        if (stat._id) {
          orderStatsMap[stat._id.toString()] = {
            count: stat.count || 0,
            spent: stat.spent || 0,
          };
        }
      });

      // 2. Fetch Customers
      const customers = await User.find({});
      
      // 3. Fetch Admins
      const admins = await Admin.find({}).populate("role");

      // 4. Map both arrays
      const unifiedCustomers = customers.map((c) =>
        mapToUnifiedUser(c, "Customer", orderStatsMap)
      );
      const unifiedAdmins = admins.map((a) =>
        mapToUnifiedUser(a, "Admin", orderStatsMap)
      );

      // Combine both
      let combined = [...unifiedCustomers, ...unifiedAdmins];

      // 5. Apply filtering
      if (search) {
        const query = search.toLowerCase();
        combined = combined.filter(
          (u) =>
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.phone.includes(query) ||
            u.id.includes(query)
        );
      }

      if (status !== "All") {
        combined = combined.filter((u) => u.status === status);
      }

      if (role !== "All") {
        combined = combined.filter((u) => u.role === role);
      }

      // 6. Apply sorting
      combined.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        } else if (sortBy === "createdDate") {
          valA = new Date(a.createdDate).getTime();
          valB = new Date(b.createdDate).getTime();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      // 7. Apply pagination
      const totalItems = combined.length;
      const parsedPage = parseInt(page);
      const parsedLimit = parseInt(limit);
      const startIndex = (parsedPage - 1) * parsedLimit;
      const paginated = combined.slice(startIndex, startIndex + parsedLimit);

      res.status(200).json({
        success: true,
        data: paginated,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / parsedLimit) || 1,
          currentPage: parsedPage,
          itemsPerPage: parsedLimit,
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user list",
      });
    }
  };

  // GET /api/users/:id
  getUserById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid User ID format" });
      }

      let userDoc = await User.findById(id);
      let type = "Customer";

      if (!userDoc) {
        userDoc = await Admin.findById(id).populate("role");
        type = "Admin";
      }

      if (!userDoc) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Get order count and total spent
      const ordersStats = await Order.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: "$user",
            count: { $sum: 1 },
            spent: { $sum: "$totalAmount" },
          },
        },
      ]);

      const stats = ordersStats[0] || { count: 0, spent: 0 };
      const orderStatsMap = { [id]: stats };

      const unifiedUser = mapToUnifiedUser(userDoc, type, orderStatsMap);

      // Fetch actual orders history
      const orders = await Order.find({ user: id }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: {
          user: unifiedUser,
          orders,
        },
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user profile details",
      });
    }
  };

  // POST /api/users
  createUser = async (req, res) => {
    try {
      const { name, email, phone, role, status } = req.body;

      if (!name || !email) {
        return res.status(400).json({ success: false, message: "Name and email are required" });
      }

      // Check if email already in use
      const customerExists = await User.findOne({ email });
      const adminExists = await Admin.findOne({ email });
      if (customerExists || adminExists) {
        return res.status(400).json({ success: false, message: "Email is already in use" });
      }

      let createdDoc;
      let type = "Customer";

      // Temporary password for created users
      const tempPassword = "Password123!";

      if (role === "Customer") {
        createdDoc = await User.create({
          name,
          email,
          phone,
          password: tempPassword,
          isVerified: status === "Active",
          isBlocked: status === "Blocked",
          blockReason: status === "Blocked" ? "Blocked upon creation" : "",
          blockedAt: status === "Blocked" ? new Date() : null,
        });
      } else {
        type = "Admin";
        // Find role by name
        let roleDoc = await Role.findOne({ name: role });
        if (!roleDoc) {
          // Default to regular Admin if role not found
          roleDoc = await Role.findOne({ name: "Admin" });
        }

        if (!roleDoc) {
          return res.status(400).json({ success: false, message: `Specified role "${role}" does not exist` });
        }

        createdDoc = await Admin.create({
          name,
          email,
          password: tempPassword,
          role: roleDoc._id,
          status: status === "Blocked" ? "Inactive" : "Active",
          blockReason: status === "Blocked" ? "Blocked upon creation" : "",
          blockedAt: status === "Blocked" ? new Date() : null,
        });
      }

      const orderStatsMap = {};
      const unifiedUser = mapToUnifiedUser(createdDoc, type, orderStatsMap);

      // Log Activity
      await ActivityLog.create({
        userId: unifiedUser.id,
        userName: unifiedUser.name,
        action: `Created user account (${unifiedUser.role})`,
        category: "Profile",
        status: "Success",
        ipAddress: req.ip || "127.0.0.1",
        device: req.headers["user-agent"] || "Admin Panel",
      });

      res.status(201).json({
        success: true,
        message: "User account created successfully",
        data: unifiedUser,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create user account",
      });
    }
  };

  // PUT /api/users/:id
  updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, role, status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid User ID format" });
      }

      let customer = await User.findById(id);
      let admin = await Admin.findById(id);

      if (!customer && !admin) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      let updatedDoc;
      let type = "Customer";

      if (customer) {
        // If changing role from Customer to Admin/Super Admin
        if (role !== "Customer") {
          // Delete customer, create admin
          const roleDoc = await Role.findOne({ name: role }) || await Role.findOne({ name: "Admin" });
          
          await User.findByIdAndDelete(id);

          updatedDoc = await Admin.create({
            _id: id, // preserve ID
            name: name || customer.name,
            email: email || customer.email,
            password: customer.password, // preserve password hash
            role: roleDoc._id,
            status: status === "Blocked" ? "Inactive" : "Active",
            blockReason: status === "Blocked" ? "Blocked during role transition" : "",
            blockedAt: status === "Blocked" ? new Date() : null,
          });
          type = "Admin";
        } else {
          // Just update customer
          if (name) customer.name = name;
          if (email) customer.email = email;
          if (phone !== undefined) customer.phone = phone;
          if (status) {
            customer.isBlocked = status === "Blocked";
            if (customer.isBlocked) {
              customer.blockReason = customer.blockReason || "Blocked by Administrator";
              customer.blockedAt = customer.blockedAt || new Date();
            } else {
              customer.blockReason = "";
              customer.blockedAt = null;
              customer.isVerified = true; // verify if unblocking
            }
          }

          updatedDoc = await customer.save();
        }
      } else {
        // It's an Admin
        type = "Admin";
        if (role === "Customer") {
          // Delete admin, create customer
          await Admin.findByIdAndDelete(id);

          updatedDoc = await User.create({
            _id: id,
            name: name || admin.name,
            email: email || admin.email,
            phone: phone || "",
            password: admin.password,
            isVerified: true,
            isBlocked: status === "Blocked",
            blockReason: status === "Blocked" ? "Blocked during role transition" : "",
            blockedAt: status === "Blocked" ? new Date() : null,
          });
          type = "Customer";
        } else {
          // Update admin details
          if (name) admin.name = name;
          if (email) admin.email = email;
          
          // Role update
          const roleDoc = await Role.findOne({ name: role });
          if (roleDoc) {
            admin.role = roleDoc._id;
          }

          if (status) {
            admin.status = status === "Blocked" ? "Inactive" : "Active";
            if (admin.status === "Inactive") {
              admin.blockReason = admin.blockReason || "Blocked by Administrator";
              admin.blockedAt = admin.blockedAt || new Date();
            } else {
              admin.blockReason = "";
              admin.blockedAt = null;
            }
          }

          updatedDoc = await (await admin.save()).populate("role");
        }
      }

      const orderStatsMap = {};
      const unifiedUser = mapToUnifiedUser(updatedDoc, type, orderStatsMap);

      // Log Activity
      await ActivityLog.create({
        userId: unifiedUser.id,
        userName: unifiedUser.name,
        action: `Updated profile details (${unifiedUser.role})`,
        category: "Profile",
        status: "Success",
        ipAddress: req.ip || "127.0.0.1",
        device: req.headers["user-agent"] || "Admin Panel",
      });

      res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        data: unifiedUser,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update user profile",
      });
    }
  };

  // DELETE /api/users/:id
  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid User ID format" });
      }

      let deletedUser = await User.findByIdAndDelete(id);
      let type = "Customer";

      if (!deletedUser) {
        deletedUser = await Admin.findByIdAndDelete(id);
        type = "Admin";
      }

      if (!deletedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Log Activity
      await ActivityLog.create({
        userId: id,
        userName: deletedUser.name,
        action: `Deleted user account permanently (${type})`,
        category: "Security",
        status: "Success",
        ipAddress: req.ip || "127.0.0.1",
        device: req.headers["user-agent"] || "Admin Panel",
      });

      res.status(200).json({
        success: true,
        message: "User account permanently deleted",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete user account",
      });
    }
  };

  // POST /api/users/:id/block
  blockUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason || !reason.trim()) {
        return res.status(400).json({
          success: false,
          message: "A mandatory reason is required to block an account",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid User ID format" });
      }

      let customer = await User.findById(id);
      let admin = await Admin.findById(id);

      if (!customer && !admin) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      let updatedDoc;
      let type = "Customer";

      if (customer) {
        customer.isBlocked = true;
        customer.blockReason = reason;
        customer.blockedAt = new Date();
        updatedDoc = await customer.save();
      } else {
        type = "Admin";
        admin.status = "Inactive";
        admin.blockReason = reason;
        admin.blockedAt = new Date();
        updatedDoc = await (await admin.save()).populate("role");
      }

      const orderStatsMap = {};
      const unifiedUser = mapToUnifiedUser(updatedDoc, type, orderStatsMap);

      // Log Activity
      await ActivityLog.create({
        userId: unifiedUser.id,
        userName: unifiedUser.name,
        action: `Blocked user account: "${reason}"`,
        category: "Security",
        status: "Success",
        ipAddress: req.ip || "127.0.0.1",
        device: req.headers["user-agent"] || "Admin Panel",
      });

      res.status(200).json({
        success: true,
        message: "Account blocked successfully",
        data: unifiedUser,
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to block user account",
      });
    }
  };

  // POST /api/users/:id/unblock
  unblockUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body; // optional for unblocking, but can log

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid User ID format" });
      }

      let customer = await User.findById(id);
      let admin = await Admin.findById(id);

      if (!customer && !admin) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      let updatedDoc;
      let type = "Customer";
      const unblockReasonText = reason || "Unblocked by Administrator";

      if (customer) {
        customer.isBlocked = false;
        customer.blockReason = "";
        customer.blockedAt = null;
        customer.isVerified = true;
        updatedDoc = await customer.save();
      } else {
        type = "Admin";
        admin.status = "Active";
        admin.blockReason = "";
        admin.blockedAt = null;
        updatedDoc = await (await admin.save()).populate("role");
      }

      const orderStatsMap = {};
      const unifiedUser = mapToUnifiedUser(updatedDoc, type, orderStatsMap);

      // Log Activity
      await ActivityLog.create({
        userId: unifiedUser.id,
        userName: unifiedUser.name,
        action: `Unblocked user account: "${unblockReasonText}"`,
        category: "Security",
        status: "Success",
        ipAddress: req.ip || "127.0.0.1",
        device: req.headers["user-agent"] || "Admin Panel",
      });

      res.status(200).json({
        success: true,
        message: "Account unblocked successfully",
        data: unifiedUser,
      });
    } catch (error) {
      console.error("Error unblocking user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to unblock user account",
      });
    }
  };

  // GET /api/users/activity/logs
  getActivityLogs = async (req, res) => {
    try {
      const logs = await ActivityLog.find({}).sort({ timestamp: -1 });
      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      console.error("Error retrieving activity logs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch activity logs",
      });
    }
  };

  // GET /api/users/preferences/notifications
  getNotificationPreferences = async (req, res) => {
    try {
      let prefSetting = await SystemSetting.findOne({ key: "notification_preferences" });
      
      const defaultPref = {
        email: { orders: true, shipments: true, promotions: false, security: true },
        push: { orders: true, shipments: false, promotions: false, security: true },
        sms: { orders: false, shipments: false, promotions: false, security: true },
      };

      if (!prefSetting) {
        prefSetting = await SystemSetting.create({
          key: "notification_preferences",
          value: defaultPref,
        });
      }

      res.status(200).json({
        success: true,
        data: prefSetting.value,
      });
    } catch (error) {
      console.error("Error getting notification preferences:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch system notification preferences",
      });
    }
  };

  // PUT /api/users/preferences/notifications
  updateNotificationPreferences = async (req, res) => {
    try {
      const { email, push, sms } = req.body;

      if (!email || !push || !sms) {
        return res.status(400).json({
          success: false,
          message: "Invalid notification preferences structure",
        });
      }

      const updatedValue = { email, push, sms };

      let prefSetting = await SystemSetting.findOne({ key: "notification_preferences" });
      if (!prefSetting) {
        prefSetting = await SystemSetting.create({
          key: "notification_preferences",
          value: updatedValue,
        });
      } else {
        prefSetting.value = updatedValue;
        await prefSetting.save();
      }

      // Log administrative action
      await ActivityLog.create({
        userId: req.admin ? req.admin._id.toString() : "admin",
        userName: req.admin ? req.admin.name : "Admin",
        action: "Updated system notification preferences",
        category: "Security",
        status: "Success",
        ipAddress: req.ip || "127.0.0.1",
        device: req.headers["user-agent"] || "Admin Panel",
      });

      res.status(200).json({
        success: true,
        message: "System notification preferences updated successfully",
        data: prefSetting.value,
      });
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save system notification preferences",
      });
    }
  };
}

module.exports = new UserController();
