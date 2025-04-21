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

export enum PuzzleSolveStatus {
  SOLVED = 'solved',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}


export interface PuzzleSolveResult {
  status: PuzzleSolveStatus
  success: boolean
  rating_delta: number
  new_rating: number
  next_puzzle_id: string | null
  rating_updated: boolean
}

export interface PuzzleRefreshResult {
  new_puzzle_id: string
}

export interface PuzzleSolveOut {
  id: string;
  solved_at: string;
  success: boolean;
  status: PuzzleSolveStatus
  rating_before?: number;
  rating_after?: number;
  rating_delta?: number;
  puzzle: Puzzle;
}

export interface PuzzleSolveListResponse {
  data: PuzzleSolveOut[];
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PuzzleSolveStatsResponse {
  total: number
  solved: number
  failed: number
  solve_percentage: number
  highest_solved_rating: number | null
  current_user_rating: number
}