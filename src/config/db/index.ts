import knex from 'knex';
import env from '../env';

const db = knex({
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
});

export default db;
