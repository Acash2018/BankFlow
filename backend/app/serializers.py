from app.schemas import AccountResponse, CustomerResponse, TransactionResponse
from app.store import Account
from CheckingAccount import CheckingAccount
from Customer import Customer


"""
This module contains functions to serialize Customer, Account, and Transaction objects
into their corresponding response schemas.
"""

def serialize_customer(customer: Customer) -> CustomerResponse:
    return CustomerResponse(
        customer_id=customer.customer_id,
        name=customer.name,
        email=customer.email,
        account_numbers=[account.account_number for account in customer.accounts],
        total_balance=customer.get_total_balance(),
    )


def serialize_account(account: Account) -> AccountResponse:
    is_checking = isinstance(account, CheckingAccount)
    return AccountResponse(
        account_number=account.account_number,
        customer_id=account.owner.customer_id,
        account_type="checking" if is_checking else "savings",
        balance=account.balance,
        overdraft_limit=account.overdraft_limit if is_checking else None,
        minimum_balance=None if is_checking else account.minimum_balance,
    )


def serialize_transactions(account: Account) -> list[TransactionResponse]:
    return [
        TransactionResponse(
            transaction_type=transaction.transaction_type.value,
            amount=transaction.amount,
            timestamp=transaction.timestamp,
        )
        for transaction in account.get_transaction_history()
    ]
