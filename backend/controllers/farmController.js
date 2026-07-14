const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const farmModel = require('../models/farmModel');

const assertOwnership = (farm, user) => {
  if (!farm) throw ApiError.notFound('Farm not found.');
  if (farm.user_id !== user.id && user.role !== 'admin') {
    throw ApiError.forbidden('You do not have access to this farm.');
  }
};

/** POST /api/farms */
const createFarm = catchAsync(async (req, res) => {
  const farm = await farmModel.create(req.user.id, req.body);
  return new ApiResponse(201, farm, 'Farm created successfully.').send(res);
});

/** GET /api/farms */
const listFarms = catchAsync(async (req, res) => {
  const farms = await farmModel.listByUser(req.user.id);
  return new ApiResponse(200, farms, 'Farms fetched.').send(res);
});

/** GET /api/farms/:id */
const getFarm = catchAsync(async (req, res) => {
  const farm = await farmModel.findById(req.params.id);
  assertOwnership(farm, req.user);
  return new ApiResponse(200, farm, 'Farm fetched.').send(res);
});

/** PATCH /api/farms/:id */
const updateFarm = catchAsync(async (req, res) => {
  const farm = await farmModel.findById(req.params.id);
  assertOwnership(farm, req.user);
  const updated = await farmModel.updateById(req.params.id, req.body);
  return new ApiResponse(200, updated, 'Farm updated successfully.').send(res);
});

/** DELETE /api/farms/:id */
const deleteFarm = catchAsync(async (req, res) => {
  const farm = await farmModel.findById(req.params.id);
  assertOwnership(farm, req.user);
  await farmModel.softDelete(req.params.id);
  return new ApiResponse(200, null, 'Farm deleted successfully.').send(res);
});

/** GET /api/farms/summary/stats */
const getFarmStats = catchAsync(async (req, res) => {
  const stats = await farmModel.countByUser(req.user.id);
  return new ApiResponse(200, stats, 'Farm stats fetched.').send(res);
});

/** GET /api/admin/farms (admin only) */
const listAllFarms = catchAsync(async (req, res) => {
  const { page, limit, state, district } = req.query;
  const result = await farmModel.listAll({ page, limit, state, district });
  return new ApiResponse(200, result, 'All farms fetched.').send(res);
});

module.exports = { createFarm, listFarms, getFarm, updateFarm, deleteFarm, getFarmStats, listAllFarms };
