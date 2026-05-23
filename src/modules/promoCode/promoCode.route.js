const express = require('express');
const { validate } = require('../../validators/common.validator');
const { authenticate, authorize } = require('../../middlewares/auth');
const PromoCodeController = require('./promoCode.controller');
const promoSchema = require('../../validators/promoCode.validators');

const router = express.Router();

const controller = new PromoCodeController();

router.post(
  '/',
  authenticate,
  authorize(['ORGANIZER']),
  validate(promoSchema.create),
  controller.create,
);
router.post(
  '/apply',
  authenticate,
  validate(promoSchema.apply),
  controller.apply,
);

router.get('/', authenticate, authorize(['ORGANIZER']), controller.getAll);
router.patch(
  '/:id',
  authenticate,
  authorize(['ORGANIZER']),
  validate(promoSchema.update),
  controller.update,
);

router.delete(
  '/:id',
  authenticate,
  authorize(['ORGANIZER']),
  controller.delete,
);

module.exports = router;
