import db from '../config/db';
import type {
  CreateRentalBody,
  ListRentalsQuery,
  PaginatedRentalsResponse,
  Rental,
  RentalStatus,
  UpdateRentalBody,
} from '../types/rental.types';
import { RentalRepository } from '../repositories/RentalRepository';
import { lockVehiclesForBooking } from '../utils/db-lock.utils';
import { countRentalDays } from '../utils/date.utils';
import { calculateTotalAmount } from '../utils/rental.utils';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

function normalizeDate(value: string | Date): string {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return value.slice(0, 10);
}

function isActiveStatus(status: RentalStatus): boolean {
  return status === 'booked' || status === 'ongoing';
}

export class RentalService {
  private readonly repository = new RentalRepository();

  async list(query: ListRentalsQuery): Promise<PaginatedRentalsResponse> {
    const { data, total } = await this.repository.list(query);

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }

  async getById(id: number): Promise<Rental> {
    const rental = await this.repository.findById(id);

    if (!rental) {
      throw new NotFoundError('Rental not found');
    }

    return rental;
  }

  async calculateTotalAmount(
    vehicleId: number,
    startDate: string,
    endDate: string,
  ): Promise<number> {
    const vehicle = await db('vehicles')
      .where({ id: vehicleId })
      .whereNull('deleted_at')
      .first();

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const days = countRentalDays(startDate, endDate);

    return calculateTotalAmount(Number(vehicle.daily_rate), days);
  }

  async assertNoOverlap(
    vehicleId: number,
    startDate: string,
    endDate: string,
    excludeRentalId?: number,
  ): Promise<void> {
    const overlappingId = await this.repository.findOverlappingActive(
      vehicleId,
      startDate,
      endDate,
      excludeRentalId,
    );

    if (overlappingId !== null) {
      throw new ConflictError('Vehicle already has an active rental for these dates');
    }
  }

  async create(body: CreateRentalBody): Promise<Rental> {
    const startDate = normalizeDate(body.start_date);
    const endDate = normalizeDate(body.end_date);

    return db.transaction(async (trx) => {
      const lockedVehicles = await lockVehiclesForBooking(trx, [body.vehicle_id]);
      const vehicle = lockedVehicles.get(body.vehicle_id);

      if (!vehicle) {
        throw new NotFoundError('Vehicle not found');
      }

      const overlappingId = await this.repository.findOverlappingActive(
        body.vehicle_id,
        startDate,
        endDate,
        undefined,
        trx,
      );

      if (overlappingId !== null) {
        throw new ConflictError('Vehicle already has an active rental for these dates');
      }

      const days = countRentalDays(startDate, endDate);
      const totalAmount = calculateTotalAmount(Number(vehicle.daily_rate), days);

      return this.repository.create(
        {
          vehicle_id: body.vehicle_id,
          customer_name: body.customer_name,
          customer_phone: body.customer_phone,
          start_date: startDate,
          end_date: endDate,
        },
        totalAmount,
        trx,
      );
    });
  }

  async update(id: number, body: UpdateRentalBody): Promise<Rental> {
    return db.transaction(async (trx) => {
      const existing = await this.repository.findByIdForUpdate(id, trx);

      if (!existing) {
        throw new NotFoundError('Rental not found');
      }

      const vehicleId = body.vehicle_id ?? existing.vehicle_id;
      const startDate =
        body.start_date !== undefined ? normalizeDate(body.start_date) : existing.start_date;
      const endDate =
        body.end_date !== undefined ? normalizeDate(body.end_date) : existing.end_date;
      const status = body.status ?? existing.status;

      if (endDate < startDate) {
        throw new ValidationError('end_date must be on or after start_date');
      }

      const datesOrVehicleChanged =
        body.vehicle_id !== undefined ||
        body.start_date !== undefined ||
        body.end_date !== undefined;

      const needsVehicleLocks = datesOrVehicleChanged || isActiveStatus(status);

      let lockedVehicles: Awaited<ReturnType<typeof lockVehiclesForBooking>> | undefined;

      if (needsVehicleLocks) {
        const vehicleIds =
          vehicleId === existing.vehicle_id
            ? [vehicleId]
            : [existing.vehicle_id, vehicleId];

        lockedVehicles = await lockVehiclesForBooking(trx, vehicleIds);

        if (!lockedVehicles.get(vehicleId)) {
          throw new NotFoundError('Vehicle not found');
        }

        if (vehicleId !== existing.vehicle_id && !lockedVehicles.get(existing.vehicle_id)) {
          throw new NotFoundError('Vehicle not found');
        }
      }

      if (isActiveStatus(status)) {
        const overlappingId = await this.repository.findOverlappingActive(
          vehicleId,
          startDate,
          endDate,
          id,
          trx,
        );

        if (overlappingId !== null) {
          throw new ConflictError('Vehicle already has an active rental for these dates');
        }
      }

      let totalAmount: number | undefined;

      if (datesOrVehicleChanged) {
        const vehicle = lockedVehicles?.get(vehicleId);

        if (!vehicle) {
          throw new NotFoundError('Vehicle not found');
        }

        const days = countRentalDays(startDate, endDate);
        totalAmount = calculateTotalAmount(Number(vehicle.daily_rate), days);
      }

      const updateBody: UpdateRentalBody = { ...body };

      if (body.start_date !== undefined) {
        updateBody.start_date = startDate;
      }

      if (body.end_date !== undefined) {
        updateBody.end_date = endDate;
      }

      const updated = await this.repository.update(id, updateBody, totalAmount, trx);

      if (!updated) {
        throw new NotFoundError('Rental not found');
      }

      return updated;
    });
  }

  async delete(id: number): Promise<void> {
    await db.transaction(async (trx) => {
      const existing = await this.repository.findByIdForUpdate(id, trx);

      if (!existing) {
        throw new NotFoundError('Rental not found');
      }

      await lockVehiclesForBooking(trx, [existing.vehicle_id]);

      const cancelled = await this.repository.cancel(id, trx);

      if (!cancelled) {
        throw new NotFoundError('Rental not found');
      }
    });
  }
}
