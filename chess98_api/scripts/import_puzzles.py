import sys
from pathlib import Path
import csv
import asyncio

# Agregar la raíz del proyecto al path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert

from app.database.connection import AsyncSessionLocal
from app.models.puzzle import Puzzle


CSV_PATH = "puzzles.csv"
BATCH_SIZE = 1000

def parse_row(row: dict) -> dict:
    return {
        "id": row["PuzzleId"],
        "fen": row["FEN"],
        "moves": row["Moves"].split(),
        "rating": float(row["Rating"]),
        "rating_deviation": float(row["RatingDeviation"]),
        "popularity": float(row["Popularity"]),
        "times_played": 0,
        "themes": row["Themes"].split(),
        "game_url": row["GameUrl"] or None,
    }


async def insert_batch(session: AsyncSession, batch: list[dict]):
    await session.execute(insert(Puzzle), batch)
    await session.commit()


async def bulk_insert_puzzles():
    async with AsyncSessionLocal() as session:
        with open(CSV_PATH, newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            batch = []
            count = 0

            for row in reader:
                batch.append(parse_row(row))
                if len(batch) >= BATCH_SIZE:
                    await insert_batch(session, batch)
                    count += len(batch)
                    print(f"Inserted {count} puzzles...")
                    batch.clear()

            if batch:
                await insert_batch(session, batch)
                count += len(batch)
                print(f"Inserted final batch. Total: {count} puzzles.")


if __name__ == "__main__":
    asyncio.run(bulk_insert_puzzles())
