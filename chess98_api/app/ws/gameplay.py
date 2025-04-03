from fastapi import WebSocket, WebSocketDisconnect, Depends
from uuid import UUID
from app.ws.manager.game import game_manager
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.game import Game
from app.cache.game import get_active_game, save_active_game
from app.services.move import handle_move, InvalidMove, handle_timeout_loss
from app.services.user_actions import handle_resign, handle_draw_offer, handle_draw_accept, handle_chat_message
from app.services.timer import get_timeout_loser
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

    # 🎯 Marcar como reconectado si estaba en `disconnected_players`
    active_game = await get_active_game(game_id)
    if user_id in active_game.disconnected_players:
        active_game.disconnected_players.remove(user_id)
        await save_active_game(active_game)
        logging.info(f"🔄 Jugador {user_id} se reconectó a la partida {game_id}")

        # 🔔 Notificar al jugador reconectado
        await websocket.send_json({
            "type": "reconnected",
            "message": "Has vuelto a la partida"
        })

        # 🔔 Notificar al oponente
        opponent_id = (
            game.white_id if user_id == game.black_id else game.black_id
        )
        opponent_ws = game_manager.get(game_id, opponent_id)
        if opponent_ws:
            await opponent_ws.send_json({
                "type": "opponent_reconnected",
                "user_id": str(user_id)
            })

    # ✅ Verificamos conexiones
    white_connected = game_manager.get(game_id, game.white_id)
    black_connected = game_manager.get(game_id, game.black_id)

    if white_connected and black_connected:
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
                uci = data.get("uci")

                if not uci:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Missing 'uci' in move message"
                    })
                    continue

                # 🧱 Chequear si ambos están conectados
                active_game = await get_active_game(game_id)
                if len(active_game.disconnected_players) > 0:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Esperando a que el oponente se reconecte"
                    })
                    continue

                try:
                    await handle_move(game_id, user_id, uci, db)
                except InvalidMove as e:
                    await websocket.send_json({
                        "type": "error",
                        "message": str(e)
                    })

            elif data.get("type") == "check_timeout":
                active_game = await get_active_game(game_id)

                if not active_game or active_game.status != "active":
                    continue  # Nada que hacer

                # Solo si ambos están conectados
                if len(active_game.disconnected_players) > 0:
                    continue

                loser = get_timeout_loser(active_game)

                if loser:
                    await handle_timeout_loss(game_id, loser, active_game, db)

            elif data.get("type") == "resign":
                await handle_resign(game_id, user_id, db)

            elif data.get("type") == "draw_offer":
                await handle_draw_offer(game_id, user_id)

            elif data.get("type") == "draw_accept":
                await handle_draw_accept(game_id, db)

            elif data.get("type") == "chat_message":
                message = data.get("message")
                username = data.get("username")
                
                if message:
                    await handle_chat_message(game_id, username, message)
                else:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Mensaje vacío no permitido."
                    })

    except WebSocketDisconnect:
        # Desconectar del manager
        game_manager.disconnect(game_id, user_id)
        logging.info(f"🔌 Usuario {user_id} salió de la partida {game_id}")

        # Registrar en ActiveGame
        active_game = await get_active_game(game_id)
        active_game.paused = True
        if user_id not in active_game.disconnected_players:
            active_game.disconnected_players.append(user_id)

        await save_active_game(active_game)