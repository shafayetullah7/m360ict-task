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
    min: 2,
    max: 10,
  },
});

export default db;