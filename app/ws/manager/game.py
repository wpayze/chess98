from fastapi import WebSocket
from uuid import UUID
from typing import Optional
import logging

class GameConnectionManager:
    def __init__(self):
        # Estructura: { game_id: { user_id: WebSocket } }
        self.connections: dict[UUID, dict[UUID, WebSocket]] = {}

    def connect(self, game_id: UUID, user_id: UUID, websocket: WebSocket):
        self.connections.setdefault(game_id, {})[user_id] = websocket
        logging.debug(f"🎮 Usuario {user_id} conectado al juego {game_id}")

    def disconnect(self, game_id: UUID, user_id: UUID):
        game_conns = self.connections.get(game_id)
        if game_conns:
            game_conns.pop(user_id, None)
            logging.debug(f"❌ Usuario {user_id} desconectado del juego {game_id}")
            if not game_conns:
                self.connections.pop(game_id, None)
                logging.debug(f"💀 Juego {game_id} sin conexiones activas, eliminado del manager")

    def get(self, game_id: UUID, user_id: UUID) -> Optional[WebSocket]:
        return self.connections.get(game_id, {}).get(user_id)

    async def send_to_user(self, game_id: UUID, user_id: UUID, message: dict):
        ws = self.get(game_id, user_id)
        if not ws:
            logging.warning(f"⚠️ Usuario {user_id} no tiene conexión activa en juego {game_id}")
            return

        try:
            await ws.send_json(message)
        except RuntimeError as e:
            logging.warning(f"⚠️ WebSocket cerrado para {user_id} en juego {game_id}: {e}")
            self.disconnect(game_id, user_id)

    async def broadcast_to_game(self, game_id: UUID, message: dict):
        game_conns = self.connections.get(game_id, {})
        disconnected = []

        for user_id, ws in game_conns.items():
            try:
                await ws.send_json(message)
            except RuntimeError as e:
                logging.warning(f"⚠️ WebSocket cerrado para {user_id} en juego {game_id}: {e}")
                disconnected.append(user_id)

        for user_id in disconnected:
            self.disconnect(game_id, user_id)

game_manager = GameConnectionManager()
