import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Boolean,
    Float,
    ForeignKey,
    UniqueConstraint,
    String
)
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship

from app.database.base import Base


class PuzzleSolve(Base):
    __tablename__ = "puzzle_solves"
    __table_args__ = (
        sa.Index("idx_puzzle_solves_profile_puzzle", "profile_id", "puzzle_id"),
    )

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    profile_id = Column(PG_UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    puzzle_id = Column(String, ForeignKey("puzzles.id"), nullable=False)

    solved_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    success = Column(Boolean, default=True, nullable=False)
    rating_before = Column(Float, nullable=True)
    rating_after = Column(Float, nullable=True)
    rating_delta = Column(Float, nullable=True)

    # Relaciones
    profile = relationship("Profile", back_populates="puzzle_solves")
    puzzle = relationship("Puzzle", back_populates="solve_records")