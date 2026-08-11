import Joi from 'joi';

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

export const createRentalSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive().required(),
  customer_name: Joi.string().trim().required(),
  customer_phone: Joi.string().trim().required(),
  start_date: Joi.string().pattern(dateOnlyPattern).required().messages({
    'string.pattern.base': 'start_date must be YYYY-MM-DD',
  }),
  end_date: Joi.string().pattern(dateOnlyPattern).required().messages({
    'string.pattern.base': 'end_date must be YYYY-MM-DD',
  }),
}).custom((value, helpers) => {
  if (value.end_date < value.start_date) {
    return helpers.error('any.custom', { message: 'end_date must be on or after start_date' });
  }

  return value;
});

export const updateRentalSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive(),
  customer_name: Joi.string().trim(),
  customer_phone: Joi.string().trim(),
  start_date: Joi.string().pattern(dateOnlyPattern).messages({
    'string.pattern.base': 'start_date must be YYYY-MM-DD',
  }),
  end_date: Joi.string().pattern(dateOnlyPattern).messages({
    'string.pattern.base': 'end_date must be YYYY-MM-DD',
  }),
  status: Joi.string().valid('booked', 'ongoing', 'completed', 'cancelled'),
})
  .min(1)
  .custom((value, helpers) => {
    if (value.start_date && value.end_date && value.end_date < value.start_date) {
      return helpers.error('any.custom', { message: 'end_date must be on or after start_date' });
    }

    return value;
  });

export const listRentalsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  vehicle_id: Joi.number().integer().positive(),
  status: Joi.string().valid('booked', 'ongoing', 'completed', 'cancelled'),
  start_date: Joi.string().pattern(dateOnlyPattern).messages({
    'string.pattern.base': 'start_date must be YYYY-MM-DD',
  }),
  end_date: Joi.string().pattern(dateOnlyPattern).messages({
    'string.pattern.base': 'end_date must be YYYY-MM-DD',
  }),
}).custom((value, helpers) => {
  if (value.start_date && value.end_date && value.end_date < value.start_date) {
    return helpers.error('any.custom', { message: 'end_date must be on or after start_date' });
  }

  return value;
});

export const rentalIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
