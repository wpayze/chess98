from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.controllers.profile import ProfileController
from app.database.connection import get_db
from app.schemas.profile import ProfileOut

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.get("/user/{user_id}", response_model=ProfileOut)
async def get_profile_by_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    return await ProfileController.get_by_user_id(user_id, db)

@router.get("/username/{username}", response_model=ProfileOut)
async def get_profile_by_username(username: str, db: AsyncSession = Depends(get_db)):
    return await ProfileController.get_by_username(username, db)