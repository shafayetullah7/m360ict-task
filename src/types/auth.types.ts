export interface JwtPayload {
  staffId: number;
  email: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  staff: {
    id: number;
    email: string;
    name: string;
  };
}
