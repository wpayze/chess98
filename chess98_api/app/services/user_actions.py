from uuid import UUID
from datetime import datetime, timezone
from fastapi import WebSocket
from sqlalchemy.ext.asyncio import AsyncSession

from app.cache.game import get_active_game, save_active_game
from app.ws.manager.game import game_manager
from app.models.game import Game, GameStatus, GameResult, GameTermination
from app.schemas.active_game import PlayerColor


async def handle_resign(game_id: UUID, user_id: UUID, db: AsyncSession):
    active_game = await get_active_game(game_id)

    if not active_game or active_game.status != "active":
        return

    if user_id == active_game.white_id:
        loser_color = PlayerColor.white
    else:
        loser_color = PlayerColor.black

    result = (
        GameResult.black_win if loser_color == PlayerColor.white else GameResult.white_win
    )

    # Actualizar estado en caché
    active_game.status = GameTermination.resignation.value
    await save_active_game(active_game)

    # Guardar resultado en DB
    game = await db.get(Game, game_id)
    game.status = GameStatus.completed
    game.result = result
    game.termination = GameTermination.resignation
    game.final_fen = active_game.current_fen
    game.pgn = "\n".join(active_game.moves_san)
    game.end_time = datetime.now(timezone.utc)
    await db.commit()

    # Notificar a ambos jugadores
    await game_manager.broadcast_to_game(game_id, {
        "type": "game_over",
        "termination": GameTermination.resignation.value,
        "result": result.value,
    })

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

    active_game.status = GameTermination.draw_agreement
    await save_active_game(active_game)

    game = await db.get(Game, game_id)
    game.status = GameStatus.completed
    game.result = GameResult.draw
    game.termination = GameTermination.draw_agreement
    game.final_fen = active_game.current_fen
    game.pgn = "\n".join(active_game.moves_san)
    game.end_time = datetime.now(timezone.utc)
    await db.commit()

    await game_manager.broadcast_to_game(game_id, {
        "type": "game_over",
        "termination": GameTermination.draw_agreement.value,
        "result": GameResult.draw.value,
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
