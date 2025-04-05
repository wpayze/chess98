from aiocache import SimpleMemoryCache
from aiocache.serializers import JsonSerializer
from uuid import UUID
from typing import Optional
from app.schemas.active_game import ActiveGame

#TODO borrar
# TESTING _ BORRARLAS JUNTO CON LA OTRA VERSION DE GET ACTIVE GAME
# TESTING _ BORRARLAS JUNTO CON LA OTRA VERSION DE GET ACTIVE GAME
# TESTING _ BORRARLAS JUNTO CON LA OTRA VERSION DE GET ACTIVE GAME
from app.database.connection import AsyncSessionLocal
from app.models.game import Game
from app.utils.time import parse_time_control
from app.schemas.active_game import PlayerColor
# TESTING _ BORRARLAS JUNTO CON LA OTRA VERSION DE GET ACTIVE GAME
# TESTING _ BORRARLAS JUNTO CON LA OTRA VERSION DE GET ACTIVE GAME
# TESTING _ BORRARLAS JUNTO CON LA OTRA VERSION DE GET ACTIVE GAME

cache = SimpleMemoryCache(serializer=JsonSerializer())

def _key(game_id: UUID) -> str:
    return f"active_game:{game_id}"
#TODO PASAR TODO EL CACHE A REDIS :(
#CORRECTA: 
# async def get_active_game(game_id: UUID) -> Optional[ActiveGame]:
#     data = await cache.get(_key(game_id))
#     if data:
#         return ActiveGame.model_validate(data)
#     return None

# TESTING!! LA VERSION DE ARRIBA ES LA CORRECTA
async def get_active_game(game_id: UUID) -> Optional[ActiveGame]:
    cache_key = f"active_game:{game_id}"
    data = await cache.get(cache_key)

    if data:
        return ActiveGame.model_validate(data)

    # 🧪 Fallback solo para desarrollo / debugging
    print(f"⚠️ ActiveGame no encontrado en cache para {game_id}, reconstruyendo desde DB (modo desarrollo)")

    async with AsyncSessionLocal() as db:
        game = await db.get(Game, game_id)
        if not game:
            return None

        initial_time, increment = parse_time_control(game.time_control)

        reconstructed = ActiveGame(
            game_id=game.id,
            white_id=game.white_id,
            black_id=game.black_id,
            current_fen=game.initial_fen,
            turn=PlayerColor.white,
            initial_time=initial_time,
            increment=increment,
            white_time_remaining=initial_time,
            black_time_remaining=initial_time,
            last_move_timestamp=None,
            moves_san=[],
            moves_uci=[],
            white_rating=game.white_rating,
            black_rating=game.black_rating,
            time_control_str=game.time_control_str
        )

        await cache.set(cache_key, reconstructed.model_dump(mode="json"), ttl=3600)
        return reconstructed

async def save_active_game(active_game: ActiveGame, ttl: int = 3600):
    await cache.set(_key(active_game.game_id), active_game.model_dump(mode="json"), ttl=ttl)

async def delete_active_game(game_id: UUID):
    await cache.delete(_key(game_id))
