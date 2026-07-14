const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const farmModel = require('../models/farmModel');
const weatherService = require('../services/weatherService');

/** GET /api/weather/farm/:farmId */
const getFarmWeather = catchAsync(async (req, res) => {
  const farm = await farmModel.findById(req.params.farmId);
  if (!farm) throw ApiError.notFound('Farm not found.');
  if (farm.user_id !== req.user.id && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not have access to this farm.');
  }

  const weather = await weatherService.getWeatherForFarm(farm);
  return new ApiResponse(200, weather, 'Weather data fetched.').send(res);
});

module.exports = { getFarmWeather };
