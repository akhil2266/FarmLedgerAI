const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const expenseModel = require('../models/expenseModel');
const farmModel = require('../models/farmModel');

const assertOwnership = (expense, user) => {
  if (!expense) throw ApiError.notFound('Expense not found.');
  if (expense.user_id !== user.id && user.role !== 'admin') {
    throw ApiError.forbidden('You do not have access to this expense.');
  }
};

/** POST /api/expenses */
const createExpense = catchAsync(async (req, res) => {
  const farm = await farmModel.findById(req.body.farmId);
  if (!farm) throw ApiError.notFound('Farm not found.');
  if (farm.user_id !== req.user.id) throw ApiError.forbidden('You do not own this farm.');

  const receiptUrl = req.file ? `/uploads/receipts/${req.file.filename}` : undefined;
  const expense = await expenseModel.create(req.user.id, { ...req.body, receiptUrl });
  return new ApiResponse(201, expense, 'Expense recorded successfully.').send(res);
});

/** GET /api/expenses */
const listExpenses = catchAsync(async (req, res) => {
  const { farmId, cropId, category, from, to, page, limit } = req.query;
  const result = await expenseModel.listByUser(req.user.id, { farmId, cropId, category, from, to, page, limit });
  return new ApiResponse(200, result, 'Expenses fetched.').send(res);
});

/** GET /api/expenses/:id */
const getExpense = catchAsync(async (req, res) => {
  const expense = await expenseModel.findById(req.params.id);
  assertOwnership(expense, req.user);
  return new ApiResponse(200, expense, 'Expense fetched.').send(res);
});

/** PATCH /api/expenses/:id */
const updateExpense = catchAsync(async (req, res) => {
  const expense = await expenseModel.findById(req.params.id);
  assertOwnership(expense, req.user);
  const receiptUrl = req.file ? `/uploads/receipts/${req.file.filename}` : undefined;
  const updated = await expenseModel.updateById(req.params.id, { ...req.body, receiptUrl });
  return new ApiResponse(200, updated, 'Expense updated successfully.').send(res);
});

/** DELETE /api/expenses/:id */
const deleteExpense = catchAsync(async (req, res) => {
  const expense = await expenseModel.findById(req.params.id);
  assertOwnership(expense, req.user);
  await expenseModel.remove(req.params.id);
  return new ApiResponse(200, null, 'Expense deleted successfully.').send(res);
});

/** GET /api/expenses/summary/breakdown */
const getBreakdown = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const breakdown = await expenseModel.breakdownByCategory(req.user.id, { from, to });
  return new ApiResponse(200, breakdown, 'Expense breakdown fetched.').send(res);
});

/** GET /api/expenses/summary/monthly-trend */
const getMonthlyTrend = catchAsync(async (req, res) => {
  const months = req.query.months ? Number(req.query.months) : 12;
  const trend = await expenseModel.monthlyTrend(req.user.id, months);
  return new ApiResponse(200, trend, 'Monthly expense trend fetched.').send(res);
});

module.exports = {
  createExpense, listExpenses, getExpense, updateExpense, deleteExpense, getBreakdown, getMonthlyTrend,
};
