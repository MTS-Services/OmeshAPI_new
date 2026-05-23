const Joi = require('joi');

const createToolkitSchema = Joi.object({
  eventName: Joi.string().required(),
  eventDate: Joi.date().iso().allow(null),
  quantity: Joi.number().integer().min(1).required(),
  designImageUrls: Joi.array().items(Joi.string()).default([]),
  needsDesignHelp: Joi.boolean().default(false),
  fullName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null),
});

const reviewToolkitSchema = Joi.object({
  status: Joi.string()
    .valid(
      'SUBMITTED',
      'IN_REVIEW',
      'QUOTED',
      'IN_PROGRESS',
      'DELIVERED',
      'CANCELLED',
    )
    .required(),
  quoteAmount: Joi.number().precision(2).allow(null),
  quoteCurrency: Joi.string().length(3).uppercase().optional(),
  adminNote: Joi.string().max(500).allow('', null),
});

module.exports = { createToolkitSchema, reviewToolkitSchema };
