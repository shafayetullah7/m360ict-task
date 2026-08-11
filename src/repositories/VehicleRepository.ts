import db from '../config/db';
import type { ListVehiclesQuery, Vehicle } from '../types/vehicle.types';

type VehicleRow = {
  id: number;
  name: string;
  plate_number: string;
  category: string;
  daily_rate: string | number;
  photo_path: string | null;
  deleted_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class VehicleRepository {
  private mapRow(row: VehicleRow): Vehicle {
    return {
      id: row.id,
      name: row.name,
      plate_number: row.plate_number,
      category: row.category,
      daily_rate: Number(row.daily_rate),
      photo_path: row.photo_path,
      deleted_at: row.deleted_at ? String(row.deleted_at) : null,
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
    };
  }

  async findById(id: number): Promise<Vehicle | null> {
    const row = await db<VehicleRow>('vehicles').where({ id }).whereNull('deleted_at').first();

    return row ? this.mapRow(row) : null;
  }

  async list(query: ListVehiclesQuery): Promise<{ data: Vehicle[]; total: number }> {
    const { page, limit, category, search } = query;

    let queryBuilder = db<VehicleRow>('vehicles').whereNull('deleted_at');

    if (category) {
      queryBuilder = queryBuilder.where('category', category);
    }

    if (search) {
      queryBuilder = queryBuilder.whereILike('name', `%${search}%`);
    }

    const countResult = (await queryBuilder.clone().count('* as count').first()) as
      | { count: string | number }
      | undefined;
    const total = Number(countResult?.count ?? 0);

    const rows = await queryBuilder
      .orderBy('id', 'asc')
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      data: rows.map((row) => this.mapRow(row)),
      total,
    };
  }
}
