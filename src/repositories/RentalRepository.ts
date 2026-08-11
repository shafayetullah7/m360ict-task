import type { Knex } from 'knex';
import db from '../config/db';
import type {
  CreateRentalBody,
  ListRentalsQuery,
  Rental,
  RentalStatus,
  UpdateRentalBody,
} from '../types/rental.types';

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

  /**
   * Returns the id of an active rental that overlaps the given date range.
   * Overlap condition: existing.start_date <= endDate AND existing.end_date >= startDate
   * Only `booked` and `ongoing` rentals block new bookings.
   */
  async findOverlappingActive(
    vehicleId: number,
    startDate: string,
    endDate: string,
    excludeRentalId?: number,
    trx?: Knex.Transaction,
  ): Promise<number | null> {
    const connection = trx ?? db;
    const bindings: (number | string)[] = [vehicleId, endDate, startDate];

    let excludeClause = '';
    if (excludeRentalId !== undefined) {
      excludeClause = 'AND id != ?';
      bindings.push(excludeRentalId);
    }

    const result = await connection.raw(
      `
      SELECT id
      FROM rentals
      WHERE vehicle_id = ?
        AND status IN ('booked', 'ongoing')
        AND start_date <= ?
        AND end_date >= ?
        ${excludeClause}
      LIMIT 1
      `,
      bindings,
    );

    const row = result.rows[0] as { id: number } | undefined;

    return row ? Number(row.id) : null;
  }

  async create(
    body: CreateRentalBody,
    totalAmount: number,
    trx?: Knex.Transaction,
  ): Promise<Rental> {
    const connection = trx ?? db;

    const [row] = await connection<RentalRow>('rentals')
      .insert({
        vehicle_id: body.vehicle_id,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        start_date: body.start_date,
        end_date: body.end_date,
        total_amount: totalAmount,
        status: 'booked',
      })
      .returning('*');

    return this.mapRow(row);
  }

  async update(id: number, body: UpdateRentalBody, totalAmount?: number): Promise<Rental | null> {
    const updateData: Record<string, unknown> = {
      updated_at: db.fn.now(),
    };

    if (body.vehicle_id !== undefined) updateData.vehicle_id = body.vehicle_id;
    if (body.customer_name !== undefined) updateData.customer_name = body.customer_name;
    if (body.customer_phone !== undefined) updateData.customer_phone = body.customer_phone;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;
    if (body.status !== undefined) updateData.status = body.status;
    if (totalAmount !== undefined) updateData.total_amount = totalAmount;

    const rows = await db<RentalRow>('rentals').where({ id }).update(updateData).returning('*');

    const row = rows[0];

    return row ? this.mapRow(row) : null;
  }

  async cancel(id: number): Promise<boolean> {
    const updated = await db('rentals').where({ id }).update({
      status: 'cancelled',
      updated_at: db.fn.now(),
    });

    return updated > 0;
  }
}
