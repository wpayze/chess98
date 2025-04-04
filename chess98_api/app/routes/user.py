from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.controllers.user import UserController
from app.database.connection import get_db
from app.schemas.user import UserOut

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/username/{username}", response_model=UserOut)
async def get_user(username: str, db: AsyncSession = Depends(get_db)):
    return await UserController.get_by_username(username, db)
