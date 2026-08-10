import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const schema = Joi.object({
  PORT: Joi.number().port().default(4000),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow("").required(),
  DB_NAME: Joi.string().required(),
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

  DB: {
    HOST: value.DB_HOST,
    PORT: value.DB_PORT,
    USER: value.DB_USER,
    PASSWORD: value.DB_PASSWORD,
    NAME: value.DB_NAME,
  },
} as const;

export default env;
