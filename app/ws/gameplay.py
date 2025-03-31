from fastapi import WebSocket, WebSocketDisconnect, Depends
from uuid import UUID
from app.ws.manager.game import game_manager
from app.database.connection import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.game import Game
from app.cache.game import get_active_game
import logging

async def websocket_game(
    websocket: WebSocket,
    game_id: UUID,
    user_id: UUID,
    db: AsyncSession
):
    await websocket.accept()

    # 🔎 Verificar que el juego existe y el jugador participa
    game = await db.get(Game, game_id)
    if not game:
        await websocket.close(code=4004)
        return

    if user_id not in [game.white_id, game.black_id]:
        await websocket.close(code=4003)
        return

    # ✅ Conectamos
    game_manager.connect(game_id, user_id, websocket)

    # Esperamos a que estén ambos jugadores
    white_connected = game_manager.get(game_id, game.white_id)
    black_connected = game_manager.get(game_id, game.black_id)

    if white_connected and black_connected:
        # 🔥 Ambos conectados → enviamos `game_start`
        active_game = await get_active_game(game_id)
        await game_manager.broadcast_to_game(game_id, {
            "type": "game_start",
            "game_id": str(game_id),
            "initial_fen": active_game.current_fen,
            "your_time": active_game.white_time_remaining if user_id == game.white_id else active_game.black_time_remaining,
            "opponent_time": active_game.black_time_remaining if user_id == game.white_id else active_game.white_time_remaining,
        })
    else:
        await websocket.send_json({
            "type": "waiting_for_opponent"
        })

    try:
        while True:
            data = await websocket.receive_json()
            logging.debug(f"📥 [{user_id}] Mensaje en partida {game_id}: {data}")

            if data.get("type") == "move":
                # Aquí vendría handle_move(...)
                ...
            elif data.get("type") == "resign":
                ...
            # etc...

    except WebSocketDisconnect:
        game_manager.disconnect(game_id, user_id)
        logging.info(f"🔌 Usuario {user_id} salió de la partida {game_id}")
