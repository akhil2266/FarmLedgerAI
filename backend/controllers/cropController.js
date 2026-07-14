const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const cropModel = require('../models/cropModel');
const farmModel = require('../models/farmModel');

const assertOwnership = (crop, user) => {
  if (!crop) throw ApiError.notFound('Crop not found.');
  if (crop.user_id !== user.id && user.role !== 'admin') {
    throw ApiError.forbidden('You do not have access to this crop.');
  }
};

/** POST /api/crops */
const createCrop = catchAsync(async (req, res) => {
  const farm = await farmModel.findById(req.body.farmId);
  if (!farm) throw ApiError.notFound('Farm not found.');
  if (farm.user_id !== req.user.id) throw ApiError.forbidden('You do not own this farm.');

  const crop = await cropModel.create(req.user.id, req.body);
  return new ApiResponse(201, crop, 'Crop cycle created successfully.').send(res);
});

/** GET /api/crops */
const listCrops = catchAsync(async (req, res) => {
  const { farmId, status, season, page, limit } = req.query;
  const result = await cropModel.listByUser(req.user.id, { farmId, status, season, page, limit });
  return new ApiResponse(200, result, 'Crops fetched.').send(res);
});

/** GET /api/crops/:id */
const getCrop = catchAsync(async (req, res) => {
  const crop = await cropModel.findById(req.params.id);
  assertOwnership(crop, req.user);
  return new ApiResponse(200, crop, 'Crop fetched.').send(res);
});

/** PATCH /api/crops/:id */
const updateCrop = catchAsync(async (req, res) => {
  const crop = await cropModel.findById(req.params.id);
  assertOwnership(crop, req.user);
  const updated = await cropModel.updateById(req.params.id, req.body);
  return new ApiResponse(200, updated, 'Crop updated successfully.').send(res);
});

/** DELETE /api/crops/:id */
const deleteCrop = catchAsync(async (req, res) => {
  const crop = await cropModel.findById(req.params.id);
  assertOwnership(crop, req.user);
  await cropModel.remove(req.params.id);
  return new ApiResponse(200, null, 'Crop deleted successfully.').send(res);
});

/** GET /api/crops/summary/crop-wise */
const getCropWiseSummary = catchAsync(async (req, res) => {
  const summary = await cropModel.cropWiseSummary(req.user.id);
  return new ApiResponse(200, summary, 'Crop-wise profit summary fetched.').send(res);
});

module.exports = { createCrop, listCrops, getCrop, updateCrop, deleteCrop, getCropWiseSummary };
