from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.config import settings
from app.routers import accounts, customers, health
from app.store import BankRepository, BankStore, MongoBankStore
from app.services import ensure_bootstrap_admin
from backend.app.routers import auth

def create_repository() -> BankRepository:
    if settings.mongodb_url:
        return MongoBankStore(settings.mongodb_url, settings.mongodb_database)
    return BankStore()


def create_app(repository: BankRepository | None = None) -> FastAPI:
    selected_repository = repository or create_repository()
    if not settings.session_secret:
        raise RuntimeError(
            "SESSION_SECRET must be configured"
        )

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        application.state.bank = selected_repository
        # Create the first administrator only when one
        # does not already exist.
        ensure_bootstrap_admin(
            selected_repository,
            settings,
        )
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
    application.add_middleware(
        SessionMiddleware,
        secret_key=settings.session_secret,
        # JavaScript cannot read this cookie.
        https_only=settings.cookie_secure,

        # Same-site requests only. Use the same hostname
        # for frontend and backend during development.
        same_site="strict",

        # Session expires when the browser session ends.
        max_age=None,
    )
    # Also initialize here for TestClient and direct ASGI inspection.
    application.state.bank = selected_repository
    application.include_router(health.router)
    application.include_router(customers.router, prefix="/api")
    application.include_router(accounts.router, prefix="/api")
    application.include_router(auth.router, prefix="/api",)

    

    # Ensure the bootstrap admin exists when the app starts.
    ensure_bootstrap_admin(application.state.bank)

    return application


app = create_app()
