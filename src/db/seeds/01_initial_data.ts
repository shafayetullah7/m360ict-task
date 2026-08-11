import type { Knex } from 'knex';
import argon2 from 'argon2';

const SEED_STAFF_EMAIL = 'staff@example.com';

const SEED_VEHICLES = [
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
] as const;

type SeedRental = {
  plate_number: string;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: 'booked' | 'ongoing' | 'completed' | 'cancelled';
};

const SEED_RENTALS: SeedRental[] = [
  {
    plate_number: 'SEED-1001',
    customer_name: 'Alice',
    customer_phone: '111-0001',
    start_date: '2026-08-01',
    end_date: '2026-08-05',
    total_amount: 250.0,
    status: 'booked',
  },
  {
    plate_number: 'SEED-1001',
    customer_name: 'Boundary Guest',
    customer_phone: '111-0002',
    start_date: '2026-07-29',
    end_date: '2026-08-03',
    total_amount: 300.0,
    status: 'completed',
  },
  {
    plate_number: 'SEED-1002',
    customer_name: 'Carol',
    customer_phone: '222-0001',
    start_date: '2026-09-01',
    end_date: '2026-09-03',
    total_amount: 225.0,
    status: 'cancelled',
  },
];

async function isSeedComplete(knex: Knex): Promise<boolean> {
  const staff = await knex('staff').where({ email: SEED_STAFF_EMAIL }).first();
  const camry = await knex('vehicles').where({ plate_number: 'SEED-1001' }).first();
  const boundaryRental = await knex('rentals')
    .where({
      customer_name: 'Boundary Guest',
      start_date: '2026-07-29',
      end_date: '2026-08-03',
    })
    .first();

  return Boolean(staff && camry && boundaryRental);
}

export async function seed(knex: Knex): Promise<void> {
  if (await isSeedComplete(knex)) {
    console.log('Seed skipped: initial data already exists');
    return;
  }

  const passwordHash = await argon2.hash('password123');

  await knex('staff')
    .insert({
      email: SEED_STAFF_EMAIL,
      password_hash: passwordHash,
      name: 'Staff User',
    })
    .onConflict('email')
    .ignore();

  for (const vehicle of SEED_VEHICLES) {
    await knex('vehicles').insert(vehicle).onConflict('plate_number').ignore();
  }

  const vehiclesByPlate = new Map(
    (
      await knex('vehicles')
        .whereIn('plate_number', SEED_VEHICLES.map((vehicle) => vehicle.plate_number))
        .select('id', 'plate_number')
    ).map((row) => [row.plate_number, row.id]),
  );

  for (const rental of SEED_RENTALS) {
    const vehicleId = vehiclesByPlate.get(rental.plate_number);

    if (!vehicleId) {
      throw new Error(`Seed vehicle not found for plate ${rental.plate_number}`);
    }

    const exists = await knex('rentals')
      .where({
        vehicle_id: vehicleId,
        customer_name: rental.customer_name,
        start_date: rental.start_date,
        end_date: rental.end_date,
      })
      .first();

    if (exists) {
      continue;
    }

    await knex('rentals').insert({
      vehicle_id: vehicleId,
      customer_name: rental.customer_name,
      customer_phone: rental.customer_phone,
      start_date: rental.start_date,
      end_date: rental.end_date,
      total_amount: rental.total_amount,
      status: rental.status,
    });
  }

  console.log('Seed complete: initial data applied');
}
