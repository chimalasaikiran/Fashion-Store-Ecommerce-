const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please add a reviewer name"],
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    verified: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      required: [true, "Please add a rating between 1 and 5"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    text: {
      type: String,
      required: [true, "Please add review content text"],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


ReviewSchema.virtual("timeAgo").get(function () {
  if (!this.createdAt) return "Just now";
  const diffMs = Date.now() - this.createdAt.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  return "Just now";
});


ReviewSchema.statics.getAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await this.model("Product").findByIdAndUpdate(productId, {
        rating: stats[0].averageRating.toFixed(1),
        reviewsCount: stats[0].count,
      });
    } else {
      await this.model("Product").findByIdAndUpdate(productId, {
        rating: "0.0",
        reviewsCount: 0,
      });
    }
  } catch (err) {
    console.error("Error updating average rating:", err);
  }
};


ReviewSchema.post("save", async function () {
  await this.constructor.getAverageRating(this.product);
});


ReviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.getAverageRating(doc.product);
  }
});


ReviewSchema.post("remove", async function () {
  await this.constructor.getAverageRating(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
