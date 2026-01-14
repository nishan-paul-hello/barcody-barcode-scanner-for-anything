import * as Joi from 'joi';

export const envSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_REDIRECT_URI: Joi.string().required(),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3002),
  API_VERSION: Joi.string().default('v1'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'verbose').default('info'),
  UPC_DATABASE_API_KEY: Joi.string().allow('').optional(),
  BARCODE_LOOKUP_API_KEY: Joi.string().allow('').optional(),
  ADMIN_EMAIL: Joi.string().required(),
  ANALYTICS_HASH_SECRET: Joi.string().required(),
});
