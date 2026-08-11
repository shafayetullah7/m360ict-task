export interface VehicleReportRow {
  id: number;
  name: string;
  total_bookings: number;
  days_rented: number;
  revenue: number;
}

export interface RentalsReportResponse {
  month: string;
  vehicles: VehicleReportRow[];
  top_vehicle: {
    id: number;
    name: string;
    revenue: number;
  } | null;
}
