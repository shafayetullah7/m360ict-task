import type { Knex } from 'knex';
import env from './src/config/env';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: env.DB.HOST,
    port: env.DB.PORT,
    user: env.DB.USER,
    password: env.DB.PASSWORD,
    database: env.DB.NAME,
  },
  pool: {
    min: env.DB.POOL_MIN,
    max: env.DB.POOL_MAX,
  },
  migrations: {
    directory: './src/db/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './src/db/seeds',
    extension: 'ts',
  },
};

export default config;
