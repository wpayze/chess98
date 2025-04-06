import uuid
from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database.base import Base

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    criteria_type = Column(String, nullable=False)
    criteria_value = Column(Integer, nullable=False)

    user_achievements = relationship(
        "UserAchievement",
        back_populates="achievement",
        cascade="all, delete-orphan",
        overlaps="users"
    )
    users = relationship(
        "User",
        secondary="user_achievements",
        back_populates="achievements",
        overlaps="user_achievements,user"
    )
