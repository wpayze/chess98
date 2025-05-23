from pydantic import BaseModel
from typing import Optional, List

class PuzzleRefreshResult(BaseModel):
    new_puzzle_id: str

class PuzzleOut(BaseModel):
    id: str
    fen: str
    moves: List[str]
    rating: float
    rating_deviation: float
    popularity: float
    times_played: int
    themes: List[str]
    game_url: Optional[str]

    class Config:
        from_attributes = True
