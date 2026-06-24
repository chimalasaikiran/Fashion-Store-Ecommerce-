const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Admin email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role ID is required"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    blockReason: {
      type: String,
      default: "",
    },
    blockedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const isBcrypt = this.password.startsWith("$2a$") || this.password.startsWith("$2b$");
  if (isBcrypt) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


AdminSchema.methods.matchPassword = async function (enteredPassword) {
  const isBcrypt = this.password.startsWith("$2a$") || this.password.startsWith("$2b$");
  if (!isBcrypt) {
    const isMatch = enteredPassword === this.password;
    if (isMatch) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(enteredPassword, salt);
    }
    return isMatch;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema);
