from fastapi import HTTPException
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.game import get_game_by_id, get_games_by_user, get_recent_games
from app.services.user import get_user_by_username 

class GameController:
    @staticmethod
    async def get_game(game_id: UUID, db: AsyncSession):
        game = await get_game_by_id(game_id, db)

        if not game:
            raise HTTPException(status_code=404, detail="Game not found")

        return game

    @staticmethod
    async def list_user_games(username: str, page: int, page_size: int, db: AsyncSession):
        user = await get_user_by_username(username, db)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return await get_games_by_user(user.id, page, page_size, db)
    
    @staticmethod
    async def list_recent_games(page: int, page_size: int, db: AsyncSession):
        return await get_recent_games(page, page_size, db)