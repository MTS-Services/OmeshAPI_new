/**
 * Database configuration and Prisma client setup
 * Handles connection, logging, and singleton pattern
 */
const { PrismaClient } = require('@prisma/client');
const config = require('./index');
const logger = require('../utils/logger');

const globalForPrisma = globalThis;

let prisma;

if (!globalForPrisma.prismaGlobal) {
  globalForPrisma.prismaGlobal = new PrismaClient({
    log:
      config.nodeEnv === 'development' ? ['warn', 'error'] : ['warn', 'error'],
    errorFormat: 'minimal',
  });
}

prisma = globalForPrisma.prismaGlobal;

const connectDatabase = async (retries = 5, delay = 5000) => {
  while (retries > 0) {
    try {
      logger.info('🔄 Attempting to connect to the database...');
      await prisma.$connect();
      logger.info('📊 Database connected successfully');

      // Test the connection
      await prisma.$queryRaw`SELECT 1`;
      logger.info('✅ Database connection verified');

      return prisma;
    } catch (error) {
      retries -= 1;
      logger.error(`❌ Database connection failed: ${error.message}`);

      if (retries === 0) {
        logger.error('🚫 Max connection retries reached. Exiting process...');
        process.exit(1);
      }

      logger.info(
        `⏳ Retrying connection in ${delay / 1000} seconds... (${retries} attempts left)`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

/**
 * Graceful disconnection helper
 */
const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    logger.info('📊 Database disconnected successfully via Prisma');
  } catch (error) {
    logger.error('❌ Error disconnecting from database:', error.message);
  }
};

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
};
