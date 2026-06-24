const jwt = require("jsonwebtoken");
const Admin = require("../modules/admin/admin.model");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

      // Fetch admin and populate role
      req.admin = await Admin.findById(decoded.id)
        .populate("role")
        .select("-password");

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: "Authentication failed: Administrator account not found",
        });
      }

      if (req.admin.status === "Inactive") {
        return res.status(401).json({
          success: false,
          message: "Authentication failed: Account has been deactivated",
        });
      }

      return next();
    } catch (error) {
      console.error("JWT Verification Error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token validation failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no security token provided",
    });
  }
};

module.exports = { protect };
