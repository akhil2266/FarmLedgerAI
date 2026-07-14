require('dotenv').config();

const required = (key, fallback = undefined) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Warning: environment variable ${key} is not set.`);
  }
  return value;
};

module.exports = {
  nodeEnv: required('NODE_ENV', 'development'),
  port: parseInt(required('PORT', '5000'), 10),
  clientUrl: required('CLIENT_URL', 'http://localhost:3000'),

  db: {
    host: required('DB_HOST', 'localhost'),
    port: parseInt(required('DB_PORT', '3306'), 10),
    user: required('DB_USER', 'root'),
    password: required('DB_PASSWORD', ''),
    database: required('DB_NAME', 'farmledger_ai'),
    connectionLimit: parseInt(required('DB_CONNECTION_LIMIT', '10'), 10),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev_access_secret_change_me_please_32chars'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me_please_32c'),
    accessExpiresIn: required('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: required('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  google: {
    clientId: required('GOOGLE_CLIENT_ID', ''),
    clientSecret: required('GOOGLE_CLIENT_SECRET', ''),
  },

  aiService: {
    baseUrl: required('AI_SERVICE_URL', 'http://localhost:8000'),
    apiKey: required('AI_SERVICE_API_KEY', 'shared_internal_secret_change_me'),
  },

  weather: {
    apiKey: required('WEATHER_API_KEY', ''),
    baseUrl: required('WEATHER_API_BASE_URL', 'https://api.openweathermap.org/data/2.5'),
  },

  upload: {
    dir: required('UPLOAD_DIR', 'uploads'),
    maxFileSizeMb: parseInt(required('MAX_FILE_SIZE_MB', '5'), 10),
  },

  smtp: {
    host: required('SMTP_HOST', ''),
    port: parseInt(required('SMTP_PORT', '587'), 10),
    user: required('SMTP_USER', ''),
    password: required('SMTP_PASSWORD', ''),
    from: required('SMTP_FROM', 'FarmLedger AI <no-reply@farmledger.ai>'),
  },

  rateLimit: {
    windowMs: parseInt(required('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    max: parseInt(required('RATE_LIMIT_MAX_REQUESTS', '300'), 10),
  },
};
