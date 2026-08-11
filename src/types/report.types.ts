export interface VehicleReportRow {
  id: number;
  name: string;
  total_bookings: number;
  days_rented: number;
  revenue: number;
}

export interface TopVehicleReportRow {
  id: number;
  name: string;
  revenue: number;
}

export interface RentalsReportQuery {
  month: string;
  vehicle_id?: number;
}

export interface RentalsReportResponse {
  month: string;
  vehicles: VehicleReportRow[];
  top_vehicle: TopVehicleReportRow | null;
}
