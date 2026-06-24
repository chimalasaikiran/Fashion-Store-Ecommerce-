const auditService = require("./audit.service");

class AuditController {
  getAuditLogs = async (req, res, next) => {
    try {
      const logs = await auditService.getAuditLogs();
      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch audit logs",
      });
    }
  };
}

module.exports = new AuditController();
