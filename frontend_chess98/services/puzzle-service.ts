import { Puzzle, PuzzleRefreshResult, PuzzleSolveResult } from "@/models/puzzle";
import { ApiService } from "./api-service"
import { ENDPOINTS, replacePathParams } from "@/constants/endpoints"

class PuzzleService extends ApiService {
  /**
   * Get puzzle by ID
   */
  async getPuzzleById(puzzleId: string): Promise<Puzzle> {
    const endpoint = replacePathParams(ENDPOINTS.GET_PUZZLE_BY_ID, { puzzle_id: puzzleId })
    return this.fetchPublic<Puzzle>(endpoint)
  }

  /**
   * Solve puzzle and get next
   */
  async solvePuzzle(puzzleId: string, data: { user_id: string; success: boolean }): Promise<PuzzleSolveResult> {
    const endpoint = replacePathParams(ENDPOINTS.SOLVE_PUZZLE, { puzzle_id: puzzleId })
    return this.fetchPublic<PuzzleSolveResult>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  /**
   * Refresh current puzzle for user
   */
  async refreshPuzzle(data: { user_id: string }): Promise<PuzzleRefreshResult> {
    return this.fetchPublic<PuzzleRefreshResult>(ENDPOINTS.REFRESH_PUZZLE, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

export const puzzleService = new PuzzleService()
