import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('rentals', (table) => {
    table.increments('id').primary();
    table
      .integer('vehicle_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('vehicles');
    table.string('customer_name').notNullable();
    table.string('customer_phone').notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.decimal('total_amount', 10, 2).notNullable();
    table.string('status').notNullable().defaultTo('booked');
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.index(['vehicle_id', 'start_date', 'end_date']);
  });

  await knex.raw(`
    ALTER TABLE rentals
    ADD CONSTRAINT rentals_status_check
    CHECK (status IN ('booked', 'ongoing', 'completed', 'cancelled'))
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('rentals');
}
