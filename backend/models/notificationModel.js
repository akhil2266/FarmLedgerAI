const { query } = require('../config/db');

const create = async ({ userId, type, title, message, link = null }) => {
  const result = await query(
    `INSERT INTO notifications (user_id, type, title, message, link)
     VALUES (:userId, :type, :title, :message, :link)`,
    { userId, type, title, message, link }
  );
  const rows = await query(`SELECT * FROM notifications WHERE id = :id`, { id: result.insertId });
  return rows[0];
};

const listByUser = async (userId, { isRead, page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const where = ['user_id = :userId'];
  const params = { userId, limit: Number(limit), offset: Number(offset) };
  if (isRead !== undefined) { where.push('is_read = :isRead'); params.isRead = isRead; }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const rows = await query(
    `SELECT * FROM notifications ${whereSql} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,
    params
  );
  const countRows = await query(
    `SELECT COUNT(*) AS total, SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) AS unread
     FROM notifications ${whereSql}`,
    params
  );
  return { rows, total: countRows[0].total, unread: Number(countRows[0].unread || 0) };
};

const markAsRead = async (id, userId) => {
  await query(`UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :userId`, { id, userId });
};

const markAllAsRead = async (userId) => {
  await query(`UPDATE notifications SET is_read = 1 WHERE user_id = :userId AND is_read = 0`, { userId });
};

const remove = async (id, userId) => {
  await query(`DELETE FROM notifications WHERE id = :id AND user_id = :userId`, { id, userId });
};

module.exports = { create, listByUser, markAsRead, markAllAsRead, remove };
