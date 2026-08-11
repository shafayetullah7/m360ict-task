import Joi from 'joi';

export const createVehicleSchema = Joi.object({
  name: Joi.string().required(),
  plate_number: Joi.string().required(),
  category: Joi.string().required(),
  daily_rate: Joi.number().positive().required(),
});

export const updateVehicleSchema = Joi.object({
  name: Joi.string(),
  plate_number: Joi.string(),
  category: Joi.string(),
  daily_rate: Joi.number().positive(),
});

export const listVehiclesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string(),
  search: Joi.string(),
});

export const vehicleIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
