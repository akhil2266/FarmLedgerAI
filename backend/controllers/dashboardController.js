const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const { query } = require('../config/db');

/**
 * GET /api/dashboard/overview
 * High-level KPI cards: total investment, total revenue, net profit, overall ROI%,
 * active farms, active crop cycles.
 */
const getOverview = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const [expenseTotals] = await query(
    `SELECT COALESCE(SUM(amount),0) AS totalExpense FROM expenses WHERE user_id = :userId`,
    { userId }
  );
  const [saleTotals] = await query(
    `SELECT COALESCE(SUM(total_amount),0) AS totalRevenue FROM sales WHERE user_id = :userId`,
    { userId }
  );
  const [farmTotals] = await query(
    `SELECT COUNT(*) AS activeFarms FROM farms WHERE user_id = :userId AND is_active = 1`,
    { userId }
  );
  const [cropTotals] = await query(
    `SELECT
        SUM(CASE WHEN status IN ('sowing','growing','planned') THEN 1 ELSE 0 END) AS activeCrops,
        SUM(CASE WHEN status = 'harvested' THEN 1 ELSE 0 END) AS harvestedCrops
     FROM crops WHERE user_id = :userId`,
    { userId }
  );

  const totalExpense = Number(expenseTotals.totalExpense);
  const totalRevenue = Number(saleTotals.totalRevenue);
  const netProfit = totalRevenue - totalExpense;
  const roiPercent = totalExpense > 0 ? Number(((netProfit / totalExpense) * 100).toFixed(2)) : 0;

  return new ApiResponse(200, {
    totalInvestment: totalExpense,
    totalRevenue,
    netProfit,
    roiPercent,
    activeFarms: Number(farmTotals.activeFarms),
    activeCrops: Number(cropTotals.activeCrops || 0),
    harvestedCrops: Number(cropTotals.harvestedCrops || 0),
  }, 'Dashboard overview fetched.').send(res);
});

/**
 * GET /api/dashboard/investment-trend?months=12
 * Monthly investment (expense) trend for line/area chart.
 */
const getInvestmentTrend = catchAsync(async (req, res) => {
  const months = req.query.months ? Number(req.query.months) : 12;
  const rows = await query(
    `SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month, COALESCE(SUM(amount),0) AS investment
     FROM expenses
     WHERE user_id = :userId AND expense_date >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)
     GROUP BY month ORDER BY month ASC`,
    { userId: req.user.id, months }
  );
  return new ApiResponse(200, rows, 'Investment trend fetched.').send(res);
});

/**
 * GET /api/dashboard/profit-trend?months=12
 * Combines monthly revenue and expense to compute a monthly profit line.
 */
const getProfitTrend = catchAsync(async (req, res) => {
  const months = req.query.months ? Number(req.query.months) : 12;
  const userId = req.user.id;

  const revenueRows = await query(
    `SELECT DATE_FORMAT(sale_date, '%Y-%m') AS month, COALESCE(SUM(total_amount),0) AS revenue
     FROM sales WHERE user_id = :userId AND sale_date >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)
     GROUP BY month`,
    { userId, months }
  );
  const expenseRows = await query(
    `SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month, COALESCE(SUM(amount),0) AS expense
     FROM expenses WHERE user_id = :userId AND expense_date >= DATE_SUB(CURDATE(), INTERVAL :months MONTH)
     GROUP BY month`,
    { userId, months }
  );

  const map = {};
  revenueRows.forEach((r) => { map[r.month] = { month: r.month, revenue: Number(r.revenue), expense: 0 }; });
  expenseRows.forEach((r) => {
    if (!map[r.month]) map[r.month] = { month: r.month, revenue: 0, expense: 0 };
    map[r.month].expense = Number(r.expense);
  });

  const merged = Object.values(map)
    .sort((a, b) => (a.month > b.month ? 1 : -1))
    .map((m) => ({ ...m, profit: m.revenue - m.expense }));

  return new ApiResponse(200, merged, 'Profit trend fetched.').send(res);
});

/**
 * GET /api/dashboard/expense-breakdown
 * Category-wise expense breakdown for pie/donut chart.
 */
const getExpenseBreakdown = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const where = ['user_id = :userId'];
  const params = { userId: req.user.id };
  if (from) { where.push('expense_date >= :from'); params.from = from; }
  if (to) { where.push('expense_date <= :to'); params.to = to; }

  const rows = await query(
    `SELECT category, COALESCE(SUM(amount),0) AS total
     FROM expenses WHERE ${where.join(' AND ')}
     GROUP BY category ORDER BY total DESC`,
    params
  );
  return new ApiResponse(200, rows, 'Expense breakdown fetched.').send(res);
});

/**
 * GET /api/dashboard/crop-wise-profit
 * Profit per crop type across all cycles (bar chart).
 */
const getCropWiseProfit = catchAsync(async (req, res) => {
  const rows = await query(
    `SELECT
        c.crop_name,
        COALESCE(SUM(e.total_expense),0) AS total_expense,
        COALESCE(SUM(s.total_revenue),0) AS total_revenue,
        COALESCE(SUM(s.total_revenue),0) - COALESCE(SUM(e.total_expense),0) AS profit
     FROM crops c
     LEFT JOIN (SELECT crop_id, SUM(amount) AS total_expense FROM expenses GROUP BY crop_id) e
       ON e.crop_id = c.id
     LEFT JOIN (SELECT crop_id, SUM(total_amount) AS total_revenue FROM sales GROUP BY crop_id) s
       ON s.crop_id = c.id
     WHERE c.user_id = :userId
     GROUP BY c.crop_name
     ORDER BY profit DESC`,
    { userId: req.user.id }
  );
  return new ApiResponse(200, rows, 'Crop-wise profit fetched.').send(res);
});

/**
 * GET /api/dashboard/revenue?range=monthly|yearly
 */
const getRevenue = catchAsync(async (req, res) => {
  const range = req.query.range === 'yearly' ? 'yearly' : 'monthly';
  const userId = req.user.id;

  let rows;
  if (range === 'yearly') {
    rows = await query(
      `SELECT YEAR(sale_date) AS period, COALESCE(SUM(total_amount),0) AS revenue
       FROM sales WHERE user_id = :userId GROUP BY period ORDER BY period ASC`,
      { userId }
    );
  } else {
    rows = await query(
      `SELECT DATE_FORMAT(sale_date, '%Y-%m') AS period, COALESCE(SUM(total_amount),0) AS revenue
       FROM sales WHERE user_id = :userId
       AND sale_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY period ORDER BY period ASC`,
      { userId }
    );
  }
  return new ApiResponse(200, rows, `${range} revenue fetched.`).send(res);
});

/**
 * GET /api/dashboard/roi-analysis
 * ROI% per crop cycle (crops table) for scatter/bar chart.
 */
const getRoiAnalysis = catchAsync(async (req, res) => {
  const rows = await query(
    `SELECT
        c.id AS crop_id, c.crop_name, c.season, c.sowing_date, c.status,
        COALESCE(e.total_expense,0) AS investment,
        COALESCE(s.total_revenue,0) AS revenue,
        COALESCE(s.total_revenue,0) - COALESCE(e.total_expense,0) AS profit,
        CASE WHEN COALESCE(e.total_expense,0) > 0
          THEN ROUND(((COALESCE(s.total_revenue,0) - COALESCE(e.total_expense,0)) / e.total_expense) * 100, 2)
          ELSE 0 END AS roi_percent
     FROM crops c
     LEFT JOIN (SELECT crop_id, SUM(amount) AS total_expense FROM expenses GROUP BY crop_id) e
       ON e.crop_id = c.id
     LEFT JOIN (SELECT crop_id, SUM(total_amount) AS total_revenue FROM sales GROUP BY crop_id) s
       ON s.crop_id = c.id
     WHERE c.user_id = :userId
     ORDER BY c.sowing_date DESC`,
    { userId: req.user.id }
  );
  return new ApiResponse(200, rows, 'ROI analysis fetched.').send(res);
});

module.exports = {
  getOverview,
  getInvestmentTrend,
  getProfitTrend,
  getExpenseBreakdown,
  getCropWiseProfit,
  getRevenue,
  getRoiAnalysis,
};
