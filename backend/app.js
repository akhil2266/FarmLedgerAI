const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const env = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// ---- Security & parsing middleware ----
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: env.clientUrl,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// ---- Rate limiting ----
const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ---- Static file serving (uploaded receipts, avatars, crop images) ----
app.use('/uploads', express.static(path.join(process.cwd(), env.upload.dir)));

// ---- API routes ----
app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to FarmLedger AI API', version: '1.0.0' });
});

// ---- 404 + centralized error handler ----
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
