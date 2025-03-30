from fastapi import FastAPI
from app.routes.auth import router as auth_router
from app.ws.entrypoints import register_websockets
from app.core.cache import setup_cache
import logging
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()
setup_cache()

app.include_router(auth_router)
register_websockets(app)

@app.get("/")
async def root():
    return {"message": "Hello World"}
