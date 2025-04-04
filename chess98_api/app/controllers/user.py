from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.user import get_user_by_username

class UserController:
    @staticmethod
    async def get_by_username(username: str, db: AsyncSession):
        user = await get_user_by_username(username, db)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
