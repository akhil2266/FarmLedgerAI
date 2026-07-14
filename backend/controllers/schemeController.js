const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const schemeModel = require('../models/schemeModel');

const listSchemes = catchAsync(async (req, res) => {
  const { category, state, search, page, limit } = req.query;
  const result = await schemeModel.listAll({ category, state, search, page, limit });
  return new ApiResponse(200, result, 'Government schemes fetched.').send(res);
});

const getScheme = catchAsync(async (req, res) => {
  const scheme = await schemeModel.findById(req.params.id);
  if (!scheme) throw ApiError.notFound('Scheme not found.');
  return new ApiResponse(200, scheme, 'Scheme fetched.').send(res);
});

/** Admin-only management endpoints */
const createScheme = catchAsync(async (req, res) => {
  const scheme = await schemeModel.create(req.body);
  return new ApiResponse(201, scheme, 'Scheme created.').send(res);
});

const updateScheme = catchAsync(async (req, res) => {
  const scheme = await schemeModel.updateById(req.params.id, req.body);
  return new ApiResponse(200, scheme, 'Scheme updated.').send(res);
});

const deleteScheme = catchAsync(async (req, res) => {
  await schemeModel.remove(req.params.id);
  return new ApiResponse(200, null, 'Scheme deactivated.').send(res);
});

module.exports = { listSchemes, getScheme, createScheme, updateScheme, deleteScheme };
