from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- Importar el middleware

from app.routes.auth import router as auth_router
from app.routes.game import router as game_router
from app.routes.user import router as user_router
from app.routes.settings import router as settings_router
from app.routes.profile import router as profile_router
from app.routes.puzzle import router as puzzle_router


from app.ws.entrypoints import register_websockets
from app.core.cache import setup_cache
import logging

logging.basicConfig(level=logging.DEBUG)

app = FastAPI()
setup_cache()

# origins = [
#     "http://localhost",
#     "http://localhost:3000", 
#     "https://chess98.com",
# ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tambien puedo usar origins si quiero.
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc)
    allow_headers=["*"],  # Permitir todos los headers
)

app.include_router(auth_router)
app.include_router(game_router) 
app.include_router(user_router) 
app.include_router(settings_router) 
app.include_router(profile_router) 
app.include_router(puzzle_router) 

register_websockets(app)

@app.get("/")
async def root():
    return {"message": "Hello World"}
