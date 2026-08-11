import Joi from 'joi';

const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

export const rentalsReportQuerySchema = Joi.object({
  month: Joi.string().pattern(monthPattern).required().messages({
    'string.pattern.base': 'month must be YYYY-MM',
  }),
  vehicle_id: Joi.number().integer().positive(),
});
