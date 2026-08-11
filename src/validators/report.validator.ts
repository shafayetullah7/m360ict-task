import Joi from 'joi';

export const rentalsReportQuerySchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required(),
  vehicle_id: Joi.number().integer().positive(),
});
