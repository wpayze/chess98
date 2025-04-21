import { Puzzle, PuzzleRefreshResult, PuzzleSolveListResponse, PuzzleSolveResult, PuzzleSolveStatsResponse, PuzzleSolveStatus } from "@/models/puzzle";
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
  async solvePuzzle(puzzleId: string, data: { user_id: string; status: PuzzleSolveStatus }): Promise<PuzzleSolveResult> {
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

  /**
 * Get all puzzle solves by username
 */
  async getPuzzleSolvesByUsername(
    username: string,
    onlyRated = true,
    page = 1,
    pageSize = 10
  ): Promise<PuzzleSolveListResponse> {
    const endpoint = replacePathParams(ENDPOINTS.GET_PUZZLE_SOLVES_BY_USERNAME, { username });
    const url = `${endpoint}?onlyRated=${onlyRated}&page=${page}&page_size=${pageSize}`;
    return this.fetchPublic<PuzzleSolveListResponse>(url);
  }

  async getPuzzleStatsByUsername(username: string): Promise<PuzzleSolveStatsResponse> {
    const endpoint = replacePathParams(ENDPOINTS.GET_PUZZLE_STATS_BY_USERNAME, { username });
    return this.fetchPublic<PuzzleSolveStatsResponse>(endpoint)
  }
}

export const puzzleService = new PuzzleService()
