from fastapi import FastAPI, WebSocket
from app.ws.game import websocket_find_game
from app.database.connection import AsyncSessionLocal
from uuid import UUID

def register_websockets(app: FastAPI):
    @app.websocket("/ws/find_game")
    async def ws_find_game(websocket: WebSocket):
        user_id_param = websocket.query_params.get("user_id")
        if not user_id_param:
            await websocket.close(code=1008)
            return

        try:
            user_id = UUID(user_id_param)
        except ValueError:
            await websocket.close(code=1008)
            return

        async with AsyncSessionLocal() as db:
            await websocket_find_game(websocket, user_id, db)
