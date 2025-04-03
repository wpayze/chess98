from fastapi import FastAPI, WebSocket
from uuid import UUID
import logging

from app.database.connection import AsyncSessionLocal
from app.ws.find_game import websocket_find_game
from app.ws.gameplay import websocket_game

def register_websockets(app: FastAPI):
    @app.websocket("/ws/find_game")
    async def ws_find_game(websocket: WebSocket):
        user_id_param = websocket.query_params.get("user_id")
        if not user_id_param:
            logging.warning("❌ Conexión a /ws/find_game sin user_id")
            await websocket.close(code=1008)
            return

        try:
            user_id = UUID(user_id_param)
        except ValueError:
            logging.warning(f"❌ user_id inválido en /ws/find_game: {user_id_param}")
            await websocket.close(code=1008)
            return

        logging.info(f"🔗 Usuario {user_id} conectado a /ws/find_game")
        async with AsyncSessionLocal() as db:
            await websocket_find_game(websocket, user_id, db)

    @app.websocket("/ws/game/{game_id}")
    async def ws_game(websocket: WebSocket, game_id: UUID):
        user_id_param = websocket.query_params.get("user_id")
        if not user_id_param:
            logging.warning("❌ Conexión a /ws/game sin user_id")
            await websocket.close(code=1008)
            return

        try:
            user_id = UUID(user_id_param)
        except ValueError:
            logging.warning(f"❌ user_id inválido en /ws/game: {user_id_param}")
            await websocket.close(code=1008)
            return

        logging.info(f"🎮 Usuario {user_id} conectado a /ws/game/{game_id}")
        async with AsyncSessionLocal() as db:
            await websocket_game(websocket, game_id, user_id, db)
