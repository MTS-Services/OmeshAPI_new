/**
 * Main API routes index
 * Consolidates all module routes under /api/v1
 */
const express = require('express');
const router = express.Router();

// Import module routes
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/user/user.routes');
const eventRoutes = require('../modules/event/event.route');
const trainingPlanRoutes = require('../modules/trainingPlan/trainingPlan.routes');
const trainingPlanCategoryRoutes = require('../modules/trainingPlanCategory/trainingPlanCategory.routers');
const trainingPlanEnrollmentRoutes = require('../modules/trainingEnrollment/trainingEnrollment.routes');
const toolkitRoutes = require('../modules/toolkitRequest/toolkitRequest.route');
const payRequestRoutes = require('../modules/payoutRequest/payoutRequest.route');
const uploadRoutes = require('../modules/upload/upload.route');
const platformSettingRoutes = require('../modules/platformSetting/platformSetting.route');
const eventRegistrationRoutes = require('../modules/eventRegistration/eventRegistration.route');
const dashboardRoutes = require('../modules/dashboard/dashboard.route');
const paymentRoutes = require('../modules/payment/payment.route');
const promoCodeRoutes = require('../modules/promoCode/promoCode.route');
const contactRoutes = require('../modules/questions/questions.route');
const apiDocsHandler = require('../modules/docs/apiDocsHandler');

// Health check endpoint
router.get('/health', (req, res) => {
  /**
   * @method GET /api/v1/health
   * @description Health check endpoint to verify API status
   * @example GET /api/v1/health
   */
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'connected',
      api: 'running',
    },
  };

  res.sendSuccess(healthData, 'API is running healthy');
});

// API documentation endpoint
router.get('/docs', apiDocsHandler);

// Mount module routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/training-plan-category', trainingPlanCategoryRoutes);
router.use('/training-plans', trainingPlanRoutes);
router.use('/training-enrollment', trainingPlanEnrollmentRoutes);
router.use('/toolkit', toolkitRoutes);
router.use('/pay-request', payRequestRoutes);
router.use('/platform-setting', platformSettingRoutes);
router.use('/upload', uploadRoutes);
router.use('/event-registration', eventRegistrationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/payment', paymentRoutes);
router.use('/promo', promoCodeRoutes);
router.use('/contact', contactRoutes);

module.exports = router;
