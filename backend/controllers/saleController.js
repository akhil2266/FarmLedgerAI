const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const saleModel = require('../models/saleModel');
const farmModel = require('../models/farmModel');

const assertOwnership = (sale, user) => {
  if (!sale) throw ApiError.notFound('Sale not found.');
  if (sale.user_id !== user.id && user.role !== 'admin') {
    throw ApiError.forbidden('You do not have access to this sale.');
  }
};

/** POST /api/sales */
const createSale = catchAsync(async (req, res) => {
  const farm = await farmModel.findById(req.body.farmId);
  if (!farm) throw ApiError.notFound('Farm not found.');
  if (farm.user_id !== req.user.id) throw ApiError.forbidden('You do not own this farm.');

  const invoiceUrl = req.file ? `/uploads/receipts/${req.file.filename}` : undefined;
  const sale = await saleModel.create(req.user.id, { ...req.body, invoiceUrl });
  return new ApiResponse(201, sale, 'Sale recorded successfully.').send(res);
});

/** GET /api/sales */
const listSales = catchAsync(async (req, res) => {
  const { farmId, cropId, from, to, page, limit } = req.query;
  const result = await saleModel.listByUser(req.user.id, { farmId, cropId, from, to, page, limit });
  return new ApiResponse(200, result, 'Sales fetched.').send(res);
});

/** GET /api/sales/:id */
const getSale = catchAsync(async (req, res) => {
  const sale = await saleModel.findById(req.params.id);
  assertOwnership(sale, req.user);
  return new ApiResponse(200, sale, 'Sale fetched.').send(res);
});

/** PATCH /api/sales/:id */
const updateSale = catchAsync(async (req, res) => {
  const sale = await saleModel.findById(req.params.id);
  assertOwnership(sale, req.user);
  const invoiceUrl = req.file ? `/uploads/receipts/${req.file.filename}` : undefined;
  const updated = await saleModel.updateById(req.params.id, { ...req.body, invoiceUrl });
  return new ApiResponse(200, updated, 'Sale updated successfully.').send(res);
});

/** DELETE /api/sales/:id */
const deleteSale = catchAsync(async (req, res) => {
  const sale = await saleModel.findById(req.params.id);
  assertOwnership(sale, req.user);
  await saleModel.remove(req.params.id);
  return new ApiResponse(200, null, 'Sale deleted successfully.').send(res);
});

/** GET /api/sales/summary/monthly-revenue */
const getMonthlyRevenue = catchAsync(async (req, res) => {
  const months = req.query.months ? Number(req.query.months) : 12;
  const trend = await saleModel.monthlyRevenue(req.user.id, months);
  return new ApiResponse(200, trend, 'Monthly revenue fetched.').send(res);
});

/** GET /api/sales/summary/yearly-revenue */
const getYearlyRevenue = catchAsync(async (req, res) => {
  const years = req.query.years ? Number(req.query.years) : 5;
  const trend = await saleModel.yearlyRevenue(req.user.id, years);
  return new ApiResponse(200, trend, 'Yearly revenue fetched.').send(res);
});

module.exports = {
  createSale, listSales, getSale, updateSale, deleteSale, getMonthlyRevenue, getYearlyRevenue,
};
