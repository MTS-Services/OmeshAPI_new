const express = require('express');
const { validate } = require('../../validators/common.validator');
const {
  createSponsorRequestSchema,
} = require('../../validators/sponsorRequest.validator');
const SponsorRequestController = require('./sponsorRequest.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

const controller = new SponsorRequestController();

// Public
router.post(
  '/',
  validate(createSponsorRequestSchema),
  controller.submitRequest,
);
router.post('/wipay/confirm', controller.wipayConfirm);
router.get('/wipay/confirm', controller.wipayConfirm);

// Admin
router.get('/', authenticate, authorize(['ADMIN']), controller.getAllRequests);
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  controller.deleteRequest,
);

module.exports = router;
