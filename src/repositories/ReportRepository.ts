import type { RentalsReportQuery, VehicleReportRow } from '../types/report.types';

export class ReportRepository {
  async getMonthlyStats(_query: RentalsReportQuery): Promise<VehicleReportRow[]> {
    throw new Error('Not implemented');
  }
}
