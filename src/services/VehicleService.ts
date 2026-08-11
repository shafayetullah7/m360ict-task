import type { CreateVehicleBody, UpdateVehicleBody, Vehicle } from '../types/vehicle.types';

export class VehicleService {
  async list(_query: Record<string, unknown>): Promise<{ data: Vehicle[]; meta: unknown }> {
    throw new Error('Not implemented');
  }

  async getById(_id: number): Promise<Vehicle> {
    throw new Error('Not implemented');
  }

  async create(_body: CreateVehicleBody, _photoPath?: string): Promise<Vehicle> {
    throw new Error('Not implemented');
  }

  async update(_id: number, _body: UpdateVehicleBody, _photoPath?: string): Promise<Vehicle> {
    throw new Error('Not implemented');
  }

  async delete(_id: number): Promise<void> {
    throw new Error('Not implemented');
  }
}
