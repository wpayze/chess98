import type { LoginRequest, LoginResponse, User, RegisterRequest, RegisterResponse } from "@/models/auth"
import { ApiService } from "./api-service"
import { ENDPOINTS } from "@/constants/endpoints"

class AuthService extends ApiService {
  /**
   * Authenticate a user with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.fetchPublic<LoginResponse>(ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.fetchPublic<RegisterResponse>(ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }
}

// Export a singleton instance
export const authService = new AuthService()

