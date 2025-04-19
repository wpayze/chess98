from fastapi import APIRouter, Depends, Query, Body
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.controllers.puzzle import PuzzleController
from app.schemas.puzzle import PuzzleSolveResult, PuzzleRefreshResult, PuzzleOut

#test
from typing import List

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

#experimental - testing
@router.get("/experimental/by-rating", response_model=List[PuzzleOut])
async def get_experimental_puzzles_by_rating(
    rating: float = Query(..., description="User's current puzzle rating"),
    calls: int = Query(1, description="Number of times to call the experimental fetch"),
    db: AsyncSession = Depends(get_db),
):
    """
    Experimental: Devuelve una lista de puzzles aleatorios en el rango del rating dado.
    Permite múltiples llamadas para analizar repetición o rendimiento.
    """
    return await PuzzleController.get_multiple_experimental_by_rating(rating, calls, db)