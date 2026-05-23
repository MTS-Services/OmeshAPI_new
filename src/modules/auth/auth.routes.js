/**
 * Authentication Routes
 * Defines all authentication-related endpoints with appropriate middleware
 */
const express = require('express');

const AuthController = require('./auth.controller');
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../validators/common.validator');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  otpVerifySchema,
} = require('../../validators/auth.validator');

const router = express.Router();
const authController = new AuthController();

// ╭─────────────────────────────────────────────────────────╮
// │                    PUBLIC ROUTES                        │
// ╰─────────────────────────────────────────────────────────╯

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user account
 * @access Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticate user and get tokens
 * @access Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken,
);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Request a password reset code
 * @access Public
 */
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password using verification code
 * @access Public
 */

router.post('/otp-verify', validate(otpVerifySchema), authController.verifyOtp);

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword,
);

// ╭─────────────────────────────────────────────────────────╮
// │                 AUTHENTICATED ROUTES                    │
// ╰─────────────────────────────────────────────────────────╯

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user (client-side token removal)
 * @access Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current authenticated user info
 * @access Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route GET /api/v1/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route PUT /api/v1/auth/profile
 * @desc Update current user profile
 * @access Private
 */
router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  authController.updateProfile,
);

/**
 * @route POST /api/v1/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

/**
 * @route DELETE /api/v1/auth/account
 * @desc Delete user account
 * @access Private
 */
router.delete('/account', authenticate, authController.deleteAccount);

// ╭─────────────────────────────────────────────────────────╮
// │                    ADMIN ROUTES                         │
// ╰─────────────────────────────────────────────────────────╯

/**
 * @route GET /api/v1/auth/stats
 * @desc Get user statistics
 * @access Private (Admin Only)
 */
router.get(
  '/stats',
  authenticate,
  authorize(['ADMIN']),
  authController.getUserStats,
);

module.exports = router;
