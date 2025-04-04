export type GameStatus = "pending" | "active" | "completed" | "aborted"

export type GameResult = "white_win" | "black_win" | "draw"

export type GameTermination =
  | "checkmate"
  | "resignation"
  | "timeout"
  | "draw_agreement"
  | "stalemate"
  | "insufficient_material"
  | "fifty_move_rule"
  | "threefold_repetition"

export type ProfileInGame = {
  display_name: string
  ratings: {
    bullet: number
    blitz: number
    rapid: number
    classical: number
    puzzle: number
    [key: string]: number
  }
}

export type UserInGame = {
  id: string
  username: string
  profile?: ProfileInGame
}

export type Game = {
  id: string
  time_control: string
  time_control_str: string
  start_time: string
  end_time?: string | null
  status: GameStatus
  result?: GameResult | null
  termination?: GameTermination | null

  white_rating: number
  black_rating: number
  white_rating_change: number
  black_rating_change: number
  pgn: string;
  initial_fen: string
  final_fen?: string | null
  opening?: string | null
  eco_code?: string | null

  white_player: UserInGame
  black_player: UserInGame
}
