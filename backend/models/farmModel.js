const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const findById = async (id) => {
  const rows = await query(`SELECT * FROM farms WHERE id = :id LIMIT 1`, { id });
  return rows[0] || null;
};

const findByUuid = async (uuid) => {
  const rows = await query(`SELECT * FROM farms WHERE uuid = :uuid LIMIT 1`, { uuid });
  return rows[0] || null;
};

const listByUser = async (userId, { isActive = 1 } = {}) => {
  return query(
    `SELECT * FROM farms WHERE user_id = :userId AND is_active = :isActive ORDER BY created_at DESC`,
    { userId, isActive }
  );
};

const listAll = async ({ page = 1, limit = 20, state, district } = {}) => {
  const offset = (page - 1) * limit;
  const where = ['is_active = 1'];
  const params = { limit: Number(limit), offset: Number(offset) };
  if (state) { where.push('state = :state'); params.state = state; }
  if (district) { where.push('district = :district'); params.district = district; }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const rows = await query(
    `SELECT f.*, u.full_name AS owner_name, u.email AS owner_email
     FROM farms f JOIN users u ON u.id = f.user_id
     ${whereSql} ORDER BY f.created_at DESC LIMIT :limit OFFSET :offset`,
    params
  );
  const countRows = await query(`SELECT COUNT(*) as total FROM farms f ${whereSql}`, params);
  return { rows, total: countRows[0].total };
};

const create = async (userId, data) => {
  const uuid = uuidv4();
  const result = await query(
    `INSERT INTO farms
      (uuid, user_id, farm_name, farm_size_acres, soil_type, irrigation_type, latitude, longitude,
       address, state, district, village, pincode, ph_level, nitrogen_level, phosphorus_level, potassium_level)
     VALUES
      (:uuid, :userId, :farmName, :farmSizeAcres, :soilType, :irrigationType, :latitude, :longitude,
       :address, :state, :district, :village, :pincode, :phLevel, :nitrogenLevel, :phosphorusLevel, :potassiumLevel)`,
    {
      uuid,
      userId,
      farmName: data.farmName,
      farmSizeAcres: data.farmSizeAcres,
      soilType: data.soilType,
      irrigationType: data.irrigationType,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      address: data.address ?? null,
      state: data.state,
      district: data.district,
      village: data.village ?? null,
      pincode: data.pincode ?? null,
      phLevel: data.phLevel ?? null,
      nitrogenLevel: data.nitrogenLevel ?? null,
      phosphorusLevel: data.phosphorusLevel ?? null,
      potassiumLevel: data.potassiumLevel ?? null,
    }
  );
  return findById(result.insertId);
};

const updateById = async (id, data) => {
  const map = {
    farmName: 'farm_name', farmSizeAcres: 'farm_size_acres', soilType: 'soil_type',
    irrigationType: 'irrigation_type', latitude: 'latitude', longitude: 'longitude',
    address: 'address', state: 'state', district: 'district', village: 'village',
    pincode: 'pincode', phLevel: 'ph_level', nitrogenLevel: 'nitrogen_level',
    phosphorusLevel: 'phosphorus_level', potassiumLevel: 'potassium_level',
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
  await query(`UPDATE farms SET ${setClauses.join(', ')} WHERE id = :id`, params);
  return findById(id);
};

const softDelete = async (id) => {
  await query(`UPDATE farms SET is_active = 0 WHERE id = :id`, { id });
};

const countByUser = async (userId) => {
  const rows = await query(
    `SELECT COUNT(*) as total, COALESCE(SUM(farm_size_acres),0) as totalAcres
     FROM farms WHERE user_id = :userId AND is_active = 1`,
    { userId }
  );
  return rows[0];
};

module.exports = { findById, findByUuid, listByUser, listAll, create, updateById, softDelete, countByUser };
