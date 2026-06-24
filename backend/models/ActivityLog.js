const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    action: {
      type: String,
      required: [true, "Action description is required"],
      trim: true,
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
      trim: true,
    },
    device: {
      type: String,
      default: "Web Browser",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },
    category: {
      type: String,
      enum: ["Auth", "Transaction", "Profile", "Security"],
      default: "Profile",
    },
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: false },
  }
);

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
