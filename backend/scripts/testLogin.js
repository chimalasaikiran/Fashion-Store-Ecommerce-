require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Role = require("../src/modules/role/role.model");
const Admin = require("../src/modules/admin/admin.model");

const test = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected.");

    const email = "superadmin@fashionstore.com";
    const password = "fashion1234";

    const admin = await Admin.findOne({ email }).populate("role");
    if (!admin) {
      console.log("Admin not found in DB!");
      process.exit(1);
    }

    console.log("Admin record found in DB:");
    console.log("ID:", admin._id);
    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role ? admin.role.name : "None");
    console.log("Status:", admin.status);
    console.log("Password hash in DB:", admin.password);

    const isMatchDirect = await bcrypt.compare(password, admin.password);
    console.log("Direct bcrypt.compare with 'fashion1234':", isMatchDirect);

    const isMatchDirectWithPlain = (password === admin.password);
    console.log("Direct comparison with plain text:", isMatchDirectWithPlain);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

test();
