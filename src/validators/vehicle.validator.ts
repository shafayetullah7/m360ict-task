import Joi from 'joi';

export const createVehicleSchema = Joi.object({
  name: Joi.string().trim().required(),
  plate_number: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  daily_rate: Joi.number().positive().required(),
});

export const updateVehicleSchema = Joi.object({
  name: Joi.string().trim(),
  plate_number: Joi.string().trim(),
  category: Joi.string().trim(),
  daily_rate: Joi.number().positive(),
});

export const listVehiclesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().trim(),
  search: Joi.string().trim(),
});

export const vehicleIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
