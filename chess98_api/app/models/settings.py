import uuid
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database.base import Base

class Settings(Base):
    __tablename__ = "settings"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    theme = Column(String, default="default", nullable=False)
    board_theme = Column(String, default="default", nullable=False)
    piece_set = Column(String, default="default", nullable=False)
    
    animation_speed = Column(Integer, default=50, nullable=False)
    move_confirmation = Column(Boolean, default=True, nullable=False)
    sound_enabled = Column(Boolean, default=True, nullable=False)
    auto_promote_to_queen = Column(Boolean, default=True, nullable=False)
    show_legal_moves = Column(Boolean, default=True, nullable=False)
    
    game_notifications = Column(Boolean, default=True, nullable=False)
    challenge_notifications = Column(Boolean, default=True, nullable=False)
    friend_notifications = Column(Boolean, default=True, nullable=False)
    message_notifications = Column(Boolean, default=True, nullable=False)
    email_notifications = Column(Boolean, default=False, nullable=False)
    
    profile_visibility = Column(Boolean, default=True, nullable=False)
    game_history_visibility = Column(Boolean, default=True, nullable=False)
    online_status_visibility = Column(Boolean, default=True, nullable=False)
    allow_friend_requests = Column(Boolean, default=True, nullable=False)
    allow_data_collection = Column(Boolean, default=True, nullable=False)
    
    user = relationship("User", back_populates="settings")
