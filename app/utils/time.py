def parse_time_control(time_control: str) -> tuple[int, int]:
    """
    Parsea un time control como '5+3' → (300, 3)
    Devuelve (initial_time_seconds, increment_seconds)
    """
    try:
        minutes, increment = time_control.strip().split("+")
        initial_time = int(minutes) * 60
        increment = int(increment)
        return initial_time, increment
    except Exception as e:
        raise ValueError(f"Formato de time_control inválido: '{time_control}'. Debe ser algo como '5+3'. Error: {e}")
