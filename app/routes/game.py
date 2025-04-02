from fastapi import APIRouter, Depends
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.controllers.game import GameController

router = APIRouter(prefix="/games", tags=["games"])

@router.get("/{game_id}")
async def get_game(game_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Devuelve los detalles de una partida por su ID.
    """
    return await GameController.get_game(game_id, db)
