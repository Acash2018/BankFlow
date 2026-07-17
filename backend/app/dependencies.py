from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.auth import decode_access_token
from app.config import Settings, settings
from app.schemas import AdminResponse
from app.store import Account, BankRepository
from Customer import Customer


def get_store(request: Request) -> BankRepository:
    """Return the repository attached to this FastAPI application."""

    return request.app.state.bank


def get_settings() -> Settings:
    """Return the application's environment-backed settings."""

    return settings


StoreDependency = Annotated[BankRepository, Depends(get_store)]
SettingsDependency = Annotated[Settings, Depends(get_settings)]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_admin(
    token: Annotated[str, Depends(oauth2_scheme)],
    store: StoreDependency,
    settings: SettingsDependency,
) -> AdminResponse:
    """Validate the bearer token and return its administrator."""

    try:
        payload = decode_access_token(
            token=token,
            secret=settings.jwt_secret,
            algorithm=settings.jwt_algorithm,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error

    admin_id = payload.get("sub")
    if not isinstance(admin_id, str) or not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin = store.get_admin_by_id(admin_id)
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Administrator no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return AdminResponse(
        admin_id=admin["admin_id"],
        name=admin["name"],
        email=admin["email"],
        role=admin["role"],
    )


AdminDependency = Annotated[AdminResponse, Depends(get_current_admin)]


def get_customer_or_404(
    store: BankRepository,
    customer_id: str,
) -> Customer:
    customer = store.get_customer(customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


def get_account_or_404(
    store: BankRepository,
    account_number: str,
) -> Account:
    account = store.get_account(account_number)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account
