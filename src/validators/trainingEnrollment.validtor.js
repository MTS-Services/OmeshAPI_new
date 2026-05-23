const Joi = require('joi');

const createEnrollmentSchema = Joi.object({
  planId: Joi.string().required(),
});

const updateEnrollmentSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'COMPLETED', 'CANCELLED').required(),
});

module.exports = { createEnrollmentSchema, updateEnrollmentSchema };
