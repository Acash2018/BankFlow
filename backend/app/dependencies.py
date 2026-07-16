from typing import Annotated

from fastapi import Depends, HTTPException, Request

from app.store import Account, BankRepository
from Customer import Customer

from fastapi import (
    Depends,
    HTTPException,
    Request,
    status,
)

from app.schemas import AdminResponse

def get_store(request: Request) -> BankRepository:
    return request.app.state.bank


StoreDependency = Annotated[BankRepository, Depends(get_store)]


def get_customer_or_404(store: BankRepository, customer_id: str) -> Customer:
    customer = store.get_customer(customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


def get_account_or_404(store: BankRepository, account_number: str) -> Account:
    account = store.get_account(account_number)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

def require_admin(
    request: Request,
    store: StoreDependency,
) -> AdminResponse:
    """Return the signed-in administrator or raise 401."""

    # SessionMiddleware verifies the cookie signature before
    # exposing its contents through request.session.
    admin_id = request.session.get("admin_id")

    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    admin = store.get_admin_by_id(admin_id)

    if admin is None:
        # Clear invalid sessions whose administrator no
        # longer exists.
        request.session.clear()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    return AdminResponse(
        admin_id=admin["admin_id"],
        name=admin["name"],
        email=admin["email"],
        role=admin["role"],
    )


AdminDependency = Annotated[
    AdminResponse,
    Depends(require_admin),
]