export enum ENDPOINTS {
  // Auth endpoints
  LOGIN = "/auth/login",
  REGISTER = "/auth/register",

  // User endpoints
  USER_BY_USERNAME = "/users/username/:username",
  TOP_PLAYERS = "/users/top",
  
  // Game endpoints
  GAME_BY_ID = "/games/:id",
  USER_GAMES = "/games/user/:username",
  RECENT_GAMES = "/games/recent",

  // Profile endpoint
  PROFILE_BY_USERNAME = "/profiles/username/:username",

  // Puzzle endpoints
  GET_PUZZLE_BY_ID = "/puzzles/:puzzle_id",
  SOLVE_PUZZLE = "/puzzles/:puzzle_id/solved",
  REFRESH_PUZZLE = "/puzzles/refresh",
  GET_PUZZLE_SOLVES_BY_USERNAME = "/puzzles/user/:username",
  GET_PUZZLE_STATS_BY_USERNAME = "/puzzles/:username/stats",

  //Settings
  SETTINGS_BY_USER_ID = "/settings/{user_id}",
}

/**
 * Replace path parameters in endpoint URLs
 * @param endpoint The endpoint with path parameters
 * @param params Object containing parameter values
 * @returns Endpoint with parameters replaced
 */
export function replacePathParams(endpoint: string, params: Record<string, string>): string {
  let result = endpoint
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value)
  })
  return result
}

