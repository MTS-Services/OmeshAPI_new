const express = require('express');
const router = express.Router();
const CategoryController = require('./trainingPlanCategory.controller');
const { validate } = require('../../validators/common.validator');
const {
  createCategorySchema,
  updateCategorySchema,
} = require('../../validators/trainingPlanCategory.validator');
const { authenticate, authorize } = require('../../middlewares/auth');

const controller = new CategoryController();

router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(createCategorySchema),
  controller.create,
);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(updateCategorySchema),
  controller.update,
);
router.delete('/:id', authenticate, authorize(['ADMIN']), controller.delete);

module.exports = router;
