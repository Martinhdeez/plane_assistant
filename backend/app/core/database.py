from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

import os
from dotenv import load_dotenv

load_dotenv()

# Create Async Engine
engine = create_async_engine(
    url=settings.DATABASE_URL,
    echo=True, # Set to False in production
    future=True
)

# Create Async Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# Base class for models
class Base(DeclarativeBase):
    pass

# Dependency to get DB session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
