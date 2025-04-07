from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Literal
from enum import Enum
from typing import List

class GameStatus(str, Enum):
    pending = "pending"
    active = "active"
    completed = "completed"
    aborted = "aborted"

class GameResult(str, Enum):
    white_win = "white_win"
    black_win = "black_win"
    draw = "draw"

class GameTermination(str, Enum):
    checkmate = "checkmate"
    resignation = "resignation"
    timeout = "timeout"
    draw_agreement = "draw_agreement"
    stalemate = "stalemate"
    insufficient_material = "insufficient_material"
    fifty_move_rule = "fifty_move_rule"
    threefold_repetition = "threefold_repetition"

# ⬇️ Subschemas específicos para Game
class ProfileInGame(BaseModel):
    display_name: str
    ratings: Dict[str, int]

    class Config:
        from_attributes = True

class UserInGame(BaseModel):
    id: UUID
    username: str
    profile: Optional[ProfileInGame]

    class Config:
        from_attributes = True

# 🎯 Esquema final de respuesta del juego
class GameOut(BaseModel):
    id: UUID
    time_control: str
    time_control_str: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    result: Optional[str] = None
    termination: Optional[str] = None

    pgn: Optional[str] = None

    white_rating: int
    black_rating: int
    white_rating_change: Optional[int] = None
    black_rating_change: Optional[int] = None

    initial_fen: str
    final_fen: Optional[str] = None
    opening: Optional[str] = None
    eco_code: Optional[str] = None

    white: UserInGame = Field(alias="white_player")
    black: UserInGame = Field(alias="black_player")

    class Config:
        from_attributes = True
        populate_by_name = True

class OpponentSummary(BaseModel):
    id: UUID
    username: str
    rating: int

class GameSummary(BaseModel):
    id: UUID
    time_control: str
    time_control_str: str
    opponent: OpponentSummary
    player_color: Literal['white', 'black']
    result: Literal['win', 'loss', 'draw']
    end_reason: str
    date: datetime
    moves: int
    rating_change: int = 0
    final_position: Optional[str]

    class Config:
        from_attributes = True

class PaginatedGames(BaseModel):
    games: List[GameSummary]
    page: int
    page_size: int
    total_pages: int
    total_games: int

class PlayerSummary(BaseModel):
    username: str
    rating: int
    title: Optional[str] = None

    class Config:
        from_attributes = True

class RecentGame(BaseModel):
    game_id: UUID
    time_control: str
    time_control_str: str
    result: Optional[str]
    date: datetime

    white_player: PlayerSummary
    black_player: PlayerSummary

    class Config:
        from_attributes = True

class PaginatedRecentGames(BaseModel):
    games: List[RecentGame]
    page: int
    page_size: int
    total_pages: int
    total_games: int