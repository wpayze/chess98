# app/models/profile.py

import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from sqlalchemy.ext.mutable import MutableDict
from app.database.base import Base

class TitleEnum(str, Enum):
    GM = "GM"
    IM = "IM"
    FM = "FM"
    CM = "CM"
    NM = "NM"
    GP = "GP"
    PI = "PI"
    FP = "FP"
    CP = "CP"

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    display_name = Column(String, nullable=False)
    bio = Column(String, nullable=True)
    country = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    
    ratings = Column(
        MutableDict.as_mutable(JSON),
        default=lambda: {
            "bullet": 1200,
            "blitz": 1200,
            "rapid": 1200,
            "classical": 1200,
            "puzzle": 500,
        },
        nullable=False,
    )
    
    total_games = Column(Integer, default=0, nullable=False)
    wins = Column(Integer, default=0, nullable=False)
    losses = Column(Integer, default=0, nullable=False)
    draws = Column(Integer, default=0, nullable=False)
    
    title = Column(SQLEnum(TitleEnum, name="title_enum"), nullable=True)
    
    member_since = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    last_active = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    
    user = relationship("User", back_populates="profile")

    # Puzzles
    active_puzzle_id = Column(String, ForeignKey("puzzles.id"), nullable=True)
    active_puzzle = relationship("Puzzle", back_populates="profiles_with_active_puzzle")
    puzzle_solves = relationship("PuzzleSolve", back_populates="profile", cascade="all, delete-orphan")
