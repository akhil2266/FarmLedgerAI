const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const client = axios.create({
  baseURL: env.aiService.baseUrl,
  timeout: 30000,
  headers: { 'X-Internal-Api-Key': env.aiService.apiKey },
});

const handleAiError = (err) => {
  if (err.response) {
    throw new ApiError(err.response.status || 502, err.response.data?.detail || 'AI service returned an error.');
  }
  if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
    throw new ApiError(503, 'AI service is currently unavailable. Please ensure the FastAPI service is running.');
  }
  throw new ApiError(502, 'Failed to reach the AI service.');
};

const recommendCrop = async (payload) => {
  try {
    const { data } = await client.post('/api/v1/crop-recommendation', payload);
    return data;
  } catch (err) { handleAiError(err); }
};

const predictProfit = async (payload) => {
  try {
    const { data } = await client.post('/api/v1/profit-prediction', payload);
    return data;
  } catch (err) { handleAiError(err); }
};

const predictPrice = async (payload) => {
  try {
    const { data } = await client.post('/api/v1/price-prediction', payload);
    return data;
  } catch (err) { handleAiError(err); }
};

const detectDisease = async (imagePath, cropName) => {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));
    form.append('crop_name', cropName || 'unknown');
    const { data } = await client.post('/api/v1/disease-detection', form, {
      headers: { ...form.getHeaders(), 'X-Internal-Api-Key': env.aiService.apiKey },
    });
    return data;
  } catch (err) { handleAiError(err); }
};

const getFinancialAdvice = async (payload) => {
  try {
    const { data } = await client.post('/api/v1/financial-advisor', payload);
    return data;
  } catch (err) { handleAiError(err); }
};

module.exports = { recommendCrop, predictProfit, predictPrice, detectDisease, getFinancialAdvice };
