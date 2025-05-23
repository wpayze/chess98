from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, Integer
from sqlalchemy.orm import joinedload
from app.models.user import User
from app.models.profile import Profile
from typing import Dict, List
from uuid import UUID

async def get_user_by_username(username: str, db: AsyncSession) -> User | None:
    result = await db.execute(
        select(User).where(User.username == username)
    )
    return result.scalar_one_or_none()

async def get_user_by_id(user_id: UUID, db: AsyncSession) -> User | None:
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()

async def get_top_users_by_rating(db: AsyncSession) -> Dict[str, List[dict]]:
    time_controls = ["bullet", "blitz", "rapid", "puzzle"]
    top_players = {}

    for control in time_controls:
        stmt = (
            select(User)
            .join(Profile)
            .options(joinedload(User.profile))
            .where(
                User.status == "active",
                Profile.total_games > 0
            )
            .order_by(desc(func.cast(Profile.ratings.op('->>')(control), Integer)))
            .limit(5)
        )

        result = await db.execute(stmt)
        users = result.scalars().all()

        top_players[control] = [
            {
                "id": str(user.id),
                "username": user.username,
                "rating": user.profile.ratings.get(control, 1200),
                "title": user.profile.title or None,
            }
            for user in users
            if user.profile
        ]

    return top_players
