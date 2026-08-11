import type { PaginatedResponse } from './common.types';

export type RentalStatus = 'booked' | 'ongoing' | 'completed' | 'cancelled';

export interface Rental {
  id: number;
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: RentalStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateRentalBody {
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
}

export interface UpdateRentalBody {
  vehicle_id?: number;
  customer_name?: string;
  customer_phone?: string;
  start_date?: string;
  end_date?: string;
  status?: RentalStatus;
}

export interface ListRentalsQuery {
  vehicle_id?: number;
  status?: RentalStatus;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export type PaginatedRentalsResponse = PaginatedResponse<Rental>;
