const express = require('express');
const PayoutController = require('./payoutRequest.controller');
const { authorize, authenticate } = require('../../middlewares/auth');
const router = express.Router();

const controller = new PayoutController();
router.use(authenticate);

// Organizer routes
router.post('/', authorize(['ORGANIZER']), controller.requestPayout);
router.get(
  '/my-payouts',
  authorize(['ORGANIZER']),
  controller.getOrganizerPayouts,
);

router.get(
  '/payouts-states',
  authorize(['ORGANIZER']),
  controller.getOrganizerPaymentStates,
);

// Admin routes
router.get('/admin/all', authorize(['ADMIN']), controller.getAdminPayouts);
router.patch(
  '/admin/:id/status',
  authorize(['ADMIN']),
  controller.updateStatus,
);

module.exports = router;
