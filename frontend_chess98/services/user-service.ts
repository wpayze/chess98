import { ApiService } from "./api-service"
import type { TopPlayersResponse, User } from "@/models/user"
import { ENDPOINTS, replacePathParams } from "@/constants/endpoints"
import { PaginatedRecentGames } from "@/models/dto/recent-games-dto"

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
  
  async getRecentGames(page = 1, pageSize = 10): Promise<PaginatedRecentGames> {
    const url = `${ENDPOINTS.RECENT_GAMES}?page=${page}&page_size=${pageSize}`
    return this.fetchPublic<PaginatedRecentGames>(url)
  }
}

// Export a singleton instance
export const userService = new UserService()

