import type { Knex } from 'knex';

/** Namespace for pg_advisory_xact_lock(classid, objid) — avoids collisions with other lock uses. */
export const ADVISORY_LOCK_NAMESPACE = {
  VEHICLE_BOOKING: 1,
} as const;

type VehicleLockRow = {
  id: number;
  daily_rate: string | number;
};

/**
 * Transaction-scoped advisory locks for vehicle booking operations.
 * Released automatically when the transaction ends.
 * IDs are sorted to prevent deadlocks when locking multiple vehicles.
 */
export async function acquireVehicleBookingLocks(
  trx: Knex.Transaction,
  vehicleIds: number[],
): Promise<void> {
  const uniqueSortedIds = [...new Set(vehicleIds)].sort((a, b) => a - b);

  for (const vehicleId of uniqueSortedIds) {
    await trx.raw('SELECT pg_advisory_xact_lock(?, ?)', [
      ADVISORY_LOCK_NAMESPACE.VEHICLE_BOOKING,
      vehicleId,
    ]);
  }
}

/**
 * Pessimistic row lock on an active (non-deleted) vehicle.
 * Call inside a transaction after acquireVehicleBookingLocks when possible.
 */
export async function lockVehicleRowForUpdate(
  trx: Knex.Transaction,
  vehicleId: number,
): Promise<VehicleLockRow | null> {
  const row = await trx<VehicleLockRow>('vehicles')
    .select('id', 'daily_rate')
    .where({ id: vehicleId })
    .whereNull('deleted_at')
    .forUpdate()
    .first();

  return row ?? null;
}

export async function lockVehiclesForBooking(
  trx: Knex.Transaction,
  vehicleIds: number[],
): Promise<Map<number, VehicleLockRow>> {
  await acquireVehicleBookingLocks(trx, vehicleIds);

  const vehicles = new Map<number, VehicleLockRow>();

  for (const vehicleId of [...new Set(vehicleIds)].sort((a, b) => a - b)) {
    const vehicle = await lockVehicleRowForUpdate(trx, vehicleId);

    if (!vehicle) {
      return vehicles;
    }

    vehicles.set(vehicleId, vehicle);
  }

  return vehicles;
}
