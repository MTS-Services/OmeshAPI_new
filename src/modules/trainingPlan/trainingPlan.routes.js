const express = require('express');
const TrainingPlanController = require('./trainingPlan.controller');
const { validate } = require('../../validators/common.validator');
const { authenticate, authorize } = require('../../middlewares/auth');
const {
  TrainingPlanSchema,
  UpdateTrainingPlanSchema,
} = require('../../validators/trainingPlan.validator');
const trainingPlanController = new TrainingPlanController();
const router = express.Router();

/**
 * @route   POST /api/training-plans
 * @desc    Create a new training plan
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN']),
  validate(TrainingPlanSchema),
  trainingPlanController.createTrainingPlan,
);

/**
 * @route   GET /api/training-plans
 * @desc    Get all training plans with pagination and filters
 */
router.get('/', trainingPlanController.getAllTrainingPlans);

/**
 * @route   GET /api/training-plans/:id
 * @desc    Get a single training plan by ID
 */
router.get('/:id', trainingPlanController.getTrainingPlanById);

/**
 * @route   PUT /api/training-plans/:id
 * @desc    Update an existing training plan
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validate(UpdateTrainingPlanSchema),
  trainingPlanController.updateTrainingPlan,
);

/**
 * @route   DELETE /api/training-plans/:id
 * @desc    Delete a training plan
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  trainingPlanController.deleteTrainingPlan,
);

module.exports = router;
