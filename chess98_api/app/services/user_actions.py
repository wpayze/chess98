from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.cache.game import get_active_game, save_active_game
from app.ws.manager.game import game_manager
from app.models.game import GameResult, GameTermination
from app.schemas.active_game import PlayerColor
from app.services.game import handle_game_over


async def handle_resign(game_id: UUID, user_id: UUID, db: AsyncSession):
    active_game = await get_active_game(game_id)

    if not active_game or active_game.status != "active":
        return

    loser_color = (
        PlayerColor.white if user_id == active_game.white_id else PlayerColor.black
    )

    result = (
        GameResult.black_win if loser_color == PlayerColor.white else GameResult.white_win
    )
    termination = GameTermination.resignation

    active_game.status = termination.value
    await save_active_game(active_game)

    await handle_game_over(game_id, active_game, result, termination, db)


async def handle_draw_offer(game_id: UUID, user_id: UUID):
    active_game = await get_active_game(game_id)

    if not active_game or active_game.status != "active":
        return

    active_game.draw_offer_by = user_id
    await save_active_game(active_game)

    # Notificar al oponente
    opponent_id = active_game.white_id if user_id == active_game.black_id else active_game.black_id
    opponent_ws = game_manager.get(game_id, opponent_id)
    if opponent_ws:
        await opponent_ws.send_json({
            "type": "draw_offer",
            "from": str(user_id)
        })


async def handle_draw_accept(game_id: UUID, db: AsyncSession):
    active_game = await get_active_game(game_id)

    if not active_game or active_game.status != "active":
        return

    result = GameResult.draw
    termination = GameTermination.draw_agreement

    active_game.status = termination.value
    await save_active_game(active_game)

    await handle_game_over(game_id, active_game, result, termination, db)


async def handle_draw_declined(game_id: UUID, user_id: UUID):
    active_game = await get_active_game(game_id)

    if not active_game or active_game.status != "active":
        return

    active_game.draw_offer_by = None
    await save_active_game(active_game)

    # Notificar al oponente
    opponent_id = active_game.white_id if user_id == active_game.black_id else active_game.black_id
    opponent_ws = game_manager.get(game_id, opponent_id)
    if opponent_ws:
        await opponent_ws.send_json({
            "type": "draw_offer_declined",
            "from": str(user_id)
        })


async def handle_chat_message(game_id: UUID, username: str, message: str):
    # Validación básica
    if not message.strip():
        return

    #TODO cuando maneje las reconexiones debo guardar los chat message en una variable en cache 
    # Y al hacer una reconexion enviarle el objeto entero de mensajes de chat al cliente.

    await game_manager.broadcast_to_game(game_id, {
        "type": "chat_message",
        "from": username,
        "message": message.strip(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
