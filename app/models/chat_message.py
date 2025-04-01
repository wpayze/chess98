import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database.base import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    game_id = Column(PG_UUID(as_uuid=True), ForeignKey("games.id"), nullable=False)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=True) 
    
    content = Column(String, nullable=False)
    is_system_message = Column(Boolean, default=False, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    
    game = relationship("Game", back_populates="chats")
    user = relationship("User")
