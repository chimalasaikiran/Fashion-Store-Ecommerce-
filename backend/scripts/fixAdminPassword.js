require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Admin = require("../src/modules/admin/admin.model");
const Role = require("../src/modules/role/role.model");

const fixPassword = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in the environment variables (.env file)");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    const email = "superadmin@fashionstore.com";
    const plainPassword = "fashion1234";

    
    let superAdminRole = await Role.findOne({ name: "Super Admin" });
    if (!superAdminRole) {
      console.log("Super Admin role not found. Creating a default Super Admin role...");
      superAdminRole = await Role.create({
        name: "Super Admin",
        description: "Complete system access, controls all pages and configurations.",
        permissions: {},
        status: "Active",
        createdBy: "System Script",
      });
    }

    
    let admin = await Admin.findOne({ email });

    if (admin) {
      console.log(`Found existing admin with email: ${email}`);
      
      
      admin.password = plainPassword;
      admin.role = superAdminRole._id;
      admin.status = "Active";
      
      await admin.save();
      console.log(`Successfully updated password and let Mongoose hash it once for: ${email}`);
    } else {
      console.log(`Admin with email ${email} not found. Creating a new one...`);
      admin = await Admin.create({
        name: "Super Admin User",
        email: email,
        password: plainPassword, 
        role: superAdminRole._id,
        status: "Active",
      });
      console.log(`Successfully created a new admin account: ${email} with correctly hashed password.`);
    }

    console.log("Operation completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error running script:", err);
    process.exit(1);
  }
};

fixPassword();
