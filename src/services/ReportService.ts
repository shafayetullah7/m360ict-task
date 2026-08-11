import type {
  RentalsReportQuery,
  RentalsReportResponse,
  TopVehicleReportRow,
  VehicleReportRow,
} from '../types/report.types';
import { ReportRepository } from '../repositories/ReportRepository';

export class ReportService {
  private readonly repository = new ReportRepository();

  async getRentalsReport(query: RentalsReportQuery): Promise<RentalsReportResponse> {
    const vehicles = await this.repository.getMonthlyStats(query);
    const topVehicle = this.findTopVehicle(vehicles);

    return {
      month: query.month,
      vehicles,
      top_vehicle: topVehicle,
    };
  }

  private findTopVehicle(vehicles: VehicleReportRow[]): TopVehicleReportRow | null {
    if (vehicles.length === 0) {
      return null;
    }

    const top = vehicles.reduce((best, current) =>
      current.revenue > best.revenue ? current : best,
    );

    return {
      id: top.id,
      name: top.name,
      revenue: top.revenue,
    };
  }
}
