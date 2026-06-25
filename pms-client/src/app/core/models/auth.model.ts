export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export interface AppUser {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

export interface CreateUser {
  username: string;
  password: string;
  role: string;
}
