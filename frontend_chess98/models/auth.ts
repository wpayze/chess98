import { Settings } from "./setings"

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User,
  detail: string
  settings: Settings | null;
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  display_name: string
}

export interface RegisterResponse {
  id: string
  email: string
  username: string
  is_email_verified: boolean
  status: "active" | "suspended" | "banned"
  role: "user" | "moderator" | "admin"
  created_at: string
  last_login_at: string | null
}

export interface User {
  id: string
  email: string
  username: string
  is_email_verified: boolean
  status: "active" | "suspended" | "banned"
  role: "user" | "moderator" | "admin"
  created_at: string
  last_login_at: string | null
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

