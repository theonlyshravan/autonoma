import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import traceback

DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost/autonoma"

async def main():
    print(f"Connecting to {DATABASE_URL}...")
    try:
        engine = create_async_engine(DATABASE_URL)
        async with engine.begin() as conn:
            print("Connected. Attempting to add columns...")
            
            # Full Name
            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR"))
                print("SUCCESS: Added full_name column")
            except Exception as e:
                print(f"INFO: Could not add full_name (might exist): {e}")

            # Phone Number
            try:
                await conn.execute(text("ALTER TABLE users ADD COLUMN phone_number VARCHAR"))
                print("SUCCESS: Added phone_number column")
            except Exception as e:
                print(f"INFO: Could not add phone_number (might exist): {e}")
                
        await engine.dispose()
        print("Database patch completed.")
    except Exception as e:
        print("CRITICAL ERROR:")
        traceback.print_exc()
        exit(1)

if __name__ == "__main__":
    asyncio.run(main())
