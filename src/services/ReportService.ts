import type { RentalsReportQuery, RentalsReportResponse } from '../types/report.types';

export class ReportService {
  async getRentalsReport(_query: RentalsReportQuery): Promise<RentalsReportResponse> {
    throw new Error('Not implemented');
  }
}
