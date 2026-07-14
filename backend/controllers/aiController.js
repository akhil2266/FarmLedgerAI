const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const aiClient = require('../services/aiServiceClient');
const aiModel = require('../models/aiModel');
const farmModel = require('../models/farmModel');
const cropModel = require('../models/cropModel');
const notificationModel = require('../models/notificationModel');
const { query } = require('../config/db');

/** POST /api/ai/crop-recommendation */
const cropRecommendation = catchAsync(async (req, res) => {
  const { farmId, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall } = req.body;

  const farm = await farmModel.findById(farmId);
  if (!farm || farm.user_id !== req.user.id) throw ApiError.notFound('Farm not found.');

  const result = await aiClient.recommendCrop({ nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall });
  await aiModel.logCropRecommendation(req.user.id, farmId, { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall }, result);

  return new ApiResponse(200, result, 'Crop recommendation generated.').send(res);
});

/** GET /api/ai/crop-recommendation/history */
const cropRecommendationHistory = catchAsync(async (req, res) => {
  const rows = await aiModel.listCropRecommendations(req.user.id, req.query.limit || 20);
  return new ApiResponse(200, rows, 'Crop recommendation history fetched.').send(res);
});

/** POST /api/ai/profit-prediction */
const profitPrediction = catchAsync(async (req, res) => {
  const { cropId, cropName, areaAcres, estimatedCost, soilType, season, state } = req.body;

  const result = await aiClient.predictProfit({
    crop_name: cropName, area_acres: areaAcres, estimated_cost: estimatedCost,
    soil_type: soilType, season, state,
  });

  await aiModel.logProfitPrediction(
    req.user.id, cropId || null,
    { crop_name: cropName, area_acres: areaAcres, estimated_cost: estimatedCost },
    result
  );

  return new ApiResponse(200, result, 'Profit prediction generated.').send(res);
});

/** GET /api/ai/profit-prediction/history */
const profitPredictionHistory = catchAsync(async (req, res) => {
  const rows = await aiModel.listProfitPredictions(req.user.id, req.query.limit || 20);
  return new ApiResponse(200, rows, 'Profit prediction history fetched.').send(res);
});

/** POST /api/ai/price-prediction */
const pricePrediction = catchAsync(async (req, res) => {
  const { cropName, marketName, state, forecastHorizonDays } = req.body;

  const result = await aiClient.predictPrice({
    crop_name: cropName, market_name: marketName, state, forecast_horizon_days: forecastHorizonDays || 30,
  });

  await aiModel.logPricePrediction(
    req.user.id,
    { crop_name: cropName, market_name: marketName, state, forecast_horizon_days: forecastHorizonDays },
    result
  );

  return new ApiResponse(200, result, 'Price prediction generated.').send(res);
});

/** GET /api/ai/price-prediction/history */
const pricePredictionHistory = catchAsync(async (req, res) => {
  const rows = await aiModel.listPricePredictions(req.user.id, req.query.limit || 20);
  return new ApiResponse(200, rows, 'Price prediction history fetched.').send(res);
});

/** POST /api/ai/disease-detection (multipart image upload) */
const diseaseDetection = catchAsync(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('An image file is required.');
  const { cropId, cropName } = req.body;

  const result = await aiClient.detectDisease(req.file.path, cropName);
  const imageUrl = `/uploads/crop-images/${req.file.filename}`;

  await aiModel.logDiseaseDetection(req.user.id, cropId || null, cropName || 'unknown', imageUrl, result);

  if (!result.is_healthy && (result.severity === 'high' || result.severity === 'critical')) {
    await notificationModel.create({
      userId: req.user.id,
      type: 'disease_alert',
      title: `${result.severity.toUpperCase()} disease risk detected`,
      message: `${result.detected_disease} detected on ${cropName || 'your crop'} with ${(result.confidence_score * 100).toFixed(1)}% confidence. Review recommended treatment.`,
    });
  }

  return new ApiResponse(200, { ...result, image_url: imageUrl }, 'Disease detection complete.').send(res);
});

/** GET /api/ai/disease-detection/history */
const diseaseDetectionHistory = catchAsync(async (req, res) => {
  const rows = await aiModel.listDiseaseDetections(req.user.id, req.query.limit || 20);
  return new ApiResponse(200, rows, 'Disease detection history fetched.').send(res);
});

/**
 * POST /api/ai/financial-advisor
 * Gathers the farmer's real financial data (expenses, sales, crops) and sends it
 * to the AI service's rule+ML based financial advisor, then persists returned advice.
 */
const financialAdvisor = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const expenseSummary = await query(
    `SELECT category, COALESCE(SUM(amount),0) AS total FROM expenses WHERE user_id = :userId GROUP BY category`,
    { userId }
  );

  const cropSummary = await cropModel.cropWiseSummary(userId);
  const [totals] = await query(
    `SELECT
       (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE user_id = :userId) AS totalExpense,
       (SELECT COALESCE(SUM(total_amount),0) FROM sales WHERE user_id = :userId) AS totalRevenue`,
    { userId }
  );

  const result = await aiClient.getFinancialAdvice({
    total_expense: Number(totals.totalExpense),
    total_revenue: Number(totals.totalRevenue),
    expense_breakdown: expenseSummary,
    crop_summary: cropSummary,
  });

  const savedIds = await aiModel.saveFinancialAdvice(userId, result.advice || []);

  for (const advice of (result.advice || []).filter((a) => a.priority === 'high' || a.priority === 'critical')) {
    // eslint-disable-next-line no-await-in-loop
    await notificationModel.create({
      userId, type: 'ai_advice', title: advice.title, message: advice.description,
    });
  }

  return new ApiResponse(200, { savedCount: savedIds.length, advice: result.advice }, 'Financial advice generated.').send(res);
});

/** GET /api/ai/financial-advisor */
const listFinancialAdvice = catchAsync(async (req, res) => {
  const { isRead, page, limit } = req.query;
  const result = await aiModel.listFinancialAdvice(req.user.id, { isRead, page, limit });
  return new ApiResponse(200, result, 'Financial advice fetched.').send(res);
});

/** PATCH /api/ai/financial-advisor/:id/read */
const markAdviceRead = catchAsync(async (req, res) => {
  await aiModel.markAdviceRead(req.params.id, req.user.id);
  return new ApiResponse(200, null, 'Advice marked as read.').send(res);
});

/** DELETE /api/ai/financial-advisor/:id */
const dismissAdvice = catchAsync(async (req, res) => {
  await aiModel.dismissAdvice(req.params.id, req.user.id);
  return new ApiResponse(200, null, 'Advice dismissed.').send(res);
});

module.exports = {
  cropRecommendation, cropRecommendationHistory,
  profitPrediction, profitPredictionHistory,
  pricePrediction, pricePredictionHistory,
  diseaseDetection, diseaseDetectionHistory,
  financialAdvisor, listFinancialAdvice, markAdviceRead, dismissAdvice,
};
