/**
 * Centralized error handling middleware
 * Handles all application errors and provides consistent error responses
 */
const config = require('../config');
const logger = require('../utils/logger');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Custom Application Error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error handler wrapper
 * Wraps async functions to catch errors automatically
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle Prisma errors
 */
const handlePrismaError = (error) => {
  const { code, message } = error;

  switch (code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target?.[0] || 'field';
      return new AppError(`${field} already exists`, 409);

    case 'P2025':
      // Record not found
      return new AppError('Record not found', 404);

    case 'P2003':
      // Foreign key constraint violation
      return new AppError('Related record not found', 400);

    case 'P2014':
      // Required relation missing
      return new AppError('Required relation missing', 400);

    case 'P2021':
      // Table does not exist
      return new AppError('Database table does not exist', 500);

    case 'P2022':
      // Column does not exist
      return new AppError('Database column does not exist', 500);

    default:
      logger.error('Unhandled Prisma error:', { code, message });
      return new AppError('Database operation failed', 500);
  }
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401);
  }

  if (error.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401);
  }

  return new AppError('Authentication failed', 401);
};

/**
 * Handle validation errors (Joi)
 */
const handleValidationError = (error) => {
  const errors = error.details.map((detail) => ({
    field: detail.path.join('.'),
    message: detail.message,
    value: detail.context?.value,
  }));

  return new AppError('Validation failed', 422, errors);
};

/**
 * Handle Multer file upload errors
 */
const handleMulterError = (error) => {
  const { code, field } = error;

  switch (code) {
    case 'LIMIT_FILE_SIZE':
      return new AppError('File size too large', 413);
    case 'LIMIT_UNEXPECTED_FILE':
      return new AppError('Unexpected file field', 400);
    case 'LIMIT_FILE_COUNT':
      return new AppError('Too many files', 400);
    default:
      return new AppError('File upload failed', 400);
  }
};

/**
 * Global error handler middleware
 */
const errorHandler = (error, req, res, next) => {
  let err = error;

  // Log error for debugging
  logger.error('Error occurred:', {
    error: error.message,
    stack: config.nodeEnv === 'development' ? error.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
  });

  // Handle specific error types
  if (error.code && error.code.startsWith('P2')) {
    err = handlePrismaError(error);
  } else if (
    error.name === 'JsonWebTokenError' ||
    error.name === 'TokenExpiredError'
  ) {
    err = handleJWTError(error);
  } else if (error.isJoi) {
    err = handleValidationError(error);
  } else if (error.code && error.code.startsWith('LIMIT_')) {
    err = handleMulterError(error);
  } else if (!error.isOperational) {
    // Convert programming errors to operational errors
    err = new AppError('Something went wrong', 500);
  }

  // Ensure AppError format
  if (!(err instanceof AppError)) {
    err = new AppError(
      error.message || 'Internal server error',
      error.statusCode || 500,
    );
  }

  // Prepare error response
  const response = errorResponse(err.message, err.statusCode, err.errors);

  // Add stack trace in development
  if (config.nodeEnv === 'development') {
    response.stack = error.stack;
  }

  return res.status(err.statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Unhandled promise rejection handler
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
  process.exit(1);
});

/**
 * Uncaught exception handler
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  notFound,
};
