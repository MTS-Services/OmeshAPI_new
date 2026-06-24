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

let server;

// Start server
const startServer = async () => {
  await connectDatabase();

  server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} `);
    logger.info(`📚 API: http://localhost:${PORT}/api/v1/health`);
  });
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('✅ HTTP server closed.');
      try {
        await disconnectDatabase();
      } catch (err) {
        logger.error('❌ Error during database disconnect:', err.message);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  // Force close server after 30s
  setTimeout(() => {
    logger.error(
      '❌ Could not close connections in time, forcefully shutting down',
    );
    process.exit(1);
  }, 30000);
};

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error(`❌ Uncaught Exception thrown: ${error.message}`);
  gracefulShutdown('Uncaught Exception');
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();

module.exports = app;
