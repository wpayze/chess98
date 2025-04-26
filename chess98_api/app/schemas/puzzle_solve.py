from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

from app.schemas.puzzle import PuzzleOut
from app.models.puzzle_solve import PuzzleSolveStatus

class PuzzleSolveOut(BaseModel):
    id: UUID
    solved_at: datetime
    status: PuzzleSolveStatus
    rating_before: Optional[float]
    rating_after: Optional[float]
    rating_delta: Optional[float]
    puzzle: PuzzleOut

    class Config:
        from_attributes = True

class PuzzleSolveResult(BaseModel):
    status: PuzzleSolveStatus
    rating_updated: bool
    rating_delta: int
    new_rating: float
    next_puzzle_id: Optional[str]

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
