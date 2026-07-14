const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { query } = require('../config/db');
const userModel = require('../models/userModel');
const auditModel = require('../models/auditModel');

/** GET /api/admin/overview */
const getPlatformOverview = catchAsync(async (req, res) => {
  const [userCounts] = await query(
    `SELECT
       SUM(CASE WHEN role = 'farmer' THEN 1 ELSE 0 END) AS farmers,
       SUM(CASE WHEN role = 'buyer' THEN 1 ELSE 0 END) AS buyers,
       SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins,
       COUNT(*) AS totalUsers
     FROM users`
  );
  const [farmCounts] = await query(`SELECT COUNT(*) AS totalFarms, COALESCE(SUM(farm_size_acres),0) AS totalAcres FROM farms WHERE is_active = 1`);
  const [cropCounts] = await query(`SELECT COUNT(*) AS totalCrops, SUM(CASE WHEN status='harvested' THEN 1 ELSE 0 END) AS harvested FROM crops`);
  const [financials] = await query(
    `SELECT
       (SELECT COALESCE(SUM(amount),0) FROM expenses) AS platformExpense,
       (SELECT COALESCE(SUM(total_amount),0) FROM sales) AS platformRevenue`
  );
  const [orderCounts] = await query(`SELECT COUNT(*) AS totalOrders, COALESCE(SUM(total_amount),0) AS totalOrderValue FROM marketplace_orders`);

  return new ApiResponse(200, {
    users: userCounts,
    farms: farmCounts,
    crops: cropCounts,
    financials,
    marketplace: orderCounts,
  }, 'Platform overview fetched.').send(res);
});

/** GET /api/admin/users */
const listUsers = catchAsync(async (req, res) => {
  const { role, search, page, limit } = req.query;
  const result = await userModel.listAll({ role, search, page, limit });
  return new ApiResponse(200, result, 'Users fetched.').send(res);
});

/** PATCH /api/admin/users/:id/deactivate */
const deactivateUser = catchAsync(async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found.');
  await userModel.deactivate(req.params.id);
  await auditModel.log({ userId: req.user.id, action: 'DEACTIVATE_USER', entityType: 'users', entityId: user.id, ipAddress: req.ip });
  return new ApiResponse(200, null, 'User deactivated.').send(res);
});

/** PATCH /api/admin/users/:id/activate */
const activateUser = catchAsync(async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found.');
  await userModel.activate(req.params.id);
  await auditModel.log({ userId: req.user.id, action: 'ACTIVATE_USER', entityType: 'users', entityId: user.id, ipAddress: req.ip });
  return new ApiResponse(200, null, 'User activated.').send(res);
});

/** GET /api/admin/audit-logs */
const getAuditLogs = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await auditModel.listRecent({ page, limit });
  return new ApiResponse(200, result, 'Audit logs fetched.').send(res);
});

/** GET /api/admin/growth-trend?months=12 -- new user signups per month (platform growth chart) */
const getGrowthTrend = catchAsync(async (req, res) => {
  const months = req.query.months ? Number(req.query.months) : 12;
  const rows = await query(
    `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS newUsers
     FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)
     GROUP BY month ORDER BY month ASC`,
    { months }
  );
  return new ApiResponse(200, rows, 'Platform growth trend fetched.').send(res);
});

module.exports = { getPlatformOverview, listUsers, deactivateUser, activateUser, getAuditLogs, getGrowthTrend };
