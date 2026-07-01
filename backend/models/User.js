const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    phone: {
      type: String,
      default: "",
    },
    countryCode: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      default: "",
    },
    blockedAt: {
      type: Date,
      default: null,
    },
    notificationPreferences: {
      email: {
        orders: { type: Boolean, default: true },
        shipments: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false },
        security: { type: Boolean, default: true },
      },
      push: {
        orders: { type: Boolean, default: true },
        shipments: { type: Boolean, default: false },
        promotions: { type: Boolean, default: false },
        security: { type: Boolean, default: true },
      },
      sms: {
        orders: { type: Boolean, default: false },
        shipments: { type: Boolean, default: false },
        promotions: { type: Boolean, default: false },
        security: { type: Boolean, default: true },
      },
    },
    cart: [
      {
        id: { type: String, required: true },
        productId: { type: String, required: true },
        name: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        size: { type: String, required: true },
        color: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);


UserSchema.pre("save", async function (next) {
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


UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
