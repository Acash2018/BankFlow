from fastapi import HTTPException

from app.schemas import AccountCreate, CustomerCreate
from app.store import Account, BankStore
from CheckingAccount import CheckingAccount
from Customer import Customer
from SavingsAccount import SavingsAccount


def create_customer(store: BankStore, payload: CustomerCreate) -> Customer:
    if payload.customer_id in store.customers:
        raise HTTPException(status_code=409, detail="Customer ID already exists")
    customer = Customer(**payload.model_dump())
    store.customers[customer.customer_id] = customer
    return customer


def create_account(store: BankStore, customer: Customer, payload: AccountCreate) -> Account:
    if payload.account_number in store.accounts:
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
    store.accounts[account.account_number] = account
    return account


def apply_transaction(account: Account, amount: float, operation: str) -> Account:
    try:
        getattr(account, operation)(amount)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return account
