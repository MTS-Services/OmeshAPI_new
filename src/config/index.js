/**
 * Environment-based configuration system
 * Validates required environment variables and exports configuration object
 */
require("dotenv").config();
const Joi = require("joi");

// Environment validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string()
    .required()
    .description("PostgreSQL connection string"),

  // JWT Configuration
  JWT_SECRET: Joi.string().min(32).required().description("JWT secret key"),
  JWT_ACCESS_EXPIRE: Joi.string().default("15m"),
  JWT_REFRESH_EXPIRE: Joi.string().default("7d"),
  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required()
    .description("JWT refresh token secret"),

  // CORS Configuration
  ALLOWED_ORIGINS: Joi.string().default(
    "http://localhost:3000,http://localhost:3001",
  ),

  // File Upload Configuration
  MAX_FILE_SIZE: Joi.number().default(5 * 1024 * 1024), // 5MB default
  UPLOAD_PATH: Joi.string().default("./uploads"),

  // Security
  BCRYPT_ROUNDS: Joi.number().default(12),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "debug")
    .default("info"),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`❌ Config validation error: ${error.message}`);
}

const config = {
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  database: {
    url: envVars.DATABASE_URL,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpire: envVars.JWT_ACCESS_EXPIRE,
    refreshExpire: envVars.JWT_REFRESH_EXPIRE,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
  },
  cors: {
    allowedOrigins: envVars.ALLOWED_ORIGINS.split(","),
  },
  upload: {
    maxFileSize: envVars.MAX_FILE_SIZE,
    path: envVars.UPLOAD_PATH,
  },
  security: {
    bcryptRounds: envVars.BCRYPT_ROUNDS,
  },
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
  },
  logging: {
    level: envVars.LOG_LEVEL,
  },
};

module.exports = config;
