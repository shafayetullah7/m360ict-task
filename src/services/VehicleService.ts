import type {
  CreateVehicleBody,
  ListVehiclesQuery,
  PaginatedVehiclesResponse,
  UpdateVehicleBody,
  Vehicle,
} from '../types/vehicle.types';
import { VehicleRepository } from '../repositories/VehicleRepository';
import { NotFoundError } from '../utils/errors';

export class VehicleService {
  private readonly repository = new VehicleRepository();

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
