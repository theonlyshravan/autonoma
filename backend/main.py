from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, telemetry, vehicles, insights, chat, service_center
from database import engine

app = FastAPI(title="Autonoma Backend", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(vehicles.router, prefix="/api/vehicles", tags=["vehicles"])
app.include_router(insights.router, prefix="/api/insights", tags=["insights"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(service_center.router, prefix="/api/service-center", tags=["service-center"])

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
