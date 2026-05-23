/**
 * Server entry point
 * Starts the Express server and handles graceful shutdown
 */
require('express-async-errors');
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { connectDatabase, disconnectDatabase } = require('./config/database');
require('./modules/payment/paymentSubscriber');

const PORT = config.port || 3002;

// Start server
const startServer = async () => {
  await connectDatabase();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} `);
    logger.info(`📚 API: http://localhost:${PORT}/api/v1/health`);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));

  return server;
};

function gracefulShutdown(server, signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('✅ HTTP server closed.');
    await disconnectDatabase();
    process.exit(0);
  });

  // Force close server after 30s
  setTimeout(() => {
    logger.error(
      '❌ Could not close connections in time, forcefully shutting down',
    );
    process.exit(1);
  }, 30000);
}

startServer();

module.exports = app;
