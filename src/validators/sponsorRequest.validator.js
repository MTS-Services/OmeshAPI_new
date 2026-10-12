const Joi = require('joi');

const isInKind = { is: 'IN_KIND' };

const createSponsorRequestSchema = Joi.object({
  supportType: Joi.string()
    .valid('SPONSORSHIP', 'DONATION', 'IN_KIND')
    .required(),
  name: Joi.string().trim().max(150).required(),
  phone: Joi.string().trim().max(30).required(),
  email: Joi.string().trim().email().required(),
  eventName: Joi.string().trim().max(200).allow('', null),
  message: Joi.string().trim().max(2000).allow('', null),
  amount: Joi.when('supportType', {
    ...isInKind,
    then: Joi.number().positive().precision(2).max(100000).allow('', null),
    otherwise: Joi.number().positive().precision(2).max(100000).required(),
  }),
  itemDescription: Joi.when('supportType', {
    ...isInKind,
    then: Joi.string().trim().max(1000).required(),
    otherwise: Joi.any().strip(),
  }),
});

module.exports = { createSponsorRequestSchema };
