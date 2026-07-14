const { query } = require('../config/db');

const cacheEntry = async ({
  farmId, temperature, feelsLike, humidity, rainfallMm, windSpeedKmh,
  conditionText, conditionIcon, forecastDate, isForecast, rawPayload,
}) => {
  await query(
    `INSERT INTO weather_logs
      (farm_id, temperature, feels_like, humidity, rainfall_mm, wind_speed_kmh,
       condition_text, condition_icon, forecast_date, is_forecast, raw_payload)
     VALUES
      (:farmId, :temperature, :feelsLike, :humidity, :rainfallMm, :windSpeedKmh,
       :conditionText, :conditionIcon, :forecastDate, :isForecast, :rawPayload)`,
    {
      farmId, temperature, feelsLike: feelsLike ?? null, humidity, rainfallMm: rainfallMm ?? null,
      windSpeedKmh: windSpeedKmh ?? null, conditionText: conditionText ?? null,
      conditionIcon: conditionIcon ?? null, forecastDate, isForecast: isForecast ? 1 : 0,
      rawPayload: rawPayload ? JSON.stringify(rawPayload) : null,
    }
  );
};

const getRecentForFarm = async (farmId, { hours = 3 } = {}) => {
  const rows = await query(
    `SELECT * FROM weather_logs
     WHERE farm_id = :farmId AND is_forecast = 0
       AND created_at >= DATE_SUB(NOW(), INTERVAL :hours HOUR)
     ORDER BY created_at DESC LIMIT 1`,
    { farmId, hours }
  );
  return rows[0] || null;
};

const getForecastForFarm = async (farmId) => {
  return query(
    `SELECT * FROM weather_logs
     WHERE farm_id = :farmId AND is_forecast = 1 AND forecast_date >= CURDATE()
     ORDER BY forecast_date ASC LIMIT 7`,
    { farmId }
  );
};

const clearForecastForFarm = async (farmId) => {
  await query(`DELETE FROM weather_logs WHERE farm_id = :farmId AND is_forecast = 1`, { farmId });
};

module.exports = { cacheEntry, getRecentForFarm, getForecastForFarm, clearForecastForFarm };
