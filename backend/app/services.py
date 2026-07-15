from fastapi import HTTPException

from app.schemas import AccountCreate, CustomerCreate
from app.store import Account, BankRepository
from CheckingAccount import CheckingAccount
from Customer import Customer
from SavingsAccount import SavingsAccount


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
