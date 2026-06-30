const Joi = require('joi');

const promoSchema = {
  create: Joi.object({
    code: Joi.string().uppercase().required().messages({
      'string.empty': 'Promo code cannot be empty',
      'any.required': 'Promo code is required',
    }),
    startsAt: Joi.date().iso().required(),
    expiresAt: Joi.date().iso().greater(Joi.ref('startsAt')).required(),
    isActive: Joi.boolean().default(true),
    allowedEmails: Joi.array().items(Joi.string().email()).optional(),
    description: Joi.string().optional().allow('', null),
  }),

  update: Joi.object({
    description: Joi.string().optional().allow(''),
    isActive: Joi.boolean().optional(),
    startsAt: Joi.date().iso().optional(),
    expiresAt: Joi.date().iso().optional(),
    allowedEmails: Joi.array().items(Joi.string().email()).optional(),
  }).min(1),

  apply: Joi.object({
    code: Joi.string().required(),
    emails: Joi.array().items(Joi.string().email()).required(),
    eventId: Joi.string().required(),
  }),
};

module.exports = promoSchema;
