import db from '../config/db';
import type { RentalsReportQuery, VehicleReportRow } from '../types/report.types';

type MonthlyStatsRow = {
  id: number;
  name: string;
  total_bookings: string | number;
  days_rented: string | number;
  revenue: string | number;
};

export class ReportRepository {
  /**
   * Aggregates rental stats per vehicle for a calendar month.
   * Days and revenue clip to month boundaries:
   *   clipped_days = LEAST(end_date, month_end) - GREATEST(start_date, month_start) + 1
   * Cancelled rentals are excluded.
   */
  async getMonthlyStats(query: RentalsReportQuery): Promise<VehicleReportRow[]> {
    const [year, month] = query.month.split('-').map(Number);
    const monthStart = `${query.month}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const monthEnd = `${query.month}-${String(lastDay).padStart(2, '0')}`;

    const bindings: (number | string)[] = [
      monthEnd,
      monthStart,
      monthEnd,
      monthStart,
      monthEnd,
      monthStart,
    ];

    let vehicleFilter = '';
    if (query.vehicle_id !== undefined) {
      vehicleFilter = 'AND v.id = ?';
      bindings.push(query.vehicle_id);
    }

    const result = await db.raw(
      `
      SELECT
        v.id,
        v.name,
        COUNT(r.id) AS total_bookings,
        SUM(
          LEAST(r.end_date, ?::date) - GREATEST(r.start_date, ?::date) + 1
        ) AS days_rented,
        ROUND(
          SUM(
            v.daily_rate * (
              LEAST(r.end_date, ?::date) - GREATEST(r.start_date, ?::date) + 1
            )
          ),
          2
        ) AS revenue
      FROM rentals r
      INNER JOIN vehicles v ON v.id = r.vehicle_id
      WHERE r.start_date <= ?::date
        AND r.end_date >= ?::date
        AND r.status NOT IN ('cancelled')
        AND v.deleted_at IS NULL
        ${vehicleFilter}
      GROUP BY v.id, v.name
      ORDER BY v.id ASC
      `,
      bindings,
    );

    const rows = result.rows as MonthlyStatsRow[];

    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      total_bookings: Number(row.total_bookings),
      days_rented: Number(row.days_rented),
      revenue: Number(row.revenue),
    }));
  }
}
