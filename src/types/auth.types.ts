export interface JwtPayload {
  staffId: number;
  email: string;
}

export interface Staff {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface StaffPublic {
  id: number;
  email: string;
  name: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  staff: StaffPublic;
}
