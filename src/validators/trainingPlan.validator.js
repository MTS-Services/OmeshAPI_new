/**
 * Event validation schemas
 * Joi schemas for validating Event-related requests
 */

const Joi = require('joi');

const TrainingPlanSchema = Joi.object({
  categoryId: Joi.string().required(), // e.g., 'FIVE_K', 'TEN_K'
  durationMin: Joi.string().required(),
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().required(),
  isActive: Joi.boolean().default(true),

  weeks: Joi.array()
    .items(
      Joi.object({
        weekNo: Joi.number().integer().min(1).required(),
        days: Joi.array()
          .items(Joi.string().allow(''))
          .length(7) // Enforce exactly 7 days (Mon-Sun)
          .required(),
      }),
    )
    .min(1)
    .required(), // At least one week required
});

const UpdateTrainingPlanSchema = Joi.object({
  categoryId: Joi.string().optional(),
  durationMin: Joi.string().optional(),

  title: Joi.string().min(5).max(100).optional(),
  description: Joi.string().optional(),
  isActive: Joi.boolean().optional(),

  weeks: Joi.array()
    .items(
      Joi.object({
        weekNo: Joi.number().integer().min(1).required(), // Week update mein ID ya No. required hota hai context ke liye
        days: Joi.array().items(Joi.string().allow('')).length(7).required(),
      }),
    )
    .min(1)
    .optional(),
}).min(1);

module.exports = {
  TrainingPlanSchema,
  UpdateTrainingPlanSchema,
};
