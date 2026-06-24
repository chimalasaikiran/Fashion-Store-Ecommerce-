const AuditLog = require("./audit.model");

class AuditService {
  async getAuditLogs() {
    return await AuditLog.find({}).sort({ timestamp: -1 }).limit(100); 
  }
}

module.exports = new AuditService();
