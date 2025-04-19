from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.models.profile import Profile
from app.models.user import User
from app.models.puzzle import Puzzle

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

async def set_active_puzzle(profile_id: UUID, puzzle_id: UUID, db: AsyncSession) -> Profile:
    # Obtener el perfil
    result = await db.execute(select(Profile).where(Profile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Verificar que el puzzle exista
    result = await db.execute(select(Puzzle).where(Puzzle.id == puzzle_id))
    puzzle = result.scalar_one_or_none()

    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")

    # Asignar el puzzle como activo
    profile.active_puzzle_id = puzzle_id

    await db.commit()
    await db.refresh(profile)

    return profile