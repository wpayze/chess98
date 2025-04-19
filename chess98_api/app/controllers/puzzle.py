from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.services.profile import get_profile_by_user_id
from app.services.puzzle import (
    solve_puzzle_and_get_next,
    refresh_active_puzzle,
    get_puzzle_by_id,
    get_random_puzzle_by_rating_fast
)

class PuzzleController:

    @staticmethod
    async def get_puzzle_by_id(puzzle_id: str, db: AsyncSession):
        return await get_puzzle_by_id(puzzle_id, db)

    @staticmethod
    async def solve_and_get_next(
        user_id: UUID,
        puzzle_id: str,
        success: bool,
        db: AsyncSession
    ):
        profile = await get_profile_by_user_id(user_id, db)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        return await solve_puzzle_and_get_next(profile, puzzle_id, success, db)

    @staticmethod
    async def refresh_puzzle(user_id: UUID, db: AsyncSession):
        profile = await get_profile_by_user_id(user_id, db)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        new_puzzle_id = await refresh_active_puzzle(profile, db)
        return {"new_puzzle_id": new_puzzle_id}


    #experimental
    @staticmethod
    async def get_multiple_experimental_by_rating(
        rating: float,
        calls: int,
        db: AsyncSession,
    ):
        results = []
        for _ in range(calls):
            puzzle = await get_random_puzzle_by_rating_fast(rating, db)
            if puzzle:
                results.append(puzzle)
        return results