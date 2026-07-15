from fastapi import APIRouter, status

from app.dependencies import StoreDependency, get_account_or_404, get_customer_or_404
from app.schemas import AccountCreate, AccountResponse, MoneyRequest, TransactionResponse
from app.serializers import serialize_account, serialize_transactions
from app.services import apply_transaction, create_account as create_account_service

router = APIRouter(tags=["Accounts"])


@router.post(
    "/customers/{customer_id}/accounts",
    response_model=AccountResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_account(
    customer_id: str,
    payload: AccountCreate,
    store: StoreDependency,
) -> AccountResponse:
    customer = get_customer_or_404(store, customer_id)
    return serialize_account(create_account_service(store, customer, payload))


@router.get("/customers/{customer_id}/accounts", response_model=list[AccountResponse])
def list_customer_accounts(customer_id: str, store: StoreDependency) -> list[AccountResponse]:
    customer = get_customer_or_404(store, customer_id)
    return [serialize_account(account) for account in customer.accounts]


@router.get("/accounts/{account_number}", response_model=AccountResponse)
def get_account(account_number: str, store: StoreDependency) -> AccountResponse:
    return serialize_account(get_account_or_404(store, account_number))


@router.post("/accounts/{account_number}/deposits", response_model=AccountResponse)
def deposit(
    account_number: str,
    payload: MoneyRequest,
    store: StoreDependency,
) -> AccountResponse:
    account = get_account_or_404(store, account_number)
    return serialize_account(apply_transaction(store, account, payload.amount, "deposit"))


@router.post("/accounts/{account_number}/withdrawals", response_model=AccountResponse)
def withdraw(
    account_number: str,
    payload: MoneyRequest,
    store: StoreDependency,
) -> AccountResponse:
    account = get_account_or_404(store, account_number)
    return serialize_account(apply_transaction(store, account, payload.amount, "withdraw"))


@router.get(
    "/accounts/{account_number}/transactions",
    response_model=list[TransactionResponse],
)
def list_transactions(
    account_number: str,
    store: StoreDependency,
) -> list[TransactionResponse]:
    return serialize_transactions(get_account_or_404(store, account_number))
