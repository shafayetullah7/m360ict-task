import db from '../config/db';
import type {
  CreateRentalBody,
  ListRentalsQuery,
  Rental,
  RentalStatus,
  UpdateRentalBody,
} from '../types/rental.types';
import { RentalRepository } from '../repositories/RentalRepository';
import { VehicleRepository } from '../repositories/VehicleRepository';
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
  private readonly vehicleRepository = new VehicleRepository();

  async list(query: ListRentalsQuery): Promise<Rental[]> {
    return this.repository.list(query);
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
    const vehicle = await this.vehicleRepository.findById(vehicleId);

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    const days = countRentalDays(startDate, endDate);

    return calculateTotalAmount(vehicle.daily_rate, days);
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
      const vehicle = await trx('vehicles')
        .where({ id: body.vehicle_id })
        .whereNull('deleted_at')
        .forUpdate()
        .first();

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
    const existing = await this.repository.findById(id);

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

    if (datesOrVehicleChanged) {
      const vehicle = await this.vehicleRepository.findById(vehicleId);

      if (!vehicle) {
        throw new NotFoundError('Vehicle not found');
      }
    }

    if (isActiveStatus(status)) {
      await this.assertNoOverlap(vehicleId, startDate, endDate, id);
    }

    let totalAmount: number | undefined;

    if (datesOrVehicleChanged) {
      totalAmount = await this.calculateTotalAmount(vehicleId, startDate, endDate);
    }

    const updateBody: UpdateRentalBody = { ...body };

    if (body.start_date !== undefined) {
      updateBody.start_date = startDate;
    }

    if (body.end_date !== undefined) {
      updateBody.end_date = endDate;
    }

    const updated = await this.repository.update(id, updateBody, totalAmount);

    if (!updated) {
      throw new NotFoundError('Rental not found');
    }

    return updated;
  }

  async delete(id: number): Promise<void> {
    const cancelled = await this.repository.cancel(id);

    if (!cancelled) {
      throw new NotFoundError('Rental not found');
    }
  }
}
