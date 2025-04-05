from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_, func

from app.utils.time import parse_time_control
from aiocache.serializers import JsonSerializer
from aiocache import SimpleMemoryCache
from fastapi import HTTPException
import random
from app.ws.manager.game import game_manager

from app.models.game import Game, GameStatus
from app.models.user import User 

from app.services.profile import get_profile_by_user_id

from app.schemas import QueuedPlayer
from app.schemas.active_game import ActiveGame, PlayerColor
import logging
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.schemas.game import GameOut, GameResult, GameSummary, OpponentSummary, PaginatedGames, GameTermination
from app.utils.elo import update_ratings

cache = SimpleMemoryCache(serializer=JsonSerializer())

def map_result(result: GameResult, color: PlayerColor):
    from app.schemas.active_game import PlayerColor
    from app.models.game import GameResult

    result = GameResult(result)
    color = PlayerColor(color)

    if result == GameResult.draw:
        return "draw"
    if (result == GameResult.white_win and color == PlayerColor.white) or \
       (result == GameResult.black_win and color == PlayerColor.black):
        return "win"
    return "loss"

def get_rating_change(game: Game, color: PlayerColor) -> int:
    if color == PlayerColor.white:
        return game.white_rating_change or 0
    else:
        return game.black_rating_change or 0

async def get_game_by_id(game_id: UUID, db: AsyncSession) -> GameOut:
    result = await db.execute(
        select(Game)
        .options(
            selectinload(Game.white_player).selectinload(User.profile),
            selectinload(Game.black_player).selectinload(User.profile)
        )
        .where(Game.id == game_id)
    )
    game = result.scalar_one_or_none()

    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    return GameOut.model_validate(game)

async def get_games_by_user(user_id: UUID, page: int, page_size: int, db: AsyncSession) -> PaginatedGames:
    offset = (page - 1) * page_size

    total_result = await db.execute(
        select(func.count())
        .select_from(Game)
        .where(
            or_(Game.white_id == user_id, Game.black_id == user_id),
            Game.status != GameStatus.active
        )
    )
    total_games = total_result.scalar_one()

    result = await db.execute(
        select(Game)
        .where(
            or_(Game.white_id == user_id, Game.black_id == user_id),
            Game.status != GameStatus.active
        )
        .options(
            selectinload(Game.white_player).selectinload(User.profile),
            selectinload(Game.black_player).selectinload(User.profile),
            selectinload(Game.moves)
        )
        .order_by(Game.start_time.desc())
        .offset(offset)
        .limit(page_size)
    )

    games = result.scalars().all()
    summaries = []

    for game in games:
        is_white = game.white_id == user_id
        player_color = PlayerColor.white if is_white else PlayerColor.black
        opponent = game.black_player if is_white else game.white_player
        rating = game.black_rating if is_white else game.white_rating

        summaries.append(GameSummary(
            id=game.id,
            time_control=game.time_control,
            time_control_str=game.time_control_str,
            opponent=OpponentSummary(
                id=opponent.id,
                username=opponent.username,
                rating=rating
            ),
            player_color=player_color,
            result=map_result(game.result, player_color),
            end_reason=game.termination.value if game.termination else "unknown",
            date=game.end_time or game.start_time,
            moves=len(game.moves),
            rating_change=get_rating_change(game, player_color),
            final_position=game.final_fen
        ))

    total_pages = (total_games + page_size - 1) // page_size

    return PaginatedGames(
        games=summaries,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        total_games=total_games
    )

# Crea y guarda un Game en la base de datos
async def create_game(
    db: AsyncSession,
    white_id: UUID,
    black_id: UUID,
    time_control: str,
    time_control_str: str,
    white_rating: int = 1200,
    black_rating: int = 1200
) -> Game:
    game = Game(
        id=uuid4(),
        white_id=white_id,
        black_id=black_id,
        time_control=time_control,
        time_control_str=time_control_str,
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
    players = [player1, player2]
    random.shuffle(players)
    white, black = players[0], players[1]

    white_profile = await get_profile_by_user_id(white.user_id, db)
    black_profile = await get_profile_by_user_id(black.user_id, db)

    rating_type = white.time_control_str  # e.g., 'bullet', 'blitz', etc.

    white_rating = white_profile.ratings.get(rating_type, 1200)
    black_rating = black_profile.ratings.get(rating_type, 1200)

    # Crear partida en la base de datos
    game = await create_game(
        db=db,
        white_id=white.user_id,
        black_id=black.user_id,
        time_control=white.time_control,
        time_control_str=white.time_control_str,
        white_rating=white_rating,
        black_rating=black_rating
    )

    #initial_time, increment = parse_time_control(game.time_control)
    # TODO Esto tiene que ir a redis.
    # Crear el estado activo en caché
    # active_game = ActiveGame(
    #     game_id=game.id,
    #     white_id=white.user_id,
    #     black_id=black.user_id,
    #     current_fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    #     turn=PlayerColor.white,
    #     white_time_remaining=initial_time,
    #     black_time_remaining=initial_time,
    #     initial_time=initial_time,
    #     increment=increment,
    #     last_move_timestamp=None,
    #     moves_san=[],
    #     moves_uci=[],
    #     status="active",
    #     white_rating=white_rating,
    #     black_rating=black_rating
    # )

    #await cache.set(f"active_game:{game.id}", active_game.model_dump(mode="json"), ttl=3600)
    return game.id

async def handle_game_over(
    game_id: UUID,
    active_game: ActiveGame,
    result: GameResult,
    termination: GameTermination,
    db: AsyncSession
):
    white_change, black_change = update_ratings(
        white_rating=active_game.white_rating,
        black_rating=active_game.black_rating,
        result=result
    )

    white_profile = await get_profile_by_user_id(active_game.white_id, db)
    black_profile = await get_profile_by_user_id(active_game.black_id, db)

    time_control = active_game.time_control_str

    # ✅ Reasignar el dict completo para que SQLAlchemy lo detecte
    ratings_white = dict(white_profile.ratings)
    ratings_white[time_control] += white_change
    white_profile.ratings = ratings_white

    ratings_black = dict(black_profile.ratings)
    ratings_black[time_control] += black_change
    black_profile.ratings = ratings_black

    # 📊 Estadísticas
    white_profile.total_games += 1
    black_profile.total_games += 1

    if result == GameResult.white_win:
        white_profile.wins += 1
        black_profile.losses += 1
    elif result == GameResult.black_win:
        black_profile.wins += 1
        white_profile.losses += 1
    else:
        white_profile.draws += 1
        black_profile.draws += 1

    # 📝 Guardar resultado en la base de datos
    game = await db.get(Game, game_id)
    game.status = GameStatus.completed
    game.result = result
    game.termination = termination
    game.final_fen = active_game.current_fen
    game.pgn = "\n".join(active_game.moves_san)
    game.end_time = datetime.now(timezone.utc)
    game.white_rating_change = white_change
    game.black_rating_change = black_change

    await db.commit()

    # 📢 Notificar a los jugadores
    await game_manager.broadcast_to_game(game_id, {
        "type": "game_over",
        "result": result.value,
        "termination": termination.value
    })

