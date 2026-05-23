/**
 * Production-ready logging system using Winston
 * Provides different log levels and output formats based on environment
 */
const winston = require("winston");
const config = require("../config");

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Development format (human readable)
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  }),
);

// Create transports based on environment
const transports = [];

// Console transport for all environments
transports.push(
  new winston.transports.Console({
    level: config.logging.level,
    format: config.nodeEnv === "development" ? developmentFormat : logFormat,
    handleExceptions: true,
    handleRejections: true,
  }),
);

// File transports for production
if (config.nodeEnv === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  //   defaultMeta: { service: "property-management-api" },
  transports,
  exitOnError: false,
});

// Add request logging helper
logger.logRequest = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    };

    if (res.statusCode >= 400) {
      logger.warn("HTTP Request", logData);
    } else {
      logger.info("HTTP Request", logData);
    }
  });

  if (next) next();
};

// Add audit logging helper
logger.audit = (userId, action, target, metadata = {}) => {
  logger.info("Audit Log", {
    userId,
    action,
    target,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};

module.exports = logger;
