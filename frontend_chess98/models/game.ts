// Game models

export interface GamePlayer {
    id: string;
    username: string;
    profile: {
      display_name: string;
      ratings: {
        bullet: number;
        blitz: number;
        rapid: number;
        classical: number;
        puzzle: number;
      };
    };
  }
  
  export interface Game {
    id: string;
    time_control: string;
    time_control_str: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'active' | 'completed' | 'aborted';
    result: 'white_win' | 'black_win' | 'draw' | null;
    termination: 'checkmate' | 'resignation' | 'timeout' | 'agreement' | 'stalemate' | 'insufficient_material' | 'fifty_move_rule' | 'threefold_repetition' | null;
    pgn: string;
    white_rating: number;
    black_rating: number;
    white_rating_change: number | null;
    black_rating_change: number | null;
    initial_fen: string;
    final_fen: string;
    opening: string | null;
    eco_code: string | null;
    white_player: GamePlayer;
    black_player: GamePlayer;
  }
  
  // Helper function to convert the API game format to a format compatible with the UI
  export function convertGameForUI(game: Game): GameSummary {
    // Determine if the current user is white or black (this would need to be adjusted based on your auth system)
    // For now, let's assume we're always viewing from white player's perspective
    const isWhitePlayer = true;
    
    const opponent = isWhitePlayer ? game.black_player : game.white_player;
    const playerColor = isWhitePlayer ? 'white' : 'black';
    
    // Determine result from the player's perspective
    let result: 'win' | 'loss' | 'draw';
    if (game.result === 'draw') {
      result = 'draw';
    } else if (
      (isWhitePlayer && game.result === 'white_win') || 
      (!isWhitePlayer && game.result === 'black_win')
    ) {
      result = 'win';
    } else {
      result = 'loss';
    }
    
    // Calculate number of moves from PGN
    const moveCount = game.pgn.split('\n').length;
    
    // Rating change from player's perspective
    const ratingChange = isWhitePlayer 
      ? game.white_rating_change || 0 
      : game.black_rating_change || 0;
    
    return {
      id: game.id,
      timeControl: game.time_control_str,
      opponent: {
        id: opponent.id,
        username: opponent.username,
        rating: isWhitePlayer ? game.black_rating : game.white_rating
      },
      playerColor,
      result,
      endReason: game.termination || 'unknown',
      date: new Date(game.end_time),
      moves: moveCount,
      ratingChange,
      finalPosition: game.final_fen
    };
  }
  
  // This is the format used by the UI components
  export interface GameSummary {
    id: string;
    timeControl: string;
    opponent: {
      id: string;
      username: string;
      rating: number;
    };
    playerColor: 'white' | 'black';
    result: 'win' | 'loss' | 'draw';
    endReason: string;
    date: Date;
    moves: number;
    ratingChange: number;
    finalPosition?: string;
  }
  