export interface Vehicle {
  id: number;
  name: string;
  plate_number: string;
  category: string;
  daily_rate: number;
  photo_path: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVehicleBody {
  name: string;
  plate_number: string;
  category: string;
  daily_rate: number;
}

export interface UpdateVehicleBody {
  name?: string;
  plate_number?: string;
  category?: string;
  daily_rate?: number;
}
