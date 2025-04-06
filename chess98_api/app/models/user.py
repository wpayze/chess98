import uuid
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database.base import Base

class UserStatus(Enum):
    active = "active"
    suspended = "suspended"
    banned = "banned"

class UserRole(Enum):
    user = "user"
    moderator = "moderator"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_email_verified = Column(Boolean, default=False)
    status = Column(SQLEnum(UserStatus), default=UserStatus.active, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.user, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    two_factor_enabled = Column(Boolean, default=False)

    profile = relationship("Profile", back_populates="user", uselist=False)
    settings = relationship("Settings", back_populates="user", uselist=False)
    games_as_white = relationship("Game", back_populates="white_player", foreign_keys="[Game.white_id]")
    games_as_black = relationship("Game", back_populates="black_player", foreign_keys="[Game.black_id]")

    user_achievements = relationship(
        "UserAchievement",
        back_populates="user",
        cascade="all, delete-orphan",
        overlaps="achievements"
    )
    achievements = relationship(
        "Achievement",
        secondary="user_achievements",
        back_populates="users",
        overlaps="user_achievements,achievement"
    )

    friends = relationship("Friend", foreign_keys="[Friend.user_id]", back_populates="user")
