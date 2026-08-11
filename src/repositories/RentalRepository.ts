import type { Rental } from '../types/rental.types';

export class RentalRepository {
  async findById(_id: number): Promise<Rental | null> {
    throw new Error('Not implemented');
  }
}
