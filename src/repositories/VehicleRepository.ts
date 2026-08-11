import type { Vehicle } from '../types/vehicle.types';

export class VehicleRepository {
  async findById(_id: number): Promise<Vehicle | null> {
    throw new Error('Not implemented');
  }
}
