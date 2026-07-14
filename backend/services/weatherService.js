const axios = require('axios');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const weatherModel = require('../models/weatherModel');

/**
 * Fetches current weather + 5-day/3-hour forecast for a farm's coordinates from
 * OpenWeatherMap, caches results in weather_logs, and returns a normalized shape.
 * Falls back to the most recent cached entry if the API key isn't configured or the call fails.
 */
const getWeatherForFarm = async (farm) => {
  if (!farm.latitude || !farm.longitude) {
    throw ApiError.badRequest('This farm does not have latitude/longitude set. Please update farm location.');
  }

  const cached = await weatherModel.getRecentForFarm(farm.id, { hours: 3 });
  if (cached) {
    const forecast = await weatherModel.getForecastForFarm(farm.id);
    return { current: cached, forecast, source: 'cache' };
  }

  if (!env.weather.apiKey) {
    throw new ApiError(503, 'Weather API key is not configured on the server. Set WEATHER_API_KEY in backend/.env.');
  }

  try {
    const currentRes = await axios.get(`${env.weather.baseUrl}/weather`, {
      params: { lat: farm.latitude, lon: farm.longitude, appid: env.weather.apiKey, units: 'metric' },
    });
    const forecastRes = await axios.get(`${env.weather.baseUrl}/forecast`, {
      params: { lat: farm.latitude, lon: farm.longitude, appid: env.weather.apiKey, units: 'metric' },
    });

    const c = currentRes.data;
    await weatherModel.cacheEntry({
      farmId: farm.id,
      temperature: c.main.temp,
      feelsLike: c.main.feels_like,
      humidity: c.main.humidity,
      rainfallMm: c.rain ? c.rain['1h'] || 0 : 0,
      windSpeedKmh: c.wind ? c.wind.speed * 3.6 : null,
      conditionText: c.weather?.[0]?.description || null,
      conditionIcon: c.weather?.[0]?.icon || null,
      forecastDate: new Date().toISOString().slice(0, 10),
      isForecast: false,
      rawPayload: c,
    });

    await weatherModel.clearForecastForFarm(farm.id);
    const dailyMap = {};
    (forecastRes.data.list || []).forEach((entry) => {
      const date = entry.dt_txt.slice(0, 10);
      if (!dailyMap[date]) dailyMap[date] = entry; // first entry of the day as representative
    });
    await Promise.all(
      Object.entries(dailyMap).slice(0, 7).map(([date, entry]) =>
        weatherModel.cacheEntry({
          farmId: farm.id,
          temperature: entry.main.temp,
          feelsLike: entry.main.feels_like,
          humidity: entry.main.humidity,
          rainfallMm: entry.rain ? entry.rain['3h'] || 0 : 0,
          windSpeedKmh: entry.wind ? entry.wind.speed * 3.6 : null,
          conditionText: entry.weather?.[0]?.description || null,
          conditionIcon: entry.weather?.[0]?.icon || null,
          forecastDate: date,
          isForecast: true,
          rawPayload: entry,
        })
      )
    );

    const current = await weatherModel.getRecentForFarm(farm.id, { hours: 1 });
    const forecast = await weatherModel.getForecastForFarm(farm.id);
    return { current, forecast, source: 'live' };
  } catch (err) {
    if (err.isOperational) throw err;
    throw new ApiError(502, 'Failed to fetch weather data from the provider. Please try again later.');
  }
};

module.exports = { getWeatherForFarm };
