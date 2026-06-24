require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Role = require("../modules/role/role.model");
const Admin = require("../modules/admin/admin.model");
const AuditLog = require("../modules/audit/audit.model");

const MODULES_CONFIG = {
  dashboard: {
    subpages: [
      "Dashboard View",
    ],
  },
  products: {
    subpages: [
      "Category List",
      "Product List",
      "Product Detail",
      "Product Show / Hide",
      "Bulk Product Visibility",
      "Inventory Management",
    ],
  },
  orders: {
    subpages: [
      "Order List",
      "Order Details",
      "Pending Orders",
      "Processing Orders",
      "Delivered Orders",
      "Cancelled Orders",
      "Shipped Orders",
      "Returned Orders",
      "Refund Management",
    ],
  },
  shipments: {
    subpages: [
      "Shipment Creation",
      "Track Shipments",
      "Return Requests",
      "Refund Processing",
      "Replacement Orders",
    ],
  },
  tickets: {
    subpages: [
      "Ticket Dashboard",
      "Ticket Details",
      "Ticket Closure",
      "Ticket Escalation",
      "Full Ticket Access",
    ],
  },
  payments: {
    subpages: [
      "Payment Logs",
      "Transaction Details",
      "Invoice Management",
      "Credit Notes",
      "Status Notifications",
    ],
  },
  customers: {
    subpages: [
      "User List",
      "User Details",
      "Activity Log",
      "Notification Preferences",
    ],
  },
  settings: {
    subpages: [
      "General Settings",
    ],
  },
  roles: {
    subpages: [
      "Role & Access Management",
    ],
  },
};

const createEmptyPermissions = (allEnabled = false) => ({
  view: allEnabled,
  create: allEnabled,
  edit: allEnabled,
  delete: allEnabled,
  approve: allEnabled,
  export: allEnabled,
});

const getRolePermissions = (roleName) => {
  const permissions = {};

  // Initialize all to false
  Object.keys(MODULES_CONFIG).forEach((moduleKey) => {
    permissions[moduleKey] = {
      enabled: false,
      subpages: {},
    };
    MODULES_CONFIG[moduleKey].subpages.forEach((sub) => {
      permissions[moduleKey].subpages[sub] = createEmptyPermissions(false);
    });
  });

  const enableAllInModule = (moduleKey) => {
    permissions[moduleKey].enabled = true;
    MODULES_CONFIG[moduleKey].subpages.forEach((sub) => {
      permissions[moduleKey].subpages[sub] = createEmptyPermissions(true);
    });
  };

  const enableSubpage = (subpageName, actions) => {
    let foundMod = null;
    for (const [mod, config] of Object.entries(MODULES_CONFIG)) {
      if (config.subpages.includes(subpageName)) {
        foundMod = mod;
        break;
      }
    }
    if (foundMod) {
      permissions[foundMod].enabled = true;
      permissions[foundMod].subpages[subpageName] = {
        ...permissions[foundMod].subpages[subpageName],
        ...actions,
      };
    }
  };

  if (roleName === "Super Admin" || roleName === "Admin") {
    Object.keys(MODULES_CONFIG).forEach((mod) => enableAllInModule(mod));
  } else if (roleName === "Product Manager") {
    permissions.dashboard.enabled = true;
    enableSubpage("Dashboard View", { view: true });

    permissions.products.enabled = true;
    enableSubpage("Category List", { view: true, create: true, edit: true, export: true });
    enableSubpage("Product List", { view: true, create: true, edit: true, export: true });
    enableSubpage("Product Detail", { view: true, create: true, edit: true, export: true });
    enableSubpage("Product Show / Hide", { view: true, create: true, edit: true, export: true });
    enableSubpage("Bulk Product Visibility", { view: true, create: true, edit: true, export: true });
    enableSubpage("Inventory Management", { view: true, create: true, edit: true, export: true });
  } else if (roleName === "Order Manager") {
    permissions.dashboard.enabled = true;
    enableSubpage("Dashboard View", { view: true });

    permissions.orders.enabled = true;
    enableSubpage("Order List", { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage("Order Details", { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage("Pending Orders", { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage("Processing Orders", { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage("Delivered Orders", { view: true, create: true, edit: true, approve: true, export: true });
    enableSubpage("Cancelled Orders", { view: true, create: true, edit: true, approve: true, export: true });
  } else if (roleName === "Customer Support") {
    permissions.dashboard.enabled = true;
    enableSubpage("Dashboard View", { view: true });

    permissions.tickets.enabled = true;
    enableSubpage("Ticket Dashboard", { view: true, create: true, edit: true, approve: true });
    enableSubpage("Ticket Details", { view: true, create: true, edit: true, approve: true });
    enableSubpage("Ticket Closure", { view: true, create: true, edit: true, approve: true });
  }

  return permissions;
};

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not defined in environment variables");
    }

    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    // 1. Seed Roles
    const rolesToSeed = [
      { name: "Super Admin", description: "Complete system access, controls all pages and configurations.", isCustom: false },
      { name: "Admin", description: "Full access to operations, orders, tickets, and user configuration.", isCustom: false },
      { name: "Product Manager", description: "Manages categories, products, visibility controls.", isCustom: false },
      { name: "Order Manager", description: "Handles order listing, detailed views, processing operations.", isCustom: false },
      { name: "Customer Support", description: "Monitors customer feedback and grievance ticket logs.", isCustom: false },
    ];

    console.log("Seeding default roles...");
    const roleMap = {};

    for (const roleData of rolesToSeed) {
      let role = await Role.findOne({ name: roleData.name });
      const permissions = getRolePermissions(roleData.name);

      if (!role) {
        role = await Role.create({
          name: roleData.name,
          description: roleData.description,
          permissions,
          status: "Active",
          createdBy: "System Seed",
        });
        console.log(`Created role: ${role.name}`);
      } else {
        role.permissions = permissions;
        role.isCustom = false;
        await role.save();
        console.log(`Updated permissions for existing role: ${role.name}`);
      }
      roleMap[role.name] = role._id;
    }

    // 2. Seed Default Accounts
    console.log("Seeding default accounts...");
    
    // Default Super Admin
    const adminEmail = "admin@fashionstore.com";
    let admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      admin = await Admin.create({
        name: "Super Admin User",
        email: adminEmail,
        password: "AdminPassword123!", // Will be hashed by mongoose pre-save hook
        role: roleMap["Super Admin"],
        status: "Active",
      });
      console.log(`Created default Super Admin user: ${adminEmail}`);
    } else {
      admin.role = roleMap["Super Admin"];
      await admin.save();
      console.log(`Verified Super Admin role mapping for: ${adminEmail}`);
    }

    // Default Product Manager
    const managerEmail = "manager@fashionstore.com";
    let manager = await Admin.findOne({ email: managerEmail });
    if (!manager) {
      manager = await Admin.create({
        name: "Product Manager User",
        email: managerEmail,
        password: "ManagerPassword123!", // Will be hashed by mongoose pre-save hook
        role: roleMap["Product Manager"],
        status: "Active",
      });
      console.log(`Created default Product Manager user: ${managerEmail}`);
    } else {
      manager.role = roleMap["Product Manager"];
      await manager.save();
      console.log(`Verified Product Manager role mapping for: ${managerEmail}`);
    }

    // Log to audit log
    const auditExists = await AuditLog.findOne({ action: "Initialize RBAC" });
    if (!auditExists) {
      await AuditLog.create({
        action: "Initialize RBAC",
        details: "Initial database seed completed: Default roles and accounts created.",
        user: "System",
      });
    }

    console.log("Database seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the script if executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
