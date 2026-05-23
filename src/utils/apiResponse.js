/**
 * API Response formatter utility
 * Provides consistent response structure across all endpoints
 */

/**
 * Standard API response structure
 * @param {any} data - Response data
 * @param {string} message - Response message
 * @param {number} statusCode - HTTP status code
 * @param {Object} meta - Additional metadata (pagination, etc.)
 * @returns {Object} Formatted response object
 */
const formatResponse = (
  data = null,
  message = "Success",
  statusCode = 200,
  meta = {},
) => {
  const isSuccess = statusCode >= 200 && statusCode < 300;

  const response = {
    success: isSuccess,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  // Add data only if present
  if (data !== null && data !== undefined) {
    response.data = data;
  }

  // Add metadata if present
  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return response;
};

/**
 * Success response helper
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {Object} meta - Additional metadata
 */
const successResponse = (data = null, message = "Success", meta = {}) => {
  return formatResponse(data, message, 200, meta);
};

/**
 * Created response helper
 * @param {any} data - Created resource data
 * @param {string} message - Success message
 */
const createdResponse = (
  data = null,
  message = "Resource created successfully",
) => {
  return formatResponse(data, message, 201);
};

/**
 * No content response helper
 * @param {string} message - Success message
 */
const noContentResponse = (message = "No content") => {
  return formatResponse(null, message, 204);
};

/**
 * Error response helper
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Array} errors - Detailed error array
 */
const errorResponse = (
  message = "Internal server error",
  statusCode = 500,
  errors = [],
) => {
  const response = formatResponse(null, message, statusCode);

  if (errors.length > 0) {
    response.errors = errors;
  }

  return response;
};

/**
 * Validation error response helper
 * @param {Array} errors - Validation errors array
 * @param {string} message - Error message
 */
const validationErrorResponse = (
  errors = [],
  message = "Validation failed",
) => {
  return errorResponse(message, 422, errors);
};

/**
 * Pagination metadata helper
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 */
const paginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * List response with pagination
 * @param {Array} items - List items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @param {string} message - Success message
 */
const listResponse = (
  items,
  page,
  limit,
  total,
  message = "Data retrieved successfully",
) => {
  const meta = paginationMeta(page, limit, total);
  return formatResponse(items, message, 200, meta);
};

module.exports = {
  formatResponse,
  successResponse,
  createdResponse,
  noContentResponse,
  errorResponse,
  validationErrorResponse,
  paginationMeta,
  listResponse,
};
