const Role = require("./role.model");
const AuditLog = require("../audit/audit.model");

const createAuditLog = async (action, details, user) => {
  try {
    await AuditLog.create({ action, details, user: user || "System" });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
};

class RoleService {
  async createRole(roleData, creatorName) {
    const role = await Role.create({
      ...roleData,
      createdBy: creatorName || "System",
    });
    await createAuditLog(
      "Create Role",
      `Created new security role: ${role.name}`,
      creatorName
    );
    return role;
  }

  async getAllRoles() {
    return await Role.find({});
  }

  async getRoleById(id) {
    return await Role.findById(id);
  }

  async getRoleByName(name) {
    return await Role.findOne({ name });
  }

  async updateRole(id, updateData, modifierName) {
    const roleBefore = await Role.findById(id);
    if (!roleBefore) {
      throw new Error("Role not found");
    }

    
    if (roleBefore.name === "Super Admin") {
      if (updateData.name && updateData.name !== "Super Admin") {
        throw new Error("Cannot rename Super Admin role");
      }
      if (updateData.status && updateData.status !== "Active") {
        throw new Error("Cannot deactivate Super Admin role");
      }
    }

    const role = await Role.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    
    let details = `Updated details for role: ${role.name}`;
    if (JSON.stringify(roleBefore.permissions) !== JSON.stringify(role.permissions)) {
      details = `Updated permissions matrix for role: ${role.name}`;
    } else if (roleBefore.name !== role.name) {
      details = `Renamed role ${roleBefore.name} to ${role.name} and updated details.`;
    }

    await createAuditLog("Modify Permissions", details, modifierName);
    return role;
  }

  async deleteRole(id, deleterName) {
    const role = await Role.findById(id);
    if (!role) {
      throw new Error("Role not found");
    }

    if (role.name === "Super Admin" || role.name === "Admin" || !role.isCustom) {
      throw new Error("Default system roles cannot be deleted");
    }

    await Role.findByIdAndDelete(id);
    await createAuditLog(
      "Delete Role",
      `Deleted security role: ${role.name}`,
      deleterName
    );
    return role;
  }
}

module.exports = new RoleService();
