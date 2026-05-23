/**
 * Database configuration and Prisma client setup
 * Handles connection, logging, and graceful disconnection
 */
const { PrismaClient } = require("@prisma/client");
const config = require("./index");
const logger = require("../utils/logger");

// Create Prisma client with appropriate logging based on environment
const prisma = new PrismaClient({
  log: config.nodeEnv === "development" ? ["warn", "error"] : ["warn", "error"],
  errorFormat: "minimal",
});

// Database connection helper
const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info("📊 Database connected successfully");

    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info("✅ Database connection verified");

    return prisma;
  } catch (error) {
    logger.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

// Graceful disconnection
const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    logger.info("📊 Database disconnected successfully");
  } catch (error) {
    logger.error("❌ Error disconnecting from database:", error.message);
  }
};

// Handle process termination
process.on("beforeExit", disconnectDatabase);
process.on("SIGINT", disconnectDatabase);
process.on("SIGTERM", disconnectDatabase);

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
};
