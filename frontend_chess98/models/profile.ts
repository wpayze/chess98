export interface Profile {
    id: string
    active_puzzle_id: string | null
    user_id: string
    display_name: string
    bio: string | null
    country: string | null
    avatar_url: string | null
    ratings: {
      bullet: number
      blitz: number
      rapid: number
      classical: number
      puzzle: number
    }
    total_games: number
    wins: number
    losses: number
    draws: number
    title: string | null
    member_since: string
    last_active: string
  }
  