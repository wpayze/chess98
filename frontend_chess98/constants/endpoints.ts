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

  // Profile endpoint
  PROFILE_BY_USERNAME = "/profiles/username/:username"
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

