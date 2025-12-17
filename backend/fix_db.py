import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost/autonoma"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        print("Adding columns to users table...")
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR"))
            print("Added full_name")
        except Exception as e:
            print(f"full_name error: {e}")
        
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN phone_number VARCHAR"))
            print("Added phone_number")
        except Exception as e:
            print(f"phone_number error: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
