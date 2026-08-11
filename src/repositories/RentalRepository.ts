import db from '../config/db';
import type { ListRentalsQuery, Rental, RentalStatus } from '../types/rental.types';

type RentalRow = {
  id: number;
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: Date | string;
  end_date: Date | string;
  total_amount: string | number;
  status: RentalStatus;
  created_at: Date | string;
  updated_at: Date | string;
};

export class RentalRepository {
  private formatDate(value: Date | string): string {
    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return String(value).slice(0, 10);
  }

  private mapRow(row: RentalRow): Rental {
    return {
      id: row.id,
      vehicle_id: row.vehicle_id,
      customer_name: row.customer_name,
      customer_phone: row.customer_phone,
      start_date: this.formatDate(row.start_date),
      end_date: this.formatDate(row.end_date),
      total_amount: Number(row.total_amount),
      status: row.status,
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
    };
  }

  async findById(id: number): Promise<Rental | null> {
    const row = await db<RentalRow>('rentals').where({ id }).first();

    return row ? this.mapRow(row) : null;
  }

  async list(query: ListRentalsQuery): Promise<Rental[]> {
    let queryBuilder = db<RentalRow>('rentals');

    if (query.vehicle_id !== undefined) {
      queryBuilder = queryBuilder.where('vehicle_id', query.vehicle_id);
    }

    if (query.status !== undefined) {
      queryBuilder = queryBuilder.where('status', query.status);
    }

    if (query.start_date !== undefined) {
      queryBuilder = queryBuilder.where('end_date', '>=', query.start_date);
    }

    if (query.end_date !== undefined) {
      queryBuilder = queryBuilder.where('start_date', '<=', query.end_date);
    }

    const rows = await queryBuilder.orderBy('id', 'asc');

    return rows.map((row) => this.mapRow(row));
  }
}
