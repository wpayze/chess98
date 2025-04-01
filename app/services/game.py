from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from aiocache import caches
from app.utils.time import parse_time_control

from app.models.game import Game, GameStatus
from app.schemas import QueuedPlayer
from app.schemas.active_game import ActiveGame, PlayerColor

cache = caches.get("default")

# Crea y guarda un Game en la base de datos
async def create_game(
    db: AsyncSession,
    white_id: UUID,
    black_id: UUID,
    time_control: str,
    white_rating: int = 1200,
    black_rating: int = 1200
) -> Game:
    game = Game(
        id=uuid4(),
        white_id=white_id,
        black_id=black_id,
        time_control=time_control,
        status=GameStatus.active,
        start_time=datetime.now(timezone.utc),
        white_rating=white_rating,
        black_rating=black_rating
    )

    db.add(game)
    await db.commit()
    await db.refresh(game)
    return game


# Crea el Game (DB) y ActiveGame (cache) y los conecta
async def create_game_and_active_game(
    player1: QueuedPlayer,
    player2: QueuedPlayer,
    db: AsyncSession
) -> UUID:
    white, black = sorted([player1, player2], key=lambda p: p.joined_at)

    # Crear partida en la base de datos
    game = await create_game(
        db=db,
        white_id=white.user_id,
        black_id=black.user_id,
        time_control=white.time_control,
        white_rating=1200,
        black_rating=1200
    )

    initial_time, increment = parse_time_control(game.time_control)

    # Crear el estado activo en caché
    active_game = ActiveGame(
        game_id=game.id,
        white_id=white.user_id,
        black_id=black.user_id,
        current_fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        turn=PlayerColor.white,
        white_time_remaining=initial_time,
        black_time_remaining=initial_time,
        initial_time=initial_time,
        increment=increment,
        last_move_timestamp=None,
        moves_san=[],
        moves_uci=[],
        status="active"
    )

    await cache.set(f"active_game:{game.id}", active_game.model_dump(), ttl=3600)
    return game.id
