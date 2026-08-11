import type { CreateRentalBody, ListRentalsQuery, Rental, UpdateRentalBody } from '../types/rental.types';

export class RentalService {
  async list(_query: ListRentalsQuery): Promise<Rental[]> {
    throw new Error('Not implemented');
  }

  async getById(_id: number): Promise<Rental> {
    throw new Error('Not implemented');
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
