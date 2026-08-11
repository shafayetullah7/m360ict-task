import type { Rental } from '../types/rental.types';

export class ReportRepository {
  async getMonthlyStats(_month: string, _vehicleId?: number): Promise<Rental[]> {
    throw new Error('Not implemented');
  }
}
