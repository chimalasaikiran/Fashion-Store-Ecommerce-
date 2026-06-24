const validateRoleCreate = (req, res, next) => {
  const { name, permissions } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Role name is required and must be a non-empty string",
    });
  }

  if (permissions && typeof permissions !== "object") {
    return res.status(400).json({
      success: false,
      message: "Permissions must be an object structure",
    });
  }

  next();
};

const validateRoleUpdate = (req, res, next) => {
  const { name, permissions } = req.body;

  if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
    return res.status(400).json({
      success: false,
      message: "Role name must be a non-empty string if provided",
    });
  }

  if (permissions !== undefined && typeof permissions !== "object") {
    return res.status(400).json({
      success: false,
      message: "Permissions must be an object structure if provided",
    });
  }

  next();
};

module.exports = {
  validateRoleCreate,
  validateRoleUpdate,
};
