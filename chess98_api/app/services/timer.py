from datetime import datetime, timezone
from typing import Optional
from app.schemas.active_game import ActiveGame, PlayerColor

def now_utc():
    return datetime.now(timezone.utc)

async def update_time(active_game: ActiveGame) -> Optional[PlayerColor]:
    """
    Actualiza el tiempo restante del jugador que está por mover.
    Devuelve el color del jugador que perdió por tiempo, si aplica.
    """
    if active_game.last_move_timestamp is None:
        # Si es la primera jugada, solo marcamos el timestamp y salimos
        active_game.last_move_timestamp = now_utc()
        return None

    now = now_utc()
    elapsed = (now - active_game.last_move_timestamp).total_seconds()

    if active_game.turn == PlayerColor.white:
        active_game.white_time_remaining -= int(elapsed)
        if active_game.white_time_remaining <= 0:
            return PlayerColor.white
    else:
        active_game.black_time_remaining -= int(elapsed)
        if active_game.black_time_remaining <= 0:
            return PlayerColor.black

    return None

def apply_increment(active_game: ActiveGame):
    if active_game.turn == PlayerColor.white:
        active_game.white_time_remaining += active_game.increment
    else:
        active_game.black_time_remaining += active_game.increment

def get_timeout_loser(active_game: ActiveGame) -> Optional[PlayerColor]:
    """
    Revisa si el jugador que debe mover ya perdió por tiempo.
    No modifica el estado, solo informa.
    """
    if active_game.last_move_timestamp is None:
        return None  # Aún no empezó la partida

    now = now_utc()
    elapsed = (now - active_game.last_move_timestamp).total_seconds()

    if active_game.turn == PlayerColor.white:
        if active_game.white_time_remaining - int(elapsed) <= 0:
            return PlayerColor.white
    else:
        if active_game.black_time_remaining - int(elapsed) <= 0:
            return PlayerColor.black

    return None
