const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const PUBLIC_FIELDS = `
  id, uuid, full_name, email, phone, role, avatar_url, address, state, district,
  pincode, language_preference, theme_preference, is_verified, is_active,
  last_login_at, created_at, updated_at
`;

const findById = async (id) => {
  const rows = await query(`SELECT * FROM users WHERE id = :id LIMIT 1`, { id });
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const rows = await query(`SELECT * FROM users WHERE email = :email LIMIT 1`, { email });
  return rows[0] || null;
};

const findByPhone = async (phone) => {
  const rows = await query(`SELECT * FROM users WHERE phone = :phone LIMIT 1`, { phone });
  return rows[0] || null;
};

const findByGoogleId = async (googleId) => {
  const rows = await query(`SELECT * FROM users WHERE google_id = :googleId LIMIT 1`, { googleId });
  return rows[0] || null;
};

const create = async ({
  fullName, email, phone, passwordHash, googleId, role = 'farmer',
  state = null, district = null,
}) => {
  const uuid = uuidv4();
  const result = await query(
    `INSERT INTO users
      (uuid, full_name, email, phone, password_hash, google_id, role, state, district, is_verified)
     VALUES
      (:uuid, :fullName, :email, :phone, :passwordHash, :googleId, :role, :state, :district, :isVerified)`,
    {
      uuid,
      fullName,
      email,
      phone: phone || null,
      passwordHash: passwordHash || null,
      googleId: googleId || null,
      role,
      state,
      district,
      isVerified: googleId ? 1 : 0,
    }
  );
  return findById(result.insertId);
};

const updateById = async (id, fields) => {
  const allowed = [
    'full_name', 'phone', 'avatar_url', 'address', 'state', 'district', 'pincode',
    'language_preference', 'theme_preference',
  ];
  const setClauses = [];
  const params = { id };

  Object.entries(fields).forEach(([key, value]) => {
    if (allowed.includes(key) && value !== undefined) {
      setClauses.push(`${key} = :${key}`);
      params[key] = value;
    }
  });

  if (setClauses.length === 0) return findById(id);

  await query(`UPDATE users SET ${setClauses.join(', ')} WHERE id = :id`, params);
  return findById(id);
};

const updatePassword = async (id, passwordHash) => {
  await query(`UPDATE users SET password_hash = :passwordHash WHERE id = :id`, { id, passwordHash });
};

const updateRefreshToken = async (id, refreshToken) => {
  await query(`UPDATE users SET refresh_token = :refreshToken WHERE id = :id`, { id, refreshToken });
};

const updateLastLogin = async (id) => {
  await query(`UPDATE users SET last_login_at = NOW() WHERE id = :id`, { id });
};

const setResetToken = async (id, token, expires) => {
  await query(
    `UPDATE users SET reset_password_token = :token, reset_password_expires = :expires WHERE id = :id`,
    { id, token, expires }
  );
};

const findByResetToken = async (token) => {
  const rows = await query(
    `SELECT * FROM users WHERE reset_password_token = :token AND reset_password_expires > NOW() LIMIT 1`,
    { token }
  );
  return rows[0] || null;
};

const clearResetToken = async (id) => {
  await query(
    `UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = :id`,
    { id }
  );
};

const deactivate = async (id) => {
  await query(`UPDATE users SET is_active = 0 WHERE id = :id`, { id });
};

const activate = async (id) => {
  await query(`UPDATE users SET is_active = 1 WHERE id = :id`, { id });
};

const listAll = async ({ role, search, page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;
  const where = [];
  const params = { limit: Number(limit), offset: Number(offset) };

  if (role) {
    where.push('role = :role');
    params.role = role;
  }
  if (search) {
    where.push('(full_name LIKE :search OR email LIKE :search)');
    params.search = `%${search}%`;
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = await query(
    `SELECT ${PUBLIC_FIELDS} FROM users ${whereSql} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,
    params
  );
  const countRows = await query(`SELECT COUNT(*) as total FROM users ${whereSql}`, params);
  return { rows, total: countRows[0].total };
};

module.exports = {
  PUBLIC_FIELDS,
  findById,
  findByEmail,
  findByPhone,
  findByGoogleId,
  create,
  updateById,
  updatePassword,
  updateRefreshToken,
  updateLastLogin,
  setResetToken,
  findByResetToken,
  clearResetToken,
  deactivate,
  activate,
  listAll,
};
