from aiocache import SimpleMemoryCache
from aiocache.serializers import JsonSerializer
from app.schemas import QueuedPlayer
from app.services.game import create_game_and_active_game
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from app.ws.manager.matchmaking import matchmaking_manager
import logging
import json

# TODO: abstraer el cache a una funcion que vaya en /cache -> ejemplo /cache/matchmaking.py
cache = SimpleMemoryCache(serializer=JsonSerializer())

async def find_match(queued_player: QueuedPlayer, db: AsyncSession) -> Optional[UUID]:
    queue_key = f"queue:{queued_player.time_control}"
    queue = await cache.get(queue_key) or []

    # 🪵 Log para ver tipo y contenido de la cola
    logging.debug(f"📦 Cola [{queue_key}] tipo: {type(queue)} contenido: {queue}")

    # Protección opcional, por si viene como string (ya no debería pasar)
    if isinstance(queue, str):
        try:
            queue = json.loads(queue)
            logging.warning(f"⚠️ Cola '{queue_key}' venía como string, fue parseada")
        except Exception as e:
            logging.error(f"❌ Error al parsear la cola '{queue_key}': {e}")
            queue = []

    # 🧠 Buscar al primer oponente disponible y conectado
    opponent = None
    while queue:
        opponent_data = queue.pop(0)
        temp = QueuedPlayer.model_validate(opponent_data)
        if matchmaking_manager.get(temp.user_id):
            opponent = temp
            break
        else:
            logging.warning(f"⚠️ Oponente {temp.user_id} desconectado, ignorando")

    if opponent:
        if opponent.user_id == queued_player.user_id:
            logging.warning("⚠️ Jugador fue emparejado consigo mismo, descartando")

            # 👤 Volvemos a agregar al jugador original a la cola
            queue.append(queued_player.model_dump(mode="json"))
            await cache.set(queue_key, queue)
            return None

        # 🎯 Oponente válido
        game_id = await create_game_and_active_game(queued_player, opponent, db)
        await cache.set(queue_key, queue)
        await notify_players(game_id, [queued_player.user_id, opponent.user_id])
        return game_id

    # 👤 Si no se encontró oponente válido, dejamos al jugador en cola
    queue.append(queued_player.model_dump(mode="json"))
    await cache.set(queue_key, queue)
    logging.info(f"Jugador {queued_player.user_id} añadido a la cola {queue_key}")
    return None


async def notify_players(game_id: UUID, user_ids: list[UUID]):
    for uid in user_ids:
        ws = matchmaking_manager.get(uid)
        if not ws:
            continue

        try:
            await ws.send_json({
                "type": "match_found",
                "game_id": str(game_id)
            })
            matchmaking_manager.disconnect(uid)
        except RuntimeError as e:
            logging.warning(f"⚠️ WebSocket cerrado para {uid}: {e}")
            matchmaking_manager.disconnect(uid)