from fastapi import APIRouter, Depends, Query, Body
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.controllers.puzzle import PuzzleController
from app.schemas.puzzle import PuzzleRefreshResult, PuzzleOut
from app.schemas.puzzle_solve import PaginatedPuzzleSolves, PuzzleSolveStatsResponse, PuzzleSolveResult
from app.models.puzzle_solve import PuzzleSolveStatus

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
    status: PuzzleSolveStatus = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
):
    """
    Marca un puzzle como resuelto, fallado o saltado.
    Actualiza el rating (solo si es SOLVED o FAILED) y asigna el siguiente puzzle.
    """
    return await PuzzleController.solve_and_get_next(user_id, puzzle_id, status, db)


@router.post("/refresh", response_model=PuzzleRefreshResult)
async def refresh_puzzle(
    user_id: UUID = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
):
    """
    Asigna un nuevo puzzle al usuario. Útil cuando aún no tiene uno o quiere cambiar el actual.
    """
    return await PuzzleController.refresh_puzzle(user_id, db)

@router.get("/user/{username}", response_model=PaginatedPuzzleSolves)
async def get_user_solves(
    username: str,
    only_rated: bool = Query(True),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Obtiene los puzzles que un usuario ha resuelto, filtrando si fueron rateados o no.
    """
    return await PuzzleController.get_paginated_solves_by_username(username, only_rated, page, page_size, db)

@router.get("/{username}/stats", response_model=PuzzleSolveStatsResponse)
async def get_stats_for_user(
    username: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Devuelve estadísticas de solves del usuario.
    """
    return await PuzzleController.get_stats_by_username(username, db)