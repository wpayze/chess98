import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context
from app.core.config import DATABASE_URL
from app.database.base import Base

# Import models!
import app.models

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata
connectable = create_async_engine(DATABASE_URL, poolclass=pool.NullPool)


async def run_migrations() -> None:
    """Ejecutar las migraciones de manera asíncrona."""
    async with connectable.connect() as connection:
        await connection.run_sync(do_migrations)


def do_migrations(connection):
    """Configurar y ejecutar las migraciones en la base de datos."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Ejecutar migraciones en modo online (esperando la ejecución asíncrona)."""
    asyncio.run(run_migrations())


def run_migrations_offline() -> None:
    """Ejecutar migraciones en modo offline."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


# Determinar el modo de ejecución de Alembic
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()