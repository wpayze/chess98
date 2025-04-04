from fastapi import APIRouter, Depends, Query
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.controllers.game import GameController
from app.schemas.game import PaginatedGames

router = APIRouter(prefix="/games", tags=["games"])

@router.get("/{game_id}")
async def get_game(game_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Devuelve los detalles de una partida por su ID.
    """
    return await GameController.get_game(game_id, db)

@router.get("/user/{username}", response_model=PaginatedGames)
async def list_user_games(
    username: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Devuelve las partidas de un usuario por username.
    """
    return await GameController.list_user_games(username, page, page_size, db)