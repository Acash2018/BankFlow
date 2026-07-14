from fastapi import FastAPI

from app.routers import accounts, customers, health
from app.store import BankStore


def create_app() -> FastAPI:
    application = FastAPI(
        title="BankFlow REST API",
        description="Backend API for customers, bank accounts, and transactions.",
        version="1.0.0",
    )
    application.state.bank = BankStore()
    application.include_router(health.router)
    application.include_router(customers.router, prefix="/api")
    application.include_router(accounts.router, prefix="/api")
    return application


app = create_app()
