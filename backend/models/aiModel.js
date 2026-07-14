const { query } = require('../config/db');

// ---------------------- CROP RECOMMENDATION ----------------------
const logCropRecommendation = async (userId, farmId, input, result) => {
  const insertResult = await query(
    `INSERT INTO ai_crop_recommendations
      (user_id, farm_id, nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall,
       recommended_crop, confidence_score, top_alternatives, model_version)
     VALUES
      (:userId, :farmId, :nitrogen, :phosphorus, :potassium, :temperature, :humidity, :ph, :rainfall,
       :recommendedCrop, :confidenceScore, :topAlternatives, :modelVersion)`,
    {
      userId, farmId,
      nitrogen: input.nitrogen, phosphorus: input.phosphorus, potassium: input.potassium,
      temperature: input.temperature, humidity: input.humidity, ph: input.ph, rainfall: input.rainfall,
      recommendedCrop: result.recommended_crop, confidenceScore: result.confidence_score,
      topAlternatives: JSON.stringify(result.top_alternatives || []),
      modelVersion: result.model_version || 'v1',
    }
  );
  return insertResult.insertId;
};

const listCropRecommendations = async (userId, limit = 20) =>
  query(`SELECT * FROM ai_crop_recommendations WHERE user_id = :userId ORDER BY created_at DESC LIMIT :limit`, { userId, limit: Number(limit) });

// ---------------------- PROFIT PREDICTION ----------------------
const logProfitPrediction = async (userId, cropId, input, result) => {
  const insertResult = await query(
    `INSERT INTO ai_profit_predictions
      (user_id, crop_id, crop_name, area_acres, estimated_cost, predicted_yield_kg,
       predicted_price_per_kg, predicted_revenue, predicted_profit, predicted_roi_percent, model_version)
     VALUES
      (:userId, :cropId, :cropName, :areaAcres, :estimatedCost, :predictedYieldKg,
       :predictedPricePerKg, :predictedRevenue, :predictedProfit, :predictedRoiPercent, :modelVersion)`,
    {
      userId, cropId: cropId ?? null, cropName: input.crop_name, areaAcres: input.area_acres,
      estimatedCost: input.estimated_cost, predictedYieldKg: result.predicted_yield_kg,
      predictedPricePerKg: result.predicted_price_per_kg, predictedRevenue: result.predicted_revenue,
      predictedProfit: result.predicted_profit, predictedRoiPercent: result.predicted_roi_percent,
      modelVersion: result.model_version || 'v1',
    }
  );
  return insertResult.insertId;
};

const listProfitPredictions = async (userId, limit = 20) =>
  query(`SELECT * FROM ai_profit_predictions WHERE user_id = :userId ORDER BY created_at DESC LIMIT :limit`, { userId, limit: Number(limit) });

// ---------------------- PRICE PREDICTION ----------------------
const logPricePrediction = async (userId, input, result) => {
  const insertResult = await query(
    `INSERT INTO ai_price_predictions
      (user_id, crop_name, market_name, state, predicted_price_per_kg, prediction_date,
       forecast_horizon_days, confidence_score, model_version)
     VALUES
      (:userId, :cropName, :marketName, :state, :predictedPricePerKg, :predictionDate,
       :forecastHorizonDays, :confidenceScore, :modelVersion)`,
    {
      userId, cropName: input.crop_name, marketName: input.market_name ?? null, state: input.state ?? null,
      predictedPricePerKg: result.predicted_price_per_kg, predictionDate: result.prediction_date,
      forecastHorizonDays: input.forecast_horizon_days || 30, confidenceScore: result.confidence_score,
      modelVersion: result.model_version || 'v1',
    }
  );
  return insertResult.insertId;
};

const listPricePredictions = async (userId, limit = 20) =>
  query(`SELECT * FROM ai_price_predictions WHERE user_id = :userId ORDER BY created_at DESC LIMIT :limit`, { userId, limit: Number(limit) });

// ---------------------- DISEASE DETECTION ----------------------
const logDiseaseDetection = async (userId, cropId, cropName, imageUrl, result) => {
  const insertResult = await query(
    `INSERT INTO ai_disease_detections
      (user_id, crop_id, crop_name, image_url, detected_disease, is_healthy,
       confidence_score, severity, recommended_treatment, model_version)
     VALUES
      (:userId, :cropId, :cropName, :imageUrl, :detectedDisease, :isHealthy,
       :confidenceScore, :severity, :recommendedTreatment, :modelVersion)`,
    {
      userId, cropId: cropId ?? null, cropName, imageUrl,
      detectedDisease: result.detected_disease, isHealthy: result.is_healthy ? 1 : 0,
      confidenceScore: result.confidence_score, severity: result.severity || 'none',
      recommendedTreatment: result.recommended_treatment || null, modelVersion: result.model_version || 'v1',
    }
  );
  return insertResult.insertId;
};

const listDiseaseDetections = async (userId, limit = 20) =>
  query(`SELECT * FROM ai_disease_detections WHERE user_id = :userId ORDER BY created_at DESC LIMIT :limit`, { userId, limit: Number(limit) });

// ---------------------- FINANCIAL ADVICE ----------------------
const saveFinancialAdvice = async (userId, adviceList) => {
  const insertedIds = [];
  for (const advice of adviceList) {
    // eslint-disable-next-line no-await-in-loop
    const insertResult = await query(
      `INSERT INTO ai_financial_advice (user_id, advice_type, title, description, priority, metadata)
       VALUES (:userId, :adviceType, :title, :description, :priority, :metadata)`,
      {
        userId, adviceType: advice.advice_type, title: advice.title, description: advice.description,
        priority: advice.priority || 'medium', metadata: advice.metadata ? JSON.stringify(advice.metadata) : null,
      }
    );
    insertedIds.push(insertResult.insertId);
  }
  return insertedIds;
};

const listFinancialAdvice = async (userId, { isRead, page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const where = ['user_id = :userId', 'is_dismissed = 0'];
  const params = { userId, limit: Number(limit), offset: Number(offset) };
  if (isRead !== undefined) { where.push('is_read = :isRead'); params.isRead = isRead; }
  const rows = await query(
    `SELECT * FROM ai_financial_advice WHERE ${where.join(' AND ')} ORDER BY priority DESC, created_at DESC LIMIT :limit OFFSET :offset`,
    params
  );
  const countRows = await query(`SELECT COUNT(*) AS total FROM ai_financial_advice WHERE ${where.join(' AND ')}`, params);
  return { rows, total: countRows[0].total };
};

const dismissAdvice = async (id, userId) => {
  await query(`UPDATE ai_financial_advice SET is_dismissed = 1 WHERE id = :id AND user_id = :userId`, { id, userId });
};

const markAdviceRead = async (id, userId) => {
  await query(`UPDATE ai_financial_advice SET is_read = 1 WHERE id = :id AND user_id = :userId`, { id, userId });
};

module.exports = {
  logCropRecommendation, listCropRecommendations,
  logProfitPrediction, listProfitPredictions,
  logPricePrediction, listPricePredictions,
  logDiseaseDetection, listDiseaseDetections,
  saveFinancialAdvice, listFinancialAdvice, dismissAdvice, markAdviceRead,
};
