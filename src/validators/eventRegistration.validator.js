const Joi = require('joi');

const registrationSchema = Joi.object({
  eventId: Joi.string().required(),
  source: Joi.string().valid('ONLINE', 'MANUAL_ADD').required(),
  platformFee: Joi.number().required(),
  participants: Joi.array()
    .items(
      Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        phone: Joi.string().allow(null, '').optional(),
        gender: Joi.string().allow(null, '').optional(),
        age: Joi.number().integer().optional(),
        dateOfBirth: Joi.date().iso().optional(),
        location: Joi.string().allow(null, '').optional(),
        teamClub: Joi.string().allow(null, '').optional(),
        selectedTShirtSize: Joi.string().allow(null, '').optional(),
        buyTShirt: Joi.boolean().default(false).optional(),
        status: Joi.string()
          .valid(
            'PENDING_PAYMENT',
            'CONFIRMED',
            'CANCELLED',
            'REFUNDED',
            'ATTENDED',
            'NO_SHOW',
          )
          .default('PENDING_PAYMENT')
          .optional(),
      }),
    )
    .min(1)
    .required(),
});

module.exports = { registrationSchema };
