from pydantic import BaseModel
from typing import Optional, Dict
from uuid import UUID
from datetime import datetime

class ProfileOut(BaseModel):
    id: UUID
    user_id: UUID
    active_puzzle_id: Optional[str] = None
    display_name: str
    bio: Optional[str]
    country: Optional[str]
    avatar_url: Optional[str]
    ratings: Dict[str, int]
    total_games: int
    wins: int
    losses: int
    draws: int
    title: Optional[str]
    member_since: datetime
    last_active: datetime

    class Config:
        from_attributes = True
