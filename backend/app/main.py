from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import accounts, customers, health
from app.store import BankRepository, BankStore, MongoBankStore


def create_repository() -> BankRepository:
    if settings.mongodb_url:
        return MongoBankStore(settings.mongodb_url, settings.mongodb_database)
    return BankStore()


def create_app(repository: BankRepository | None = None) -> FastAPI:
    selected_repository = repository or create_repository()

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        application.state.bank = selected_repository
        yield
        application.state.bank.close()

    application = FastAPI(
        title="BankFlow REST API",
        description="Backend API for customers, bank accounts, and transactions.",
        version="1.0.0",
        lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    # Also initialize here for TestClient and direct ASGI inspection.
    application.state.bank = selected_repository
    application.include_router(health.router)
    application.include_router(customers.router, prefix="/api")
    application.include_router(accounts.router, prefix="/api")
    return application


app = create_app()
