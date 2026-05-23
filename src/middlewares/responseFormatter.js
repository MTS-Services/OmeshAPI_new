/**
 * Response formatter middleware
 * Adds consistent response formatting methods to Express response object
 */
const {
  successResponse,
  createdResponse,
  noContentResponse,
  errorResponse,
  validationErrorResponse,
  listResponse,
} = require("../utils/apiResponse");

/**
 * Response formatter middleware
 * Attaches formatting methods to res object
 */
const responseFormatter = (req, res, next) => {
  /**
   * @method GET /api/v1/users
   * Send formatted response
   * @param {any} data - Response data
   * @param {string} message - Response message
   * @param {number} statusCode - HTTP status code
   * @param {Object} meta - Additional metadata
   */
  res.formatResponse = function (
    data,
    message = "Success",
    statusCode = 200,
    meta = {},
  ) {
    const response = {
      success: statusCode >= 200 && statusCode < 300,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };

    if (data !== null && data !== undefined) {
      response.data = data;
    }

    if (Object.keys(meta).length > 0) {
      response.meta = meta;
    }

    return this.status(statusCode).json(response);
  };

  /**
   * Send success response (200)
   */
  res.sendSuccess = function (data, message = "Success", meta = {}) {
    const response = successResponse(data, message, meta);
    return this.status(200).json(response);
  };

  /**
   * Send created response (201)
   */
  res.sendCreated = function (data, message = "Resource created successfully") {
    const response = createdResponse(data, message);
    return this.status(201).json(response);
  };

  /**
   * Send no content response (204)
   */
  res.sendNoContent = function (message = "No content") {
    const response = noContentResponse(message);
    return this.status(204).json(response);
  };

  /**
   * Send error response
   */
  res.sendError = function (
    message = "Internal server error",
    statusCode = 500,
    errors = [],
  ) {
    const response = errorResponse(message, statusCode, errors);
    return this.status(statusCode).json(response);
  };

  /**
   * Send validation error response (422)
   */
  res.sendValidationError = function (
    errors = [],
    message = "Validation failed",
  ) {
    const response = validationErrorResponse(errors, message);
    return this.status(422).json(response);
  };

  /**
   * Send paginated list response
   */
  res.sendList = function (
    items,
    page,
    limit,
    total,
    message = "Data retrieved successfully",
  ) {
    const response = listResponse(items, page, limit, total, message);
    return this.status(200).json(response);
  };

  /**
   * Send unauthorized response (401)
   */
  res.sendUnauthorized = function (message = "Unauthorized access") {
    const response = errorResponse(message, 401);
    return this.status(401).json(response);
  };

  /**
   * Send forbidden response (403)
   */
  res.sendForbidden = function (message = "Forbidden access") {
    const response = errorResponse(message, 403);
    return this.status(403).json(response);
  };

  /**
   * Send not found response (404)
   */
  res.sendNotFound = function (message = "Resource not found") {
    const response = errorResponse(message, 404);
    return this.status(404).json(response);
  };

  /**
   * Send conflict response (409)
   */
  res.sendConflict = function (message = "Resource conflict") {
    const response = errorResponse(message, 409);
    return this.status(409).json(response);
  };

  /**
   * Send bad request response (400)
   */
  res.sendBadRequest = function (message = "Bad request", errors = []) {
    const response = errorResponse(message, 400, errors);
    return this.status(400).json(response);
  };

  next();
};

module.exports = {
  responseFormatter,
};
