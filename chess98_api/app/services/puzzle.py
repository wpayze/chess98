from typing import Optional
from datetime import datetime, timezone
from uuid import UUID
import random
from math import ceil

from sqlalchemy import select, update, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.puzzle import Puzzle
from app.models.profile import Profile
from app.models.puzzle_solve import PuzzleSolve, PuzzleSolveStatus
from app.services.profile import set_active_puzzle
from app.utils.elo import update_puzzle_rating

async def get_puzzle_by_id(puzzle_id: str, db: AsyncSession) -> Puzzle:
    result = await db.execute(select(Puzzle).where(Puzzle.id == puzzle_id))
    puzzle = result.scalar_one_or_none()
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")
    return puzzle

async def get_puzzle_by_rating(rating: float, profile_id: UUID, db: AsyncSession) -> Optional[Puzzle]:
    subquery = select(PuzzleSolve.puzzle_id).where(PuzzleSolve.profile_id == profile_id)

    result = await db.execute(
        select(Puzzle)
        .where(
            Puzzle.rating.between(rating - 25, rating + 25),
            Puzzle.id.not_in(subquery)
        )
        .limit(1)
    )
    return result.scalar_one_or_none()

async def sum_times_played(puzzle_id: str, db: AsyncSession):
    await db.execute(
        update(Puzzle)
        .where(Puzzle.id == puzzle_id)
        .values(times_played=Puzzle.times_played + 1)
    )

def get_k_factor(rating: float) -> int:
    if rating < 2000:
        return 40
    elif rating < 2400:
        return 20
    else:
        return 10

async def solve_puzzle_and_get_next(profile: Profile, puzzle_id: str, status: PuzzleSolveStatus, db: AsyncSession):
    puzzle = await get_puzzle_by_id(puzzle_id, db)
    await sum_times_played(puzzle_id, db)

    user_rating = profile.ratings.get("puzzle")
    puzzle_rating = puzzle.rating

    apply_rating = (
        profile.active_puzzle_id == puzzle_id and
        status != PuzzleSolveStatus.SKIPPED
    )

    k = get_k_factor(user_rating)
    delta = update_puzzle_rating(user_rating, puzzle_rating, success=(status == PuzzleSolveStatus.SOLVED), k=k) if apply_rating else 0

    new_rating = user_rating + delta if apply_rating else user_rating

    if apply_rating:
        profile.ratings["puzzle"] = new_rating

    # Registrar el solve
    solve = PuzzleSolve(
        profile_id=profile.id,
        puzzle_id=puzzle_id,
        solved_at=datetime.now(timezone.utc),
        status=status,
        rating_before=user_rating,
        rating_after=new_rating,
        rating_delta=delta,
    )
    db.add(solve)

    # Asignar nuevo puzzle si era el activo
    if apply_rating or status == PuzzleSolveStatus.SKIPPED:
        next_puzzle = await get_puzzle_by_rating(new_rating, profile.id, db)
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
        "status": status.value,
        "rating_delta": delta,
        "new_rating": new_rating,
        "next_puzzle_id": next_puzzle_id,
        "rating_updated": apply_rating,
    }

async def refresh_active_puzzle(profile: Profile, db: AsyncSession) -> str:
    rating = profile.ratings.get("puzzle", 500)
    puzzle = await get_puzzle_by_rating(rating, profile.id, db)

    if not puzzle:
        raise HTTPException(status_code=404, detail="No puzzle found")

    await set_active_puzzle(profile.id, puzzle.id, db)
    await db.commit()

    return puzzle.id

async def get_puzzles_by_profile_id(
    profile_id: UUID,
    only_rated: bool,
    page: int,
    page_size: int,
    db: AsyncSession
):
    base_query = select(PuzzleSolve).where(PuzzleSolve.profile_id == profile_id)

    if only_rated:
        base_query = base_query.where(PuzzleSolve.rating_delta != 0)

    # Contar total con subquery
    count_result = await db.execute(
        select(func.count()).select_from(base_query.subquery())
    )
    total = count_result.scalar()

    total_pages = ceil(total / page_size)
    offset = (page - 1) * page_size

    # Cargar puzzles en el mismo query
    paginated_query = (
        base_query.options(joinedload(PuzzleSolve.puzzle))
        .order_by(PuzzleSolve.solved_at.desc())
        .offset(offset)
        .limit(page_size)
    )

    result = await db.execute(paginated_query)
    solves = result.scalars().all()

    return {
        "data": solves,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }