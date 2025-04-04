export enum ENDPOINTS {
  // Auth endpoints
  LOGIN = "/auth/login",
  REGISTER = "/auth/register",
  REFRESH_TOKEN = "/auth/refresh",
  FORGOT_PASSWORD = "/auth/forgot-password",
  RESET_PASSWORD = "/auth/reset-password",
  CURRENT_USER = "/auth/me",

  // User endpoints
  USER_PROFILE = "/users/profile",
  USER_BY_ID = "/users/:id",
  USER_BY_USERNAME = "/users/username/:username",
  USER_FRIENDS = "/users/:id/friends",
  ADD_FRIEND = "/users/friends",
  REMOVE_FRIEND = "/users/friends/:id",

  // Game endpoints
  GAMES = "/games",
  GAME_BY_ID = "/games/:id",
  USER_GAMES = "/users/:id/games",

  // Match making
  CREATE_GAME = "/games/create",
  JOIN_GAME = "/games/join",
  MATCHMAKING = "/matchmaking",

  // Moves
  MAKE_MOVE = "/games/:id/move",
  GAME_MOVES = "/games/:id/moves",

  // Chat
  GAME_CHAT = "/games/:id/chat",

  // Ratings
  USER_RATINGS = "/users/:id/ratings",

  // Exercises
  EXERCISES = "/exercises",
  EXERCISE_BY_ID = "/exercises/:id",
  EXERCISE_SOLUTION = "/exercises/:id/solution",
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

