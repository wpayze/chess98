export interface Puzzle {
    id: string
    fen: string
    moves: string[]
    rating: number
    rating_deviation: number
    popularity: number
    times_played: number
    themes: string[]
    game_url?: string
  }
  
  export interface PuzzleSolveResult {
    success: boolean
    rating_delta: number
    new_rating: number
    next_puzzle_id: string | null
    rating_updated: boolean
  }
  
  export interface PuzzleRefreshResult {
    new_puzzle_id: string
  }
  