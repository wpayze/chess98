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

  /**
   * Refresh the access token
   */
  async refreshToken(token: string): Promise<{ access_token: string }> {
    return this.fetchWithAuth<{ access_token: string }>(ENDPOINTS.REFRESH_TOKEN, token, {
      method: "POST",
    })
  }

  /**
   * Get the current user profile
   */
  async getCurrentUser(token: string): Promise<User> {
    return this.fetchWithAuth<User>(ENDPOINTS.CURRENT_USER, token)
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.fetchPublic<{ message: string }>(ENDPOINTS.FORGOT_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.fetchPublic<{ message: string }>(ENDPOINTS.RESET_PASSWORD, {
      method: "POST",
      body: JSON.stringify({ token, password: newPassword }),
    })
  }
}

// Export a singleton instance
export const authService = new AuthService()

