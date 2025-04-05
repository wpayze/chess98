from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.models.profile import Profile
from app.models.user import User

async def get_profile_by_user_id(user_id: UUID, db: AsyncSession) -> Profile:
    result = await db.execute(
        select(Profile).where(Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile

async def get_profile_by_username(username: str, db: AsyncSession):
    result = await db.execute(
        select(Profile)
        .join(User)
        .where(User.username == username)
    )
    return result.scalar_one_or_none()