from fastapi import HTTPException
from uuid import uuid4
from app.auth import (hash_password, verify_password)
from app.config import Settings
from app.schemas import AccountCreate, CustomerCreate
from app.store import Account, BankRepository
from CheckingAccount import CheckingAccount
from Customer import Customer
from SavingsAccount import SavingsAccount
from backend.app.routers.auth import normalize_email


def create_customer(
    store: BankRepository,
    payload: CustomerCreate,
) -> Customer:
    """Create and persist a new customer."""

    # Ask the repository whether this customer ID already exists.
    if store.get_customer(payload.customer_id) is not None:
        # Return HTTP 409 because the new resource conflicts
        # with an existing customer.
        raise HTTPException(
            status_code=409,
            detail="Customer ID already exists",
        )

    # Convert the validated API request into a domain object.
    customer = Customer(
        customer_id=payload.customer_id,
        name=payload.name,
        email=payload.email,
    )

    # Save the customer using MongoDB or the in-memory repository.
    store.save_customer(customer)

    return customer


def create_account(store: BankRepository, customer: Customer, payload: AccountCreate) -> Account:
    if store.get_account(payload.account_number) is not None:
        raise HTTPException(status_code=409, detail="Account number already exists")

    if payload.account_type == "checking":
        account = CheckingAccount(
            customer,
            payload.account_number,
            payload.opening_balance,
            payload.overdraft_limit,
        )
    else:
        if payload.opening_balance < payload.minimum_balance:
            raise HTTPException(
                status_code=400,
                detail="Opening balance must meet the minimum balance",
            )
        account = SavingsAccount(
            customer,
            payload.account_number,
            payload.opening_balance,
            payload.minimum_balance,
        )

    customer.add_account(account)
    store.save_account(account)
    return account


def apply_transaction(
    store: BankRepository, account: Account, amount: float, operation: str
) -> Account:
    try:
        getattr(account, operation)(amount)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    store.save_account(account)
    return account

def ensure_bootstrap_admin(
    store: BankRepository,
    settings: Settings,
) -> None:
    """Create the first development administrator if needed."""

    # Do nothing when bootstrap credentials are not configured.
    if not settings.admin_email or not settings.admin_password:
        return

    email = normalize_email(settings.admin_email)

    # Never replace an existing administrator's password
    # every time the API restarts.
    if store.get_admin_by_email(email) is not None:
        return

    admin = {
        "admin_id": f"ADMIN-{uuid4().hex[:12].upper()}",
        "name": settings.admin_name,
        "email": email,

        # Store only the password hash in MongoDB.
        "password_hash": hash_password(
            settings.admin_password
        ),

        "role": "admin",
    }

    store.save_admin(admin)

def authenticate_admin(
    store: BankRepository,
    email: str,
    password: str,
) -> dict | None:
    """Verify administrator credentials."""

    admin = store.get_admin_by_email(
        normalize_email(email)
    )

    # Return the same failure result whether the email or
    # password is incorrect.
    if admin is None:
        return None

    if not verify_password(
        password,
        admin["password_hash"],
    ):
        return None

    return admin