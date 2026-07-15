from typing import Annotated

from fastapi import Depends, HTTPException, Request

from app.store import Account, BankRepository
from Customer import Customer


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
