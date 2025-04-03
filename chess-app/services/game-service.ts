import { Game } from "@/models/play"
import { ApiService } from "./api-service"
import { ENDPOINTS, replacePathParams } from "@/constants/endpoints"

class GameService extends ApiService {
  /**
   * Get game by ID
   */
  async getGameById(gameId: string): Promise<Game> {
    const endpoint = replacePathParams(ENDPOINTS.GAME_BY_ID, { id: gameId })
    return this.fetchPublic<Game>(endpoint)
  }
}

export const gameService = new GameService()

