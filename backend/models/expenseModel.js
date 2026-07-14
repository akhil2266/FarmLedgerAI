const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const findById = async (id) => {
  const rows = await query(`SELECT * FROM expenses WHERE id = :id LIMIT 1`, { id });
  return rows[0] || null;
};

const listByUser = async (userId, { farmId, cropId, category, from, to, page = 1, limit = 50 } = {}) => {
  const offset = (page - 1) * limit;
  const where = ['user_id = :userId'];
  const params = { userId, limit: Number(limit), offset: Number(offset) };
  if (farmId) { where.push('farm_id = :farmId'); params.farmId = farmId; }
  if (cropId) { where.push('crop_id = :cropId'); params.cropId = cropId; }
  if (category) { where.push('category = :category'); params.category = category; }
  if (from) { where.push('expense_date >= :from'); params.from = from; }
  if (to) { where.push('expense_date <= :to'); params.to = to; }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const rows = await query(
    `SELECT * FROM expenses ${whereSql} ORDER BY expense_date DESC LIMIT :limit OFFSET :offset`,
    params
  );
  const countRows = await query(
    `SELECT COUNT(*) as total, COALESCE(SUM(amount),0) as sumAmount FROM expenses ${whereSql}`,
    params
  );
  return { rows, total: countRows[0].total, sumAmount: countRows[0].sumAmount };
};

const create = async (userId, data) => {
  const uuid = uuidv4();
  const result = await query(
    `INSERT INTO expenses
      (uuid, user_id, farm_id, crop_id, category, description, amount, quantity, unit,
       vendor_name, payment_mode, expense_date, receipt_url)
     VALUES
      (:uuid, :userId, :farmId, :cropId, :category, :description, :amount, :quantity, :unit,
       :vendorName, :paymentMode, :expenseDate, :receiptUrl)`,
    {
      uuid,
      userId,
      farmId: data.farmId,
      cropId: data.cropId ?? null,
      category: data.category,
      description: data.description ?? null,
      amount: data.amount,
      quantity: data.quantity ?? null,
      unit: data.unit ?? null,
      vendorName: data.vendorName ?? null,
      paymentMode: data.paymentMode || 'cash',
      expenseDate: data.expenseDate,
      receiptUrl: data.receiptUrl ?? null,
    }
  );
  return findById(result.insertId);
};

const updateById = async (id, data) => {
  const map = {
    farmId: 'farm_id', cropId: 'crop_id', category: 'category', description: 'description',
    amount: 'amount', quantity: 'quantity', unit: 'unit', vendorName: 'vendor_name',
    paymentMode: 'payment_mode', expenseDate: 'expense_date', receiptUrl: 'receipt_url',
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
  await query(`UPDATE expenses SET ${setClauses.join(', ')} WHERE id = :id`, params);
  return findById(id);
};

const remove = async (id) => {
  await query(`DELETE FROM expenses WHERE id = :id`, { id });
};

const breakdownByCategory = async (userId, { from, to } = {}) => {
  const where = ['user_id = :userId'];
  const params = { userId };
  if (from) { where.push('expense_date >= :from'); params.from = from; }
  if (to) { where.push('expense_date <= :to'); params.to = to; }
  return query(
    `SELECT category, COALESCE(SUM(amount),0) AS total
     FROM expenses WHERE ${where.join(' AND ')}
     GROUP BY category ORDER BY total DESC`,
    params
  );
};

const monthlyTrend = async (userId, months = 12) => {
  return query(
    `SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month, COALESCE(SUM(amount),0) AS total
     FROM expenses
     WHERE user_id = :userId AND expense_date >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)
     GROUP BY month ORDER BY month ASC`,
    { userId, months }
  );
};

module.exports = { findById, listByUser, create, updateById, remove, breakdownByCategory, monthlyTrend };
