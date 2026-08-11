import type { Knex } from 'knex';
import argon2 from 'argon2';

export async function seed(knex: Knex): Promise<void> {
  await knex('rentals').del();
  await knex('vehicles').del();
  await knex('staff').del();

  const passwordHash = await argon2.hash('password123');

  await knex('staff').insert({
    email: 'staff@example.com',
    password_hash: passwordHash,
    name: 'Staff User',
  });

  const vehicles = await knex('vehicles')
    .insert([
      {
        name: 'Toyota Camry',
        plate_number: 'SEED-1001',
        category: 'sedan',
        daily_rate: 50.0,
      },
      {
        name: 'Ford Explorer',
        plate_number: 'SEED-1002',
        category: 'suv',
        daily_rate: 75.0,
      },
      {
        name: 'Honda Civic',
        plate_number: 'SEED-1003',
        category: 'sedan',
        daily_rate: 45.0,
      },
    ])
    .returning(['id']);

  const camryId = vehicles[0].id;
  const explorerId = vehicles[1].id;

  await knex('rentals').insert([
    {
      vehicle_id: camryId,
      customer_name: 'Alice',
      customer_phone: '111-0001',
      start_date: '2026-08-01',
      end_date: '2026-08-05',
      total_amount: 250.0,
      status: 'booked',
    },
    {
      vehicle_id: camryId,
      customer_name: 'Boundary Guest',
      customer_phone: '111-0002',
      start_date: '2026-07-29',
      end_date: '2026-08-03',
      total_amount: 300.0,
      status: 'completed',
    },
    {
      vehicle_id: explorerId,
      customer_name: 'Carol',
      customer_phone: '222-0001',
      start_date: '2026-09-01',
      end_date: '2026-09-03',
      total_amount: 225.0,
      status: 'cancelled',
    },
  ]);
}
