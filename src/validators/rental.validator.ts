import Joi from 'joi';

export const createRentalSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive().required(),
  customer_name: Joi.string().required(),
  customer_phone: Joi.string().required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
});

export const updateRentalSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive(),
  customer_name: Joi.string(),
  customer_phone: Joi.string(),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso().when('start_date', {
    is: Joi.exist(),
    then: Joi.date().iso().min(Joi.ref('start_date')),
    otherwise: Joi.date().iso(),
  }),
  status: Joi.string().valid('booked', 'ongoing', 'completed', 'cancelled'),
}).min(1);

export const listRentalsQuerySchema = Joi.object({
  vehicle_id: Joi.number().integer().positive(),
  status: Joi.string().valid('booked', 'ongoing', 'completed', 'cancelled'),
  start_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  end_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
});

export const rentalIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
