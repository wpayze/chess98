import { Game } from "@/models/play"
import { ApiService } from "./api-service"
import { ENDPOINTS, replacePathParams } from "@/constants/endpoints"
import { GameSummary } from "@/models/game"

interface PaginatedGamesResponse {
  games: GameSummary[]
  page: number
  page_size: number
  total_pages: number
}

class GameService extends ApiService {
  /**
   * Get game by ID
   */
  async getGameById(gameId: string): Promise<Game> {
    const endpoint = replacePathParams(ENDPOINTS.GAME_BY_ID, { id: gameId })
    return this.fetchPublic<Game>(endpoint)
  }

  /**
   * Get games by Username
   */
  async getGameByUsername(
    username: string,
    page?: number,
    page_size?: number
  ): Promise<PaginatedGamesResponse> {
    let endpoint = replacePathParams(ENDPOINTS.USER_GAMES, { username })
  
    const params = new URLSearchParams()
    if (page !== undefined) params.append('page', page.toString())
    if (page_size !== undefined) params.append('page_size', page_size.toString())
  
    if ([...params].length > 0) {
      endpoint += `?${params.toString()}`
    }
  
    return this.fetchPublic<PaginatedGamesResponse>(endpoint)
  }
}

export const gameService = new GameService()

