import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database.base import Base

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    achievement_id = Column(PG_UUID(as_uuid=True), ForeignKey("achievements.id"), nullable=False)
    earned_at = Column(DateTime, default=datetime.now(timezone.utc), nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "achievement_id", name="_user_achievement_uc"),)

    user = relationship(
        "User",
        back_populates="user_achievements",
        overlaps="achievements"
    )
    achievement = relationship(
        "Achievement",
        back_populates="user_achievements",
        overlaps="users"
    )
