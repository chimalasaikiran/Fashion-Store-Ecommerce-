const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { protect } = require("../src/middleware/auth.middleware");

// @desc    Get Cloudinary upload signature
// @route   GET /api/upload/signature
// @access  Private/Admin
router.get("/signature", protect, (req, res) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary credentials are not configured on the server",
      });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "products";

    // Sort parameters alphabetically: folder, then timestamp
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    res.status(200).json({
      success: true,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating upload signature",
    });
  }
});

module.exports = router;
