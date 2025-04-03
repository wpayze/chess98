from fastapi import HTTPException
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.game import get_game_by_id 

class GameController:
    @staticmethod
    async def get_game(game_id: UUID, db: AsyncSession):
        game = await get_game_by_id(game_id, db)

        if not game:
            raise HTTPException(status_code=404, detail="Game not found")

        return game