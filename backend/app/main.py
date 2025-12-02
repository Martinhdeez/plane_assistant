from fastapi import FastAPI
from app.core.config import settings
from app.auth.router import router as auth_router
from app.user.router import router as user_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION
)

app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")

@app.get("/api")
async def root():
    return {"message": "Welcome to Plane Assistant API"}
