const Joi = require('joi');

const UpdateSettingSchema = Joi.object({
  platformFeePct: Joi.number().min(0).max(20).precision(2),
  currency: Joi.string().length(3).uppercase(),
});

module.exports = { UpdateSettingSchema };
