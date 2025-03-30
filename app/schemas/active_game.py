from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

class PlayerColor(str, Enum):
    white = "white"
    black = "black"

class ActiveGame(BaseModel):
    game_id: UUID
    white_id: UUID
    black_id: UUID

    current_fen: str
    turn: PlayerColor

    white_time_remaining: int
    black_time_remaining: int
    last_move_timestamp: datetime

    moves_san: List[str] = Field(default_factory=list)
    moves_uci: List[str] = Field(default_factory=list)

    draw_offer_by: Optional[UUID] = None
    disconnected_players: List[UUID] = Field(default_factory=list)
    paused: bool = False
    status: str = "active"

    class Config:
        from_attributes = True
