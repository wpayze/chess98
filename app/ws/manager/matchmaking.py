from fastapi import WebSocket
from uuid import UUID
from typing import Optional
import logging

class MatchmakingConnectionManager:
    def __init__(self):
        self.active_connections: dict[UUID, WebSocket] = {}

    def connect(self, user_id: UUID, websocket: WebSocket):
        self.active_connections[user_id] = websocket
        logging.debug(f"🔌 Usuario conectado: {user_id}")

    def disconnect(self, user_id: UUID):
        self.active_connections.pop(user_id, None)
        logging.debug(f"❌ Usuario desconectado: {user_id}")

    def get(self, user_id: UUID) -> Optional[WebSocket]:
        return self.active_connections.get(user_id)

    async def send_to_user(self, user_id: UUID, message: dict):
        ws = self.get(user_id)
        if not ws:
            logging.warning(f"⚠️ Usuario {user_id} no tiene conexión activa.")
            return

        try:
            await ws.send_json(message)
        except RuntimeError as e:
            logging.warning(f"⚠️ WebSocket cerrado para {user_id}, desconectando. Error: {e}")
            self.disconnect(user_id)

matchmaking_manager = MatchmakingConnectionManager()
