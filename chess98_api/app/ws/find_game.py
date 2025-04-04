from fastapi import WebSocket, WebSocketDisconnect, Depends
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import QueuedPlayer
from app.services.matchmaking import find_match
from app.ws.manager.matchmaking import matchmaking_manager
from app.database.connection import get_db
from aiocache import SimpleMemoryCache
from aiocache.serializers import JsonSerializer
from app.constants.time_control import TimeControl

# TODO: abstraer el cache a una funcion que vaya en /cache -> ejemplo /cache/matchmaking.py
cache = SimpleMemoryCache(serializer=JsonSerializer())

async def websocket_find_game(
    websocket: WebSocket,
    user_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    await websocket.accept()
    matchmaking_manager.connect(user_id, websocket)

    try:
        while True:
            try:
                data = await websocket.receive_json()
            except RuntimeError:
                # WebSocket ya no está conectado (ej: cerrado por notify_players)
                break

            if data.get("type") == "find_game":
                time_control = data.get("time_control")
                time_control_str = data.get("time_control_str")

                # Si no se manda time_control, o es inválido → cerrar
                if not time_control or time_control not in TimeControl._value2member_map_:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Invalid or missing time control"
                    })
                    await websocket.close()
                    matchmaking_manager.disconnect(user_id)
                    return

                player = QueuedPlayer(
                    user_id=user_id,
                    rating=1200,  # TODO: traer el rating real desde la DB
                    time_control=time_control,
                    time_control_str=time_control_str,
                    joined_at=datetime.now(timezone.utc)
                )

                game_id = await find_match(player, db)

                if not game_id:
                    await websocket.send_json({
                        "type": "waiting_for_match"
                    })

            elif data.get("type") == "cancel_search":
                time_control = data.get("time_control", "blitz_5min")
                queue_key = f"queue:{time_control}"
                queue = await cache.get(queue_key) or []

                # Filtrar al jugador actual
                filtered_queue = [
                    q for q in queue if str(q.get("user_id")) != str(user_id)
                ]

                await cache.set(queue_key, filtered_queue)
                matchmaking_manager.disconnect(user_id)
                await websocket.close()

    except WebSocketDisconnect:
        matchmaking_manager.disconnect(user_id)
