const checkPermission = (moduleName, subpageName, action = "view") => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.admin.role && req.admin.role.name === "Super Admin") {
      return next();
    }

    const permissions = req.admin.role ? req.admin.role.permissions : null;

    if (!permissions) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: No role permissions configured",
      });
    }

    const modulePerm = permissions[moduleName];
    if (!modulePerm || !modulePerm.enabled) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: The "${moduleName}" module is disabled for your role`,
      });
    }

    const subpagePerms = modulePerm.subpages ? modulePerm.subpages[subpageName] : null;
    if (!subpagePerms) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: No access credentials configured for subpage "${subpageName}"`,
      });
    }

    if (subpagePerms[action] !== true) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: You do not have "${action}" permission on "${subpageName}"`,
      });
    }

    next();
  };
};

module.exports = { checkPermission };
