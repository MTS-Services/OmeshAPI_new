const Joi = require('joi');

const createCategorySchema = Joi.object({
  plan: Joi.string().min(3).max(50).required(),
  slug: Joi.string().min(3).max(50).required(),
  description: Joi.string().min(10).max(500).required(),
});

const updateCategorySchema = Joi.object({
  plan: Joi.string().min(3).max(50).optional(),
  slug: Joi.string().min(3).max(50).optional(),
  description: Joi.string().min(10).max(500).optional(),
}).min(1);

module.exports = { createCategorySchema, updateCategorySchema };
