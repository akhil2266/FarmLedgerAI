const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const findById = async (id) => {
  const rows = await query(`SELECT * FROM crops WHERE id = :id LIMIT 1`, { id });
  return rows[0] || null;
};

const findByUuid = async (uuid) => {
  const rows = await query(`SELECT * FROM crops WHERE uuid = :uuid LIMIT 1`, { uuid });
  return rows[0] || null;
};

const listByUser = async (userId, { farmId, status, season, page = 1, limit = 50 } = {}) => {
  const offset = (page - 1) * limit;
  const where = ['c.user_id = :userId'];
  const params = { userId, limit: Number(limit), offset: Number(offset) };
  if (farmId) { where.push('c.farm_id = :farmId'); params.farmId = farmId; }
  if (status) { where.push('c.status = :status'); params.status = status; }
  if (season) { where.push('c.season = :season'); params.season = season; }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const rows = await query(
    `SELECT c.*, f.farm_name
     FROM crops c JOIN farms f ON f.id = c.farm_id
     ${whereSql} ORDER BY c.sowing_date DESC LIMIT :limit OFFSET :offset`,
    params
  );
  const countRows = await query(`SELECT COUNT(*) as total FROM crops c ${whereSql}`, params);
  return { rows, total: countRows[0].total };
};

const create = async (userId, data) => {
  const uuid = uuidv4();
  const result = await query(
    `INSERT INTO crops
      (uuid, farm_id, user_id, crop_catalog_id, crop_name, variety, season, area_acres,
       sowing_date, expected_harvest_date, expected_yield_kg, status, notes)
     VALUES
      (:uuid, :farmId, :userId, :cropCatalogId, :cropName, :variety, :season, :areaAcres,
       :sowingDate, :expectedHarvestDate, :expectedYieldKg, :status, :notes)`,
    {
      uuid,
      farmId: data.farmId,
      userId,
      cropCatalogId: data.cropCatalogId ?? null,
      cropName: data.cropName,
      variety: data.variety ?? null,
      season: data.season,
      areaAcres: data.areaAcres,
      sowingDate: data.sowingDate,
      expectedHarvestDate: data.expectedHarvestDate ?? null,
      expectedYieldKg: data.expectedYieldKg ?? null,
      status: data.status || 'planned',
      notes: data.notes ?? null,
    }
  );
  return findById(result.insertId);
};

const updateById = async (id, data) => {
  const map = {
    cropName: 'crop_name', variety: 'variety', season: 'season', areaAcres: 'area_acres',
    sowingDate: 'sowing_date', expectedHarvestDate: 'expected_harvest_date',
    actualHarvestDate: 'actual_harvest_date', expectedYieldKg: 'expected_yield_kg',
    actualYieldKg: 'actual_yield_kg', status: 'status', notes: 'notes',
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
  await query(`UPDATE crops SET ${setClauses.join(', ')} WHERE id = :id`, params);
  return findById(id);
};

const remove = async (id) => {
  await query(`DELETE FROM crops WHERE id = :id`, { id });
};

const cropWiseSummary = async (userId) => {
  return query(
    `SELECT
        c.crop_name,
        COUNT(*) AS cycles,
        COALESCE(SUM(c.actual_yield_kg),0) AS total_yield_kg,
        COALESCE(SUM(e.total_expense),0) AS total_expense,
        COALESCE(SUM(s.total_revenue),0) AS total_revenue,
        COALESCE(SUM(s.total_revenue),0) - COALESCE(SUM(e.total_expense),0) AS profit
     FROM crops c
     LEFT JOIN (
        SELECT crop_id, SUM(amount) AS total_expense FROM expenses GROUP BY crop_id
     ) e ON e.crop_id = c.id
     LEFT JOIN (
        SELECT crop_id, SUM(total_amount) AS total_revenue FROM sales GROUP BY crop_id
     ) s ON s.crop_id = c.id
     WHERE c.user_id = :userId
     GROUP BY c.crop_name
     ORDER BY profit DESC`,
    { userId }
  );
};

module.exports = { findById, findByUuid, listByUser, create, updateById, remove, cropWiseSummary };
