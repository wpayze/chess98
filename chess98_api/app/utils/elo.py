from app.models.game import GameResult

def expected_score(rating_a: int, rating_b: int) -> float:
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))

def update_ratings(white_rating: int, black_rating: int, result: GameResult, k: int = 20) -> tuple[int, int]:
    """
    Retorna la diferencia de ELO para ambos jugadores como (white_change, black_change)
    """
    expected_white = expected_score(white_rating, black_rating)
    expected_black = expected_score(black_rating, white_rating)

    if result == GameResult.white_win:
        actual_white, actual_black = 1, 0
    elif result == GameResult.black_win:
        actual_white, actual_black = 0, 1
    elif result == GameResult.draw:
        actual_white = actual_black = 0.5
    else:
        raise ValueError(f"Resultado desconocido: {result}")

    white_change = round(k * (actual_white - expected_white))
    black_change = round(k * (actual_black - expected_black))

    return white_change, black_change

def update_puzzle_rating(user_rating: int, puzzle_rating: int, success: bool, k: int = 40) -> int:
    actual_score = 1 if success else 0
    expected = expected_score(user_rating, puzzle_rating)
    delta = round(k * (actual_score - expected))
    return delta