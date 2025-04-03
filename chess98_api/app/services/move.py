import chess
from uuid import UUID
from datetime import datetime, timezone
from app.cache.game import get_active_game, save_active_game
from app.ws.manager.game import game_manager
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.game import Game, GameStatus, GameResult, GameTermination
from app.services.timer import update_time, apply_increment, now_utc
from app.schemas.active_game import ActiveGame, PlayerColor
import logging

class InvalidMove(Exception):
    pass

async def handle_move(game_id: UUID, user_id: UUID, uci_move: str, db: AsyncSession):
    active_game = await get_active_game(game_id)
    if not active_game or active_game.status != "active":
        raise InvalidMove("Partida no activa o no encontrada.")
    
    if active_game.paused:
        raise InvalidMove("El juego está pausado, esperando reconexión.")

    # Validar turno
    expected_turn = (
        active_game.white_id if active_game.turn == PlayerColor.white else active_game.black_id
    )
    if user_id != expected_turn:
        raise InvalidMove("No es tu turno.")

    board = chess.Board(active_game.current_fen)

    try:
        move = chess.Move.from_uci(uci_move)
    except ValueError:
        raise InvalidMove("Formato de movimiento inválido.")

    if move not in board.legal_moves:
        raise InvalidMove("Movimiento ilegal.")

    # ⏱ Actualizar reloj antes del movimiento
    loser_by_timeout = await update_time(active_game)
    if loser_by_timeout:
        await handle_timeout_loss(game_id, loser_by_timeout, active_game, db)
        return

    # ✅ Movimiento válido, aplicar
    san = board.san(move)
    board.push(move)
    apply_increment(active_game)

    # 🕒 Actualizar estado del juego
    active_game.current_fen = board.fen()
    active_game.last_move_timestamp = now_utc()
    active_game.turn = (
        PlayerColor.black if active_game.turn == PlayerColor.white else PlayerColor.white
    )
    active_game.moves_uci.append(uci_move)
    active_game.moves_san.append(san)

    await save_active_game(active_game)

    await game_manager.broadcast_to_game(game_id, {
        "type": "move_made",
        "uci": uci_move,
        "san": san,
        "fen": active_game.current_fen,
        "turn": active_game.turn,
        "white_time": active_game.white_time_remaining,
        "black_time": active_game.black_time_remaining,
    })

    await check_game_end(game_id, board, active_game, db)

async def check_game_end(
    game_id: UUID,
    board: chess.Board,
    active_game,
    db: AsyncSession
):
    if board.is_game_over():
        result = None
        termination = None

        if board.is_checkmate():
            winner = "white" if active_game.turn == "black" else "black"
            result = GameResult.white_win if winner == "white" else GameResult.black_win
            termination = GameTermination.checkmate

        elif board.is_stalemate():
            result = GameResult.draw
            termination = GameTermination.stalemate

        elif board.is_insufficient_material():
            result = GameResult.draw
            termination = GameTermination.insufficient_material

        elif board.can_claim_threefold_repetition():
            result = GameResult.draw
            termination = GameTermination.threefold_repetition

        elif board.can_claim_fifty_moves():
            result = GameResult.draw
            termination = GameTermination.fifty_move_rule

        # Guardar en la base de datos
        game = await db.get(Game, game_id)
        game.result = result
        game.termination = termination
        game.status = GameStatus.completed
        game.final_fen = board.fen()
        game.pgn = "\n".join(active_game.moves_san)
        game.end_time = datetime.now(timezone.utc)

        await db.commit()

        # Notificar a los jugadores
        await game_manager.broadcast_to_game(game_id, {
            "type": "game_over",
            "result": result.value,
            "termination": termination.value
        })

        logging.info(f"🏁 Partida {game_id} terminada por {termination.value}")

async def handle_timeout_loss(game_id: UUID, loser_color: PlayerColor, active_game: ActiveGame, db: AsyncSession):
    result = (
        GameResult.black_win if loser_color == PlayerColor.white else GameResult.white_win
    )

    # Actualizar estado en caché
    active_game.status = GameTermination.timeout.value
    await save_active_game(active_game)

    # Guardar resultado en DB
    game = await db.get(Game, game_id)
    game.status = GameStatus.completed
    game.result = result
    game.termination = GameTermination.timeout
    game.final_fen = active_game.current_fen
    game.pgn = "\n".join(active_game.moves_san)
    game.end_time = datetime.now(timezone.utc)
    await db.commit()

    # Notificar a ambos jugadores
    await game_manager.broadcast_to_game(game_id, {
        "type": "game_over",
        "termination": GameTermination.timeout.value,
        "result": result.value,
    })

    logging.info(f"🏁 Juego {game_id} finalizado por timeout. Perdedor: {loser_color}")