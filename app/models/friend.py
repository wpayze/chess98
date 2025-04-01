import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Column, DateTime, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database.base import Base

class FriendStatus(Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    blocked = "blocked"

class Friend(Base):
    __tablename__ = "friends"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    friend_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(FriendStatus), default=FriendStatus.pending, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    
    __table_args__ = (UniqueConstraint("user_id", "friend_id", name="_user_friend_uc"), )
    
    user = relationship("User", foreign_keys=[user_id], back_populates="friends")
    friend = relationship("User", foreign_keys=[friend_id])
