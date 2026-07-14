const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const { query } = require('../config/db');
const reportModel = require('../models/reportModel');
const cropModel = require('../models/cropModel');
const pdfService = require('../services/pdfReportService');
const excelService = require('../services/excelReportService');

const gatherReportData = async (userId, { from, to }) => {
  const where = ['user_id = :userId'];
  const params = { userId };
  const whereWithDateExp = [...where];
  const whereWithDateSale = [...where];
  if (from) { whereWithDateExp.push('expense_date >= :from'); whereWithDateSale.push('sale_date >= :from'); params.from = from; }
  if (to) { whereWithDateExp.push('expense_date <= :to'); whereWithDateSale.push('sale_date <= :to'); params.to = to; }

  const expenses = await query(`SELECT * FROM expenses WHERE ${whereWithDateExp.join(' AND ')} ORDER BY expense_date DESC`, params);
  const sales = await query(`SELECT * FROM sales WHERE ${whereWithDateSale.join(' AND ')} ORDER BY sale_date DESC`, params);

  const totalInvestment = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const netProfit = totalRevenue - totalInvestment;
  const roiPercent = totalInvestment > 0 ? Number(((netProfit / totalInvestment) * 100).toFixed(2)) : 0;

  const expenseBreakdown = await query(
    `SELECT category, COALESCE(SUM(amount),0) AS total FROM expenses WHERE ${whereWithDateExp.join(' AND ')} GROUP BY category ORDER BY total DESC`,
    params
  );
  const cropWiseProfit = await cropModel.cropWiseSummary(userId);

  return {
    overview: { totalInvestment, totalRevenue, netProfit, roiPercent },
    expenseBreakdown, cropWiseProfit, sales, expenses,
  };
};

/** POST /api/reports/generate  body: { reportType, format, dateFrom, dateTo } */
const generateReport = catchAsync(async (req, res) => {
  const { format, dateFrom, dateTo, reportType } = req.body;
  const data = await gatherReportData(req.user.id, { from: dateFrom, to: dateTo });

  let fileUrl;
  if (format === 'excel') {
    fileUrl = await excelService.generateProfitLossExcel({ user: req.user, ...data, dateFrom, dateTo });
  } else {
    fileUrl = await pdfService.generateProfitLossPdf({ user: req.user, ...data, dateFrom, dateTo });
  }

  const report = await reportModel.create({
    userId: req.user.id,
    reportType: reportType || 'profit_loss',
    format: format === 'excel' ? 'excel' : 'pdf',
    fileUrl,
    dateFrom: dateFrom || null,
    dateTo: dateTo || null,
  });

  return new ApiResponse(201, report, 'Report generated successfully.').send(res);
});

/** GET /api/reports */
const listReports = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await reportModel.listByUser(req.user.id, { page, limit });
  return new ApiResponse(200, result, 'Reports fetched.').send(res);
});

module.exports = { generateReport, listReports };
