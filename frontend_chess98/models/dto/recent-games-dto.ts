export interface PlayerSummary {
    username: string
    rating: number
    title: string | null
  }
  
  export interface RecentGame {
    game_id: string
    time_control: string
    time_control_str: string
    result: string | null
    date: string
    white_player: PlayerSummary
    black_player: PlayerSummary
  }
  
  export interface PaginatedRecentGames {
    games: RecentGame[]
    page: number
    page_size: number
    total_pages: number
    total_games: number
  }