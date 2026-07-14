const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const findById = async (id) => {
  const rows = await query(`SELECT * FROM sales WHERE id = :id LIMIT 1`, { id });
  return rows[0] || null;
};

const listByUser = async (userId, { farmId, cropId, from, to, page = 1, limit = 50 } = {}) => {
  const offset = (page - 1) * limit;
  const where = ['user_id = :userId'];
  const params = { userId, limit: Number(limit), offset: Number(offset) };
  if (farmId) { where.push('farm_id = :farmId'); params.farmId = farmId; }
  if (cropId) { where.push('crop_id = :cropId'); params.cropId = cropId; }
  if (from) { where.push('sale_date >= :from'); params.from = from; }
  if (to) { where.push('sale_date <= :to'); params.to = to; }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const rows = await query(
    `SELECT * FROM sales ${whereSql} ORDER BY sale_date DESC LIMIT :limit OFFSET :offset`,
    params
  );
  const countRows = await query(
    `SELECT COUNT(*) as total, COALESCE(SUM(total_amount),0) as sumAmount FROM sales ${whereSql}`,
    params
  );
  return { rows, total: countRows[0].total, sumAmount: countRows[0].sumAmount };
};

const create = async (userId, data) => {
  const uuid = uuidv4();
  const result = await query(
    `INSERT INTO sales
      (uuid, user_id, farm_id, crop_id, buyer_id, buyer_name, quantity_kg, price_per_kg,
       market_name, sale_date, payment_status, invoice_url, notes)
     VALUES
      (:uuid, :userId, :farmId, :cropId, :buyerId, :buyerName, :quantityKg, :pricePerKg,
       :marketName, :saleDate, :paymentStatus, :invoiceUrl, :notes)`,
    {
      uuid,
      userId,
      farmId: data.farmId,
      cropId: data.cropId ?? null,
      buyerId: data.buyerId ?? null,
      buyerName: data.buyerName ?? null,
      quantityKg: data.quantityKg,
      pricePerKg: data.pricePerKg,
      marketName: data.marketName ?? null,
      saleDate: data.saleDate,
      paymentStatus: data.paymentStatus || 'pending',
      invoiceUrl: data.invoiceUrl ?? null,
      notes: data.notes ?? null,
    }
  );
  return findById(result.insertId);
};

const updateById = async (id, data) => {
  const map = {
    farmId: 'farm_id', cropId: 'crop_id', buyerId: 'buyer_id', buyerName: 'buyer_name',
    quantityKg: 'quantity_kg', pricePerKg: 'price_per_kg', marketName: 'market_name',
    saleDate: 'sale_date', paymentStatus: 'payment_status', invoiceUrl: 'invoice_url', notes: 'notes',
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
  await query(`UPDATE sales SET ${setClauses.join(', ')} WHERE id = :id`, params);
  return findById(id);
};

const remove = async (id) => {
  await query(`DELETE FROM sales WHERE id = :id`, { id });
};

const monthlyRevenue = async (userId, months = 12) => {
  return query(
    `SELECT DATE_FORMAT(sale_date, '%Y-%m') AS month, COALESCE(SUM(total_amount),0) AS total
     FROM sales
     WHERE user_id = :userId AND sale_date >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)
     GROUP BY month ORDER BY month ASC`,
    { userId, months }
  );
};

const yearlyRevenue = async (userId, years = 5) => {
  return query(
    `SELECT YEAR(sale_date) AS year, COALESCE(SUM(total_amount),0) AS total
     FROM sales
     WHERE user_id = :userId AND sale_date >= DATE_SUB(CURDATE(), INTERVAL :years YEAR)
     GROUP BY year ORDER BY year ASC`,
    { userId, years }
  );
};

module.exports = { findById, listByUser, create, updateById, remove, monthlyRevenue, yearlyRevenue };
