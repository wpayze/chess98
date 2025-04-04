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
  
  export interface GameSummary {
    id: string;
    time_control: string;
    time_control_str: string;
    opponent: {
      id: string;
      username: string;
      rating: number;
    };
    player_color: 'white' | 'black';
    result: 'win' | 'loss' | 'draw';
    end_reason: string;
    date: string;
    moves: number;
    rating_change: number;
    final_position?: string;
  }
  
  