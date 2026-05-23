/**
 * Common validation schemas and patterns
 * Reusable Joi schemas for common data types and patterns
 */
const Joi = require("joi");

// Common field patterns
const id = Joi.string().min(1).required();
const optionalId = Joi.string().min(1).optional();
const name = Joi.string().min(2).max(100).trim();
const email = Joi.string().email().lowercase().trim();
const phone = Joi.string()
  .pattern(/^[\d\s\+\-\(\)]+$/)
  .min(10)
  .max(20);
const url = Joi.string().uri();
const currency = Joi.number().precision(2).positive();

// Date patterns
const pastDate = Joi.date().max("now");
const futureDate = Joi.date().min("now");
const dateRange = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().min(Joi.ref("startDate")).required(),
});

// Pagination schema
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  search: Joi.string().max(255).optional(),
});

// File upload schema
const fileSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  mimetype: Joi.string()
    .pattern(/^(image|application)\//)
    .required(),
  size: Joi.number()
    .max(5 * 1024 * 1024)
    .required(), // 5MB max
  filename: Joi.string().optional(),
  path: Joi.string().optional(),
});

// Address schema (Ireland specific)
const addressSchema = Joi.object({
  address: Joi.string().max(500).required(),
  county: Joi.string().max(100).optional(),
  area: Joi.string().max(100).optional(),
});

// Irish PPS number validation
const ppsNumber = Joi.string()
  .pattern(/^[0-9]{7}[A-Z]{1,2}$/)
  .message("PPS number must be 7 digits followed by 1-2 letters");

// RTB (Residential Tenancies Board) number validation
const rtbNumber = Joi.string()
  .pattern(/^[0-9]{6,10}$/)
  .message("RTB number must be 6-10 digits");

// MPRN (Meter Point Reference Number) validation
const mprnNumber = Joi.string()
  .pattern(/^[0-9]{11}$/)
  .message("MPRN must be 11 digits");

// Enum validation helpers
const roleEnum = Joi.string().valid("ADMIN", "LANDLORD", "TENANT");
const propertyStatusEnum = Joi.string().valid("LET", "NOTICE", "VACANT");
const tenancyStatusEnum = Joi.string().valid(
  "ACTIVE",
  "NOTICE",
  "EXPIRED",
  "TERMINATED",
);
const maintenanceStatusEnum = Joi.string().valid(
  "OPEN",
  "IN_PROGRESS",
  "CLOSED",
);
const maintenancePriorityEnum = Joi.string().valid("LOW", "MEDIUM", "HIGH");
const paymentStatusEnum = Joi.string().valid(
  "PAID",
  "PENDING",
  "LATE",
  "OVERDUE",
);
const documentTypeEnum = Joi.string().valid(
  "LEASE",
  "INVOICE",
  "STATEMENT",
  "OTHER",
);
const documentVisibilityEnum = Joi.string().valid(
  "TENANT",
  "LANDLORD",
  "LEASE",
);
const rtbRegistrationEnum = Joi.string().valid(
  "REGISTERED",
  "PENDING",
  "MISSING",
  "UNKNOWN",
);

/**
 * Validation middleware factory
 * Creates middleware to validate request data using Joi schema
 */
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, ""),
        value: detail.context?.value,
      }));

      return res.sendValidationError(errors);
    }

    // Replace request property with validated and sanitized value
    req[property] = value;
    next();
  };
};

/**
 * Query parameter validation
 */
const validateQuery = (schema) => validate(schema, "query");

/**
 * Request params validation
 */
const validateParams = (schema) => validate(schema, "params");

/**
 * File validation middleware
 */
const validateFile = (required = false, multiple = false) => {
  return (req, res, next) => {
    const files = multiple ? req.files : req.file ? [req.file] : [];

    if (required && files.length === 0) {
      return res.sendBadRequest("File is required");
    }

    if (files.length > 0) {
      for (const file of files) {
        const { error } = fileSchema.validate(file);
        if (error) {
          return res.sendBadRequest(`File validation failed: ${error.message}`);
        }
      }
    }

    next();
  };
};

module.exports = {
  // Field patterns
  id,
  optionalId,
  name,
  email,
  phone,
  url,
  currency,

  // Date patterns
  pastDate,
  futureDate,
  dateRange,

  // Common schemas
  paginationSchema,
  fileSchema,
  addressSchema,

  // Irish specific patterns
  ppsNumber,
  rtbNumber,
  mprnNumber,

  // Enum validators
  roleEnum,
  propertyStatusEnum,
  tenancyStatusEnum,
  maintenanceStatusEnum,
  maintenancePriorityEnum,
  paymentStatusEnum,
  documentTypeEnum,
  documentVisibilityEnum,
  rtbRegistrationEnum,

  // Validation middleware
  validate,
  validateQuery,
  validateParams,
  validateFile,
};
