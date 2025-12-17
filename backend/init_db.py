import asyncio
from database import engine, Base
import models

async def init_api():
    async with engine.begin() as conn:
        print("Creating tables...")
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_api())
