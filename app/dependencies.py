from typing import Annotated

from fastapi import Depends, HTTPException, Request

from app.store import Account, BankStore
from Customer import Customer


def get_store(request: Request) -> BankStore:
    return request.app.state.bank


StoreDependency = Annotated[BankStore, Depends(get_store)]


def get_customer_or_404(store: BankStore, customer_id: str) -> Customer:
    customer = store.customers.get(customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


def get_account_or_404(store: BankStore, account_number: str) -> Account:
    account = store.accounts.get(account_number)
    if account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return account
