const express = require('express');
const { validate } = require('../../validators/common.validator');
const {
  createToolkitSchema,
  reviewToolkitSchema,
} = require('../../validators/toolkitRequest.validator');
const ToolkitController = require('./toolkitRequest.controller');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

const controller = new ToolkitController();

// Submit - Public or User
router.post(
  '/',
  authenticate,
  authorize(['ORGANIZER']),
  validate(createToolkitSchema),
  controller.submitRequest,
);
// Admin Routes
router.get('/', authenticate, authorize(['ADMIN']), controller.getAllRequests);
router.get(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  controller.getRequestById,
);
router.patch(
  '/:id/review',
  authenticate,
  authorize(['ADMIN']),
  validate(reviewToolkitSchema),
  controller.reviewRequest,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  controller.deleteRequestById,
);

module.exports = router;
