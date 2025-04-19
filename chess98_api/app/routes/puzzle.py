from fastapi import APIRouter, Depends, Query, Body
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.controllers.puzzle import PuzzleController
from app.schemas.puzzle import PuzzleSolveResult, PuzzleRefreshResult, PuzzleOut


router = APIRouter(prefix="/puzzles", tags=["puzzles"])

@router.get("/{puzzle_id}", response_model=PuzzleOut)
async def get_puzzle(
    puzzle_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Devuelve los detalles de un puzzle por su ID.
    """
    return await PuzzleController.get_puzzle_by_id(puzzle_id, db)

@router.post("/{puzzle_id}/solved", response_model=PuzzleSolveResult)
async def solve_puzzle(
    puzzle_id: str,
    user_id: UUID = Body(..., embed=True),
    success: bool = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
):
    """
    Marca un puzzle como resuelto (o fallado), actualiza el rating y asigna el siguiente puzzle.
    """
    return await PuzzleController.solve_and_get_next(user_id, puzzle_id, success, db)


@router.post("/refresh", response_model=PuzzleRefreshResult)
async def refresh_puzzle(
    user_id: UUID = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
):
    """
    Asigna un nuevo puzzle al usuario. Útil cuando aún no tiene uno o quiere cambiar el actual.
    """
    return await PuzzleController.refresh_puzzle(user_id, db)
