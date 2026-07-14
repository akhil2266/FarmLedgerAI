const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/db');

const start = async () => {
  try {
    await testConnection();
    const server = app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] FarmLedger AI backend running on port ${env.port} in ${env.nodeEnv} mode`);
    });

    const shutdown = (signal) => {
      // eslint-disable-next-line no-console
      console.log(`[server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[server] Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
