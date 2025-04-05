from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.user import get_user_by_username, get_top_users_by_rating
from typing import Dict, List

class UserController:
    @staticmethod
    async def get_by_username(username: str, db: AsyncSession):
        user = await get_user_by_username(username, db)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    @staticmethod
    async def get_top_players(db: AsyncSession) -> Dict[str, List[dict]]:
        return await get_top_users_by_rating(db)