import fs from 'fs/promises';
import path from 'path';
import type {
  CreateVehicleBody,
  ListVehiclesQuery,
  PaginatedVehiclesResponse,
  UpdateVehicleBody,
  Vehicle,
} from '../types/vehicle.types';
import env from '../config/env';
import db from '../config/db';
import { VehicleRepository } from '../repositories/VehicleRepository';
import { lockVehiclesForBooking } from '../utils/db-lock.utils';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === '23505'
  );
}

export class VehicleService {
  private readonly repository = new VehicleRepository();
  private readonly uploadDir = path.resolve(env.UPLOAD_PATH);

  async list(query: ListVehiclesQuery): Promise<PaginatedVehiclesResponse> {
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

  async getById(id: number): Promise<Vehicle> {
    const vehicle = await this.repository.findById(id);

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    return vehicle;
  }

  async create(body: CreateVehicleBody, photoPath?: string): Promise<Vehicle> {
    try {
      return await this.repository.create(body, photoPath);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError('Plate number already exists');
      }
      throw error;
    }
  }

  async update(id: number, body: UpdateVehicleBody, photoPath?: string): Promise<Vehicle> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new NotFoundError('Vehicle not found');
    }

    const hasBodyUpdate = Object.keys(body).length > 0;
    if (!hasBodyUpdate && !photoPath) {
      throw new ValidationError('At least one field or photo is required');
    }

    if (photoPath && existing.photo_path) {
      await this.removePhotoFile(existing.photo_path);
    }

    try {
      const updated = await this.repository.update(id, body, photoPath);

      if (!updated) {
        throw new NotFoundError('Vehicle not found');
      }

      return updated;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError('Plate number already exists');
      }
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    await db.transaction(async (trx) => {
      const lockedVehicles = await lockVehiclesForBooking(trx, [id]);

      if (!lockedVehicles.get(id)) {
        throw new NotFoundError('Vehicle not found');
      }

      const deleted = await this.repository.softDelete(id, trx);

      if (!deleted) {
        throw new NotFoundError('Vehicle not found');
      }
    });
  }

  private async removePhotoFile(photoPath: string): Promise<void> {
    const filePath = path.join(this.uploadDir, photoPath);

    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore missing files on disk.
    }
  }
}
