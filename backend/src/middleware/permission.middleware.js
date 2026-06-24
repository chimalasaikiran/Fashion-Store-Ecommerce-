const checkPermission = (moduleName, subpageName, action = "view") => {
  return (req, res, next) => {
    // 1. Check if admin is authenticated
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Super Admin bypasses all checks
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

    // 3. Check if the module is enabled
    const modulePerm = permissions[moduleName];
    if (!modulePerm || !modulePerm.enabled) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: The "${moduleName}" module is disabled for your role`,
      });
    }

    // 4. Check if the subpage/feature actions are enabled
    const subpagePerms = modulePerm.subpages ? modulePerm.subpages[subpageName] : null;
    if (!subpagePerms) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: No access credentials configured for subpage "${subpageName}"`,
      });
    }

    // 5. Verify the specific action (view, create, edit, delete, approve, export) is granted
    if (subpagePerms[action] !== true) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: You do not have "${action}" permission on "${subpageName}"`,
      });
    }

    // Access granted
    next();
  };
};

module.exports = { checkPermission };
