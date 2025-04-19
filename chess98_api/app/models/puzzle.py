import uuid
from sqlalchemy import Column, String, Float, Integer, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database.base import Base


class Puzzle(Base):
    __tablename__ = "puzzles"

    id = Column(String, primary_key=True)
    fen = Column(Text, nullable=False)
    moves = Column(JSON, nullable=False)  # Lista de strings (movimientos en UCI)
    rating = Column(Float, nullable=False)
    rating_deviation = Column(Float, nullable=False)
    popularity = Column(Float, nullable=False)
    times_played = Column(Integer, default=0, nullable=False)
    themes = Column(JSON, nullable=False)  # Lista de strings
    game_url = Column(String, nullable=True)

    # Relación con perfiles que lo tienen como activo
    profiles_with_active_puzzle = relationship("Profile", back_populates="active_puzzle")

    # Solves históricos de este puzzle
    solve_records = relationship("PuzzleSolve", back_populates="puzzle", cascade="all, delete-orphan")
