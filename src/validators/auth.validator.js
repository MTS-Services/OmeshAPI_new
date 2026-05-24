/**
 * Authentication validation schemas
 * Joi schemas for validating authentication-related requests
 */
const Joi = require('joi');

// Common validation patterns
const email = Joi.string().email().lowercase().trim().required();
const password = Joi.string()
  .min(8)
  .max(128)
  .required()
  .pattern(
    new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
    ),
  )
  .message(
    'Password must contain at least one letter, one number and one special character',
  );
const strongPassword = Joi.string()
  .min(8)
  .max(128)
  .required()
  .pattern(
    new RegExp(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
    ),
  )
  .message(
    'Password must be at least 12 characters with uppercase, lowercase, number and special character',
  );

/**
 * User registration validation schema
 */
const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(150).trim().required(),
  email,
  password: strongPassword,
  role: Joi.string().valid('ADMIN', 'ORGANIZER', 'USER').default('USER'),

  // Optional User fields
  phone: Joi.string()
    .pattern(/^[\d\s+\-()+]+$/)
    .min(7)
    .max(20)
    .optional(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional(),
  dateOfBirth: Joi.date().max('now').optional(),
  location: Joi.string().max(200).trim().optional(),
  teamClub: Joi.string().max(200).trim().optional(),
});

/**
 * User login validation schema
 */
const loginSchema = Joi.object({
  email,
  password: Joi.string().required(),
});

/**
 * Refresh token validation schema
 */
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

/**
 * Change password validation schema
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: strongPassword,
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Confirm password does not match new password',
    }),
});

/**
 * Forgot password validation schema
 */
const forgotPasswordSchema = Joi.object({
  email,
});

/**
 * Reset password validation schema
 */
const resetPasswordSchema = Joi.object({
  email,
  token: Joi.string().required(),
  password: strongPassword,
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password does not match password',
  }),
});

const otpVerifySchema = Joi.object({
  email,
  token: Joi.string().required(),
});

/**
 * Update profile validation schema
 */
const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(150).trim().optional().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 150 characters',
  }),

  phone: Joi.string().min(7).max(20).trim().allow(null).empty('').optional(),

  avatarUrl: Joi.string().uri().trim().allow(null).empty('').optional(),

  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional(),

  dateOfBirth: Joi.date().max('now').iso().optional().messages({
    'date.max': 'Date of birth cannot be in the future',
    'date.format': 'Please use a valid ISO date format (YYYY-MM-DD)',
  }),

  location: Joi.string().max(200).trim().allow(null).empty('').optional(),
  teamClub: Joi.string().max(200).trim().allow(null).empty('').optional(),

  // --- OrganizerProfile Table Fields ---
  organizerProfile: Joi.object({
    organizationName: Joi.string().min(2).max(100).trim().optional(),
    bio: Joi.string().max(500).trim().allow(null).empty('').optional(),
    website: Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .trim()
      .allow(null)
      .empty('')
      .optional()
      .messages({
        'string.uri':
          'Please enter a valid website URL starting with http:// or https://',
      }),
  }).optional(),
}).options({
  stripUnknown: true,
  abortEarly: false,
});

module.exports = {
  registerSchema,
  loginSchema,
  otpVerifySchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
};
