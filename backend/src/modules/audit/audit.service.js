const AuditLog = require("./audit.model");

class AuditService {
  async getAuditLogs() {
    return await AuditLog.find({}).sort({ timestamp: -1 }).limit(100); // Return last 100 logs
  }
}

module.exports = new AuditService();
