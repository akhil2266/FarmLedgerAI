const { query } = require('../config/db');

const create = async ({ userId, reportType, format, fileUrl, dateFrom = null, dateTo = null }) => {
  const result = await query(
    `INSERT INTO reports (user_id, report_type, format, file_url, date_from, date_to)
     VALUES (:userId, :reportType, :format, :fileUrl, :dateFrom, :dateTo)`,
    { userId, reportType, format, fileUrl, dateFrom, dateTo }
  );
  const rows = await query(`SELECT * FROM reports WHERE id = :id`, { id: result.insertId });
  return rows[0];
};

const listByUser = async (userId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const rows = await query(
    `SELECT * FROM reports WHERE user_id = :userId ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,
    { userId, limit: Number(limit), offset: Number(offset) }
  );
  const countRows = await query(`SELECT COUNT(*) AS total FROM reports WHERE user_id = :userId`, { userId });
  return { rows, total: countRows[0].total };
};

module.exports = { create, listByUser };
