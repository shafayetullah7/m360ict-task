import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const schema = Joi.object({
  PORT: Joi.number().port().default(4000),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_NAME: Joi.string().required(),
  DB_POOL_MIN: Joi.number().integer().min(0).default(2),
  DB_POOL_MAX: Joi.number().integer().min(1).default(10),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('8h'),
  UPLOAD_PATH: Joi.string().default('./uploads'),
}).unknown();

const { value, error } = schema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true,
});

if (error) {
  throw new Error(`Environment validation error:\n${error.message}`);
}

export const env = {
  PORT: value.PORT,

  JWT: {
    SECRET: value.JWT_SECRET,
    EXPIRES_IN: value.JWT_EXPIRES_IN,
  },

  UPLOAD_PATH: value.UPLOAD_PATH,

  DB: {
    HOST: value.DB_HOST,
    PORT: value.DB_PORT,
    USER: value.DB_USER,
    PASSWORD: value.DB_PASSWORD,
    NAME: value.DB_NAME,
    POOL_MIN: value.DB_POOL_MIN,
    POOL_MAX: value.DB_POOL_MAX,
  },
} as const;

export default env;
