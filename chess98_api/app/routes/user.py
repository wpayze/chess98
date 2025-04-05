from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.controllers.user import UserController
from app.database.connection import get_db
from app.schemas.user import UserOut
from typing import Dict, List

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/username/{username}", response_model=UserOut)
async def get_user(username: str, db: AsyncSession = Depends(get_db)):
    return await UserController.get_by_username(username, db)

@router.get("/top", response_model=Dict[str, List[dict]])
async def get_top_users(db: AsyncSession = Depends(get_db)):
    return await UserController.get_top_players(db)