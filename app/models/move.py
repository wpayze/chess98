import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Integer, Boolean, Float, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database.base import Base

class MoveColor(Enum):
    white = "white"
    black = "black"

class Move(Base):
    __tablename__ = "moves"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(PG_UUID(as_uuid=True), ForeignKey("games.id"), nullable=False)
    
    move_number = Column(Integer, nullable=False)
    color = Column(SQLEnum(MoveColor), nullable=False)
    move_san = Column(String, nullable=False)
    move_uci = Column(String, nullable=False)
    
    fen_after = Column(String, nullable=False)
    
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    time_spent = Column(Integer, nullable=False)
    
    is_check = Column(Boolean, default=False, nullable=False)
    is_checkmate = Column(Boolean, default=False, nullable=False)
    is_capture = Column(Boolean, default=False, nullable=False)
    is_castle = Column(Boolean, default=False, nullable=False)
    is_promotion = Column(Boolean, default=False, nullable=False)
    promotion_piece = Column(String, nullable=True)
    
    evaluation = Column(Float, nullable=True)
    best_move = Column(String, nullable=True)
    
    game = relationship("Game", back_populates="moves")
