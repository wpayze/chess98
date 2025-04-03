from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserCreate
from app.services.auth import register_user, login_user

class AuthController:
    @staticmethod
    async def register(user_data: UserCreate, db: AsyncSession):
        try:
            user = await register_user(user_data, db)
            return user
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    async def login(email: str, password: str, db: AsyncSession):
        try:
            auth_result = await login_user(email, password, db)
            return auth_result
        except Exception as e:
            raise HTTPException(status_code=401, detail=str(e))
