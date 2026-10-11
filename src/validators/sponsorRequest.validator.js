const Joi = require('joi');

const createSponsorRequestSchema = Joi.object({
  supportType: Joi.string().valid('SPONSORSHIP', 'DONATION').required(),
  name: Joi.string().trim().max(150).required(),
  phone: Joi.string().trim().max(30).required(),
  email: Joi.string().trim().email().required(),
  eventName: Joi.string().trim().max(200).allow('', null),
  message: Joi.string().trim().max(2000).allow('', null),
  amount: Joi.number().positive().precision(2).max(100000).required(),
});

module.exports = { createSponsorRequestSchema };
