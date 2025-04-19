from typing import Optional
from datetime import datetime, timezone

from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.puzzle import Puzzle
from app.models.profile import Profile
from app.models.puzzle_solve import PuzzleSolve
from app.services.profile import set_active_puzzle
from app.utils.elo import update_puzzle_rating


async def get_puzzle_by_id(puzzle_id: str, db: AsyncSession) -> Puzzle:
    result = await db.execute(select(Puzzle).where(Puzzle.id == puzzle_id))
    puzzle = result.scalar_one_or_none()
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")
    return puzzle


async def get_puzzle_by_rating(rating: float, db: AsyncSession) -> Optional[Puzzle]:
    result = await db.execute(
        select(Puzzle)
        .where(Puzzle.rating.between(rating - 100, rating + 100))
        .order_by(func.random())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def sum_times_played(puzzle_id: str, db: AsyncSession):
    await db.execute(
        update(Puzzle)
        .where(Puzzle.id == puzzle_id)
        .values(times_played=Puzzle.times_played + 1)
    )

async def solve_puzzle_and_get_next(profile: Profile, puzzle_id: str, success: bool, db: AsyncSession):
    puzzle = await get_puzzle_by_id(puzzle_id, db)
    await sum_times_played(puzzle_id, db)

    user_rating = profile.ratings.get("puzzle")
    puzzle_rating = puzzle.rating

    apply_rating = profile.active_puzzle_id == puzzle_id

    delta = update_puzzle_rating(user_rating, puzzle_rating, success=success, k=40) if apply_rating else 0
    new_rating = user_rating + delta if apply_rating else user_rating

    if apply_rating:
        profile.ratings["puzzle"] = new_rating

    # Registrar el solve
    solve = PuzzleSolve(
        profile_id=profile.id,
        puzzle_id=puzzle_id,
        solved_at=datetime.now(timezone.utc),
        success=success,
        rating_before=user_rating,
        rating_after=new_rating,
        rating_delta=delta,
    )
    db.add(solve)

    # Asignar nuevo puzzle si fue correcto y era el activo
    if apply_rating:
        next_puzzle = await get_puzzle_by_rating(new_rating, db)
        if next_puzzle:
            await set_active_puzzle(profile.id, next_puzzle.id, db)
            next_puzzle_id = next_puzzle.id
        else:
            next_puzzle_id = None
    else:
        next_puzzle_id = profile.active_puzzle_id
    await db.commit()
    await db.refresh(profile)

    return {
        "success": success,
        "rating_delta": delta,
        "new_rating": new_rating,
        "next_puzzle_id": next_puzzle_id,
        "rating_updated": apply_rating,
    }


async def refresh_active_puzzle(profile: Profile, db: AsyncSession) -> str:
    rating = profile.ratings.get("puzzle", 500)
    puzzle = await get_puzzle_by_rating(rating, db)

    if not puzzle:
        raise HTTPException(status_code=404, detail="No puzzle found")

    await set_active_puzzle(profile.id, puzzle.id, db)
    await db.commit()

    return puzzle.id
