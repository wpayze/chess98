from fastapi import WebSocket, WebSocketDisconnect, Depends
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import QueuedPlayer
from app.services.matchmaking import find_match
from app.ws.manager import manager
from app.database.connection import get_db
from aiocache import SimpleMemoryCache
from aiocache.serializers import JsonSerializer

cache = SimpleMemoryCache(serializer=JsonSerializer())

async def websocket_find_game(
    websocket: WebSocket,
    user_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    await websocket.accept()
    manager.connect(user_id, websocket)

    try:
        while True:
            try:
                data = await websocket.receive_json()
            except RuntimeError:
                # WebSocket ya no está conectado (ej: cerrado por notify_players)
                break
    
            data = await websocket.receive_json()

            if data.get("type") == "find_game":
                time_control = data.get("time_control", "blitz_5min")

                player = QueuedPlayer(
                    user_id=user_id,
                    rating=1200,  # TODO: traer el rating real desde la DB
                    time_control=time_control,
                    joined_at=datetime.utcnow()
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

                await websocket.close()
                await websocket.send_json({
                    "type": "search_cancelled"
                })

    except WebSocketDisconnect:
        manager.disconnect(user_id)
