const Admin = require("./admin.model");
const Role = require("../role/role.model");
const AuditLog = require("../audit/audit.model");
const jwt = require("jsonwebtoken");

const createAuditLog = async (action, details, user) => {
  try {
    await AuditLog.create({ action, details, user: user || "System" });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
};

class AdminService {
  generateToken(id, roleName, permissions) {
    return jwt.sign({ id, role: roleName, permissions }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "30d",
    });
  }

  async login(email, password) {
    const admin = await Admin.findOne({ email }).populate("role");
    if (!admin) {
      throw new Error("Invalid email or password");
    }

    if (admin.status === "Inactive") {
      throw new Error("Account is deactivated. Please contact Super Admin.");
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = this.generateToken(admin._id, admin.role?.name, admin.role?.permissions);

    return {
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        lastLogin: admin.lastLogin,
      },
      token,
    };
  }

  async createAdmin(adminData, creatorName) {
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      throw new Error("An admin account with this email already exists");
    }

    // Verify role exists
    const roleExists = await Role.findById(adminData.role);
    if (!roleExists) {
      throw new Error("Assigned role does not exist");
    }

    const admin = await Admin.create(adminData);
    const populatedAdmin = await Admin.findById(admin._id).populate("role");

    await createAuditLog(
      "Assign Role",
      `Created new admin: ${admin.name} with role: ${roleExists.name}`,
      creatorName
    );

    return populatedAdmin;
  }

  async getAllAdmins() {
    return await Admin.find({}).populate("role", "name description permissions status");
  }

  async getAdminById(id) {
    return await Admin.findById(id).populate("role");
  }

  async updateAdmin(id, updateData, modifierName) {
    const adminBefore = await Admin.findById(id).populate("role");
    if (!adminBefore) {
      throw new Error("Admin account not found");
    }

    // If role is being changed, verify the new role exists
    let roleNameBefore = adminBefore.role.name;
    let roleNameAfter = roleNameBefore;
    if (updateData.role && updateData.role.toString() !== adminBefore.role._id.toString()) {
      const newRole = await Role.findById(updateData.role);
      if (!newRole) {
        throw new Error("New assigned role does not exist");
      }
      roleNameAfter = newRole.name;
    }

    // Protect last active Super Admin from deactivation or role change to prevent system lockout
    if (adminBefore.role.name === "Super Admin" && (updateData.status === "Inactive" || (updateData.role && roleNameAfter !== "Super Admin"))) {
      const superAdminCount = await Admin.countDocuments({
        role: adminBefore.role._id,
        status: "Active",
      });
      if (superAdminCount <= 1) {
        throw new Error("Cannot deactivate or demote the only active Super Admin");
      }
    }

    const admin = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("role");

    // Formulate descriptive audit details
    let details = `Updated admin profile: ${admin.name}`;
    if (roleNameBefore !== roleNameAfter) {
      details = `Changed role for admin ${admin.name} from ${roleNameBefore} to ${roleNameAfter}`;
    } else if (updateData.status && updateData.status !== adminBefore.status) {
      details = `Changed admin ${admin.name} status to ${updateData.status}`;
    }

    await createAuditLog("Assign Role", details, modifierName);
    return admin;
  }

  async deleteAdmin(id, deleterName) {
    const admin = await Admin.findById(id).populate("role");
    if (!admin) {
      throw new Error("Admin account not found");
    }

    // Protect Super Admin accounts from deletion if it's the last one
    if (admin.role.name === "Super Admin") {
      const superAdminCount = await Admin.countDocuments({ role: admin.role._id });
      if (superAdminCount <= 1) {
        throw new Error("Cannot delete the only Super Admin account");
      }
    }

    await Admin.findByIdAndDelete(id);
    await createAuditLog(
      "Assign Role",
      `Deleted admin account: ${admin.name} (Role: ${admin.role.name})`,
      deleterName
    );
    return admin;
  }
}

module.exports = new AdminService();
