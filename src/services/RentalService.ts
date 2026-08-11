import type {
  CreateRentalBody,
  ListRentalsQuery,
  Rental,
  UpdateRentalBody,
} from '../types/rental.types';
import { RentalRepository } from '../repositories/RentalRepository';
import { NotFoundError } from '../utils/errors';

export class RentalService {
  private readonly repository = new RentalRepository();

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

  async create(_body: CreateRentalBody): Promise<Rental> {
    throw new Error('Not implemented');
  }

  async update(_id: number, _body: UpdateRentalBody): Promise<Rental> {
    throw new Error('Not implemented');
  }

  async delete(_id: number): Promise<void> {
    throw new Error('Not implemented');
  }
}
