from sqlalchemy import func, select, desc

from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.puzzle_solve import PuzzleSolve, PuzzleSolveStatus  # Importar el Enum
from app.models.profile import Profile
from app.models.puzzle import Puzzle

async def get_solve_stats_by_profile_id(profile_id: UUID, db: AsyncSession):
    # Total solves (rated only)
    total_q = await db.execute(
        select(func.count()).where(
            PuzzleSolve.profile_id == profile_id,
            PuzzleSolve.rating_delta != 0,
            PuzzleSolve.status.in_([PuzzleSolveStatus.SOLVED, PuzzleSolveStatus.FAILED])
        )
    )
    total = total_q.scalar() or 0

    # Solved (status == SOLVED)
    solved_q = await db.execute(
        select(func.count()).where(
            PuzzleSolve.profile_id == profile_id,
            PuzzleSolve.rating_delta != 0,
            PuzzleSolve.status == PuzzleSolveStatus.SOLVED
        )
    )
    solved = solved_q.scalar() or 0

    # Failed (status == FAILED)
    failed = total - solved

    # Solve %
    solve_pct = round((solved / total) * 100, 2) if total > 0 else 0.0

    # Highest solved rating
    highest_q = await db.execute(
        select(Puzzle.rating)
        .join(PuzzleSolve, Puzzle.id == PuzzleSolve.puzzle_id)
        .where(
            PuzzleSolve.profile_id == profile_id,
            PuzzleSolve.rating_delta != 0,
            PuzzleSolve.status == PuzzleSolveStatus.SOLVED
        )
        .order_by(desc(Puzzle.rating))
        .limit(1)
    )
    highest = highest_q.scalar()

    # Current user rating (from profile)
    profile_q = await db.execute(
        select(Profile).where(Profile.id == profile_id)
    )
    profile = profile_q.scalar_one_or_none()
    current_rating = profile.ratings.get("puzzle") if profile else None

    return {
        "total": total,
        "solved": solved,
        "failed": failed,
        "solve_percentage": solve_pct,
        "highest_solved_rating": highest,
        "current_user_rating": current_rating
    }
