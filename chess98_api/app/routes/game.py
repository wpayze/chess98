from fastapi import APIRouter, Depends, Query
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.controllers.game import GameController
from app.schemas.game import GameSummary
from typing import List

router = APIRouter(prefix="/games", tags=["games"])

@router.get("/{game_id}")
async def get_game(game_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Devuelve los detalles de una partida por su ID.
    """
    return await GameController.get_game(game_id, db)

@router.get("/user/{user_id}", response_model=List[GameSummary])
async def list_user_games(
    user_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Devuelve las partidas de un usuario.
    """
    return await GameController.list_user_games(user_id, page, page_size, db)
