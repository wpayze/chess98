from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.services.profile import get_profile_by_user_id, get_profile_by_username

class ProfileController:
    @staticmethod
    async def get_by_user_id(user_id: UUID, db: AsyncSession):
        profile = await get_profile_by_user_id(user_id, db)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile

    @staticmethod
    async def get_by_username(username: str, db: AsyncSession):
        profile = await get_profile_by_username(username, db)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile