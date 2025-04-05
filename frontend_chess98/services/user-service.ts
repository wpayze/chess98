import { ApiService } from "./api-service"
import type { TopPlayersResponse, User } from "@/models/user"
import { ENDPOINTS, replacePathParams } from "@/constants/endpoints"

class UserService extends ApiService {
  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User> {
    const endpoint = replacePathParams(ENDPOINTS.USER_BY_USERNAME, { username })
    return this.fetchPublic<User>(endpoint)
  }

   /**
   * Get top players by time control
   */
   async getTopPlayers(): Promise<TopPlayersResponse> {
    return this.fetchPublic<TopPlayersResponse>(ENDPOINTS.TOP_PLAYERS);
  }
}

// Export a singleton instance
export const userService = new UserService()

