import { ApiService } from "./api-service"
import type { User } from "@/models/user"
import { ENDPOINTS, replacePathParams } from "@/constants/endpoints"

class UserService extends ApiService {
  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User> {
    const endpoint = replacePathParams(ENDPOINTS.USER_BY_USERNAME, { username })
    return this.fetchPublic<User>(endpoint)
  }
}

// Export a singleton instance
export const userService = new UserService()

