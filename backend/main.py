from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, telemetry, vehicles, insights
from database import engine

app = FastAPI(title="Autonoma Backend", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Restrict for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(telemetry.router)
app.include_router(vehicles.router)
app.include_router(insights.router)

@app.on_event("startup")
async def startup():
    # Verify DB connection
    async with engine.begin() as conn:
        print("Database connection established.")

@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
