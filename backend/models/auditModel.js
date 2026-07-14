const { query } = require('../config/db');

const log = async ({ userId = null, action, entityType = null, entityId = null, ipAddress = null, metadata = null }) => {
  await query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, metadata)
     VALUES (:userId, :action, :entityType, :entityId, :ipAddress, :metadata)`,
    {
      userId, action, entityType, entityId, ipAddress,
      metadata: metadata ? JSON.stringify(metadata) : null,
    }
  );
};

const listRecent = async ({ page = 1, limit = 50 } = {}) => {
  const offset = (page - 1) * limit;
  const rows = await query(
    `SELECT a.*, u.full_name AS user_name
     FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC LIMIT :limit OFFSET :offset`,
    { limit: Number(limit), offset: Number(offset) }
  );
  const countRows = await query(`SELECT COUNT(*) AS total FROM audit_logs`);
  return { rows, total: countRows[0].total };
};

module.exports = { log, listRecent };
