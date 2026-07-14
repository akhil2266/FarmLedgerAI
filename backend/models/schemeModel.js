const { query } = require('../config/db');

const listAll = async ({ category, state, search, page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const where = ['is_active = 1'];
  const params = { limit: Number(limit), offset: Number(offset) };
  if (category) { where.push('category = :category'); params.category = category; }
  if (state) { where.push("(applicable_states = 'All India' OR applicable_states LIKE :state)"); params.state = `%${state}%`; }
  if (search) { where.push('(scheme_name LIKE :search OR description LIKE :search)'); params.search = `%${search}%`; }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const rows = await query(
    `SELECT * FROM govt_schemes ${whereSql} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,
    params
  );
  const countRows = await query(`SELECT COUNT(*) AS total FROM govt_schemes ${whereSql}`, params);
  return { rows, total: countRows[0].total };
};

const findById = async (id) => {
  const rows = await query(`SELECT * FROM govt_schemes WHERE id = :id LIMIT 1`, { id });
  return rows[0] || null;
};

const create = async (data) => {
  const result = await query(
    `INSERT INTO govt_schemes
      (scheme_name, scheme_code, description, category, eligibility, benefits,
       applicable_states, official_link, application_deadline)
     VALUES
      (:schemeName, :schemeCode, :description, :category, :eligibility, :benefits,
       :applicableStates, :officialLink, :applicationDeadline)`,
    {
      schemeName: data.schemeName,
      schemeCode: data.schemeCode ?? null,
      description: data.description,
      category: data.category,
      eligibility: data.eligibility ?? null,
      benefits: data.benefits ?? null,
      applicableStates: data.applicableStates || 'All India',
      officialLink: data.officialLink ?? null,
      applicationDeadline: data.applicationDeadline ?? null,
    }
  );
  return findById(result.insertId);
};

const updateById = async (id, data) => {
  const map = {
    schemeName: 'scheme_name', description: 'description', category: 'category',
    eligibility: 'eligibility', benefits: 'benefits', applicableStates: 'applicable_states',
    officialLink: 'official_link', applicationDeadline: 'application_deadline', isActive: 'is_active',
  };
  const setClauses = [];
  const params = { id };
  Object.entries(data).forEach(([key, value]) => {
    if (map[key] && value !== undefined) {
      setClauses.push(`${map[key]} = :${key}`);
      params[key] = value;
    }
  });
  if (setClauses.length === 0) return findById(id);
  await query(`UPDATE govt_schemes SET ${setClauses.join(', ')} WHERE id = :id`, params);
  return findById(id);
};

const remove = async (id) => {
  await query(`UPDATE govt_schemes SET is_active = 0 WHERE id = :id`, { id });
};

module.exports = { listAll, findById, create, updateById, remove };
