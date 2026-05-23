/**
 * User Management Routes
 * Defines all user management endpoints with appropriate middleware
 */
const express = require('express');
const UserController = require('./user.controller');
const {
  authenticate,
  authorize,
  authorizeOwner,
} = require('../../middlewares/auth');
const {
  validate,
  validateQuery,
  validateParams,
} = require('../../validators/common.validator');
const {
  paginationSchema,
  id,
  roleEnum,
} = require('../../validators/common.validator');
const Joi = require('joi');

const router = express.Router();
const userController = new UserController();

// ╭─────────────────────────────────────────────────────────╮
// │                   VALIDATION SCHEMAS                    │
// ╰─────────────────────────────────────────────────────────╯

// User creation schema
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string()
    .min(12)
    .max(128)
    .required()
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
      ),
    )
    .message(
      'Password must be at least 12 characters with uppercase, lowercase, number and special character',
    ),
  phone: Joi.string()
    .pattern(/^[\d\s\+\-\(\)]+$/)
    .min(10)
    .max(20)
    .optional(),
  address: Joi.string().max(500).optional(),
  ppsNumber: Joi.string()
    .pattern(/^[0-9]{7}[A-Z]{1,2}$/)
    .optional(),
  avatar: Joi.string().uri().optional(),
  role: roleEnum.required(),

  // Landlord specific
  dateOfBirth: Joi.date().max('now').when('role', {
    is: 'LANDLORD',
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),
  pps: Joi.string()
    .pattern(/^[0-9]{7}[A-Z]{1,2}$/)
    .when('role', {
      is: 'LANDLORD',
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
  pps2: Joi.string()
    .pattern(/^[0-9]{7}[A-Z]{1,2}$/)
    .when('role', {
      is: 'LANDLORD',
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),

  // Tenant specific
  moveInDate: Joi.date().when('role', {
    is: 'TENANT',
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }),
  status: Joi.string()
    .valid('ACTIVE', 'NOTICE', 'EXPIRED', 'TERMINATED')
    .when('role', {
      is: 'TENANT',
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
});

// User update schema
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  phone: Joi.string()
    .pattern(/^[\d\s\+\-\(\)]+$/)
    .min(10)
    .max(20)
    .optional(),
  address: Joi.string().max(500).optional(),
  ppsNumber: Joi.string()
    .pattern(/^[0-9]{7}[A-Z]{1,2}$/)
    .optional(),
  avatar: Joi.string().uri().optional(),
  role: roleEnum.optional(),
});

// User list query schema
const userListQuerySchema = paginationSchema.keys({
  role: roleEnum.optional(),
  status: Joi.string().optional(),
});

// User role params schema
const roleParamsSchema = Joi.object({
  role: roleEnum.required(),
});

// Search query schema
const searchQuerySchema = Joi.object({
  q: Joi.string().min(2).max(100).required(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

// Bulk action schema
const bulkActionSchema = Joi.object({
  userIds: Joi.array().items(Joi.string().required()).min(1).max(50).required(),
  action: Joi.string().valid('delete', 'changeRole').required(),
  params: Joi.object().when('action', {
    is: 'changeRole',
    then: Joi.object({
      role: roleEnum.required(),
    }).required(),
    otherwise: Joi.object().optional(),
  }),
});

// ID params schema
const idParamsSchema = Joi.object({
  id: id.required(),
});

// ╭─────────────────────────────────────────────────────────╮
// │                    ADMIN ROUTES                         │
// ╰─────────────────────────────────────────────────────────╯

/**
 * @route GET /api/v1/users
 * @desc Get paginated list of users with filters
 * @access Private (Admin Only)
 */
router.get(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validateQuery(userListQuerySchema),
  userController.getAllUsers,
);

/**
 * @route GET /api/v1/users/search
 * @desc Search users by text
 * @access Private (Admin Only)
 */
router.get(
  '/search',
  authenticate,
  authorize(['ADMIN']),
  validateQuery(searchQuerySchema),
  userController.searchUsers,
);

/**
 * @route GET /api/v1/users/role/:role
 * @desc Get users by role
 * @access Private (Admin Only)
 */
router.get(
  '/role/:role',
  authenticate,
  authorize(['ADMIN']),
  validateParams(roleParamsSchema),
  userController.getUsersByRole,
);

/**
 * @route POST /api/v1/users
 * @desc Create a new user
 * @access Private (Admin Only)
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(createUserSchema),
  userController.createUser,
);

/**
 * @route POST /api/v1/users/bulk-action
 * @desc Perform bulk actions on users
 * @access Private (Admin Only)
 */
router.post(
  '/bulk-action',
  authenticate,
  authorize(['ADMIN']),
  validate(bulkActionSchema),
  userController.bulkAction,
);

/**
 * @route GET /api/v1/users/:id
 * @desc Get detailed user information by ID
 * @access Private (Admin Only)
 */

router.get(
  '/organize-profile',
  authenticate,
  authorize(['ORGANIZER']),
  userController.getOrganizerProfileById,
);

router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateParams(idParamsSchema),
  userController.getUserById,
);

/**
 * @route PUT /api/v1/users/:id
 * @desc Update user information
 * @access Private (Admin Only)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateParams(idParamsSchema),
  validate(updateUserSchema),
  userController.updateUser,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateParams(idParamsSchema),
  userController.deleteUser,
);

// ╭─────────────────────────────────────────────────────────╮
// │                 USER DASHBOARD ROUTES                   │
// ╰─────────────────────────────────────────────────────────╯

/**
 * @route GET /api/v1/users/me/dashboard
 * @desc Get current user's dashboard statistics
 * @access Private
 */
router.get('/me/dashboard', authenticate, userController.getMyDashboard);

/**
 * @route GET /api/v1/users/me/analytics
 * @desc Get current user's analytics
 * @access Private
 */
router.get('/me/analytics', authenticate, userController.getMyAnalytics);

/**
 * @route GET /api/v1/users/:id/dashboard
 * @desc Get user's dashboard statistics
 * @access Private (Own or Admin)
 */
router.get(
  '/:id/dashboard',
  authenticate,
  validateParams(idParamsSchema),
  userController.getUserDashboardStats,
);

/**
 * @route GET /api/v1/users/:id/analytics
 * @desc Get user's analytics and insights
 * @access Private (Own or Admin)
 */
router.get(
  '/:id/analytics',
  authenticate,
  validateParams(idParamsSchema),
  userController.getUserAnalytics,
);

module.exports = router;
