import type { RentalsReportResponse } from '../types/report.types';

export class ReportService {
  async getRentalsReport(_month: string, _vehicleId?: number): Promise<RentalsReportResponse> {
    throw new Error('Not implemented');
  }
}
