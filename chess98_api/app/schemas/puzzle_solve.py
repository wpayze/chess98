from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

from app.schemas.puzzle import PuzzleOut

class PuzzleSolveOut(BaseModel):
    id: UUID
    solved_at: datetime
    success: bool
    rating_before: Optional[float]
    rating_after: Optional[float]
    rating_delta: Optional[float]
    puzzle: PuzzleOut

    class Config:
        orm_mode = True

class PaginatedPuzzleSolves(BaseModel):
    data: List[PuzzleSolveOut]
    page: int
    page_size: int
    total_pages: int

class PuzzleSolveStatsResponse(BaseModel):
    total: int
    solved: int
    failed: int
    solve_percentage: float
    highest_solved_rating: Optional[float]
    current_user_rating: Optional[float]
