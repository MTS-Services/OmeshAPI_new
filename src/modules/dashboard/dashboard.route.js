const express = require('express');
const { authorize, authenticate } = require('../../middlewares/auth');
const DashboardController = require('./dashboard.controller');
const router = express.Router();

const controller = new DashboardController();

router.get('/admin-stats', authenticate, controller.dashboardAdminStats);
router.get(
  '/admin-sales-count',
  authenticate,
  controller.dashboardAdminSalesCount,
);
router.get(
  '/organizer-stats',
  authenticate,
  authorize(['ORGANIZER']),
  controller.dashboardOrganizerStats,
);
router.get(
  '/organizer-sales-count',
  authenticate,
  authorize(['ORGANIZER']),
  controller.dashboardOrganizerSalesCount,
);

router.get(
  '/organizer-top-event',
  authenticate,
  authorize(['ORGANIZER']),
  controller.getTopEventsOrganizer,
);

router.get('/organizer-value-event/:id', controller.getTakaEvent);

module.exports = router;
