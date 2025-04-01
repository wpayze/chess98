import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Column, String, DateTime, Integer, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database.base import Base

class GameStatus(Enum):
    pending = "pending"
    active = "active"
    completed = "completed"
    aborted = "aborted"

class GameResult(Enum):
    white_win = "white_win"
    black_win = "black_win"
    draw = "draw"

class GameTermination(Enum):
    checkmate = "checkmate"
    resignation = "resignation"
    timeout = "timeout"
    draw_agreement = "draw_agreement"
    stalemate = "stalemate"
    insufficient_material = "insufficient_material"
    fifty_move_rule = "fifty_move_rule"
    threefold_repetition = "threefold_repetition"

class Game(Base):
    __tablename__ = "games"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    white_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    black_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    time_control = Column(String, nullable=False)
    start_time = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    
    status = Column(SQLEnum(GameStatus), default=GameStatus.pending, nullable=False)
    result = Column(SQLEnum(GameResult), nullable=True)
    termination = Column(SQLEnum(GameTermination), nullable=True)
    
    initial_fen = Column(String, default="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", nullable=False)
    final_fen = Column(String, nullable=True)
    pgn = Column(String, nullable=True)
    
    opening = Column(String, nullable=True)
    eco_code = Column(String, nullable=True)
    
    white_rating = Column(Integer, nullable=False)
    black_rating = Column(Integer, nullable=False)
    white_rating_change = Column(Integer, nullable=True)
    black_rating_change = Column(Integer, nullable=True)
    
    moves = relationship("Move", back_populates="game", order_by="Move.move_number")
    chats = relationship("ChatMessage", back_populates="game")
    
    white_player = relationship("User", foreign_keys=[white_id], back_populates="games_as_white")
    black_player = relationship("User", foreign_keys=[black_id], back_populates="games_as_black")