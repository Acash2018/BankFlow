from fastapi.testclient import TestClient

from api import app
from app.store import BankStore


client = TestClient(app)


def setup_function():
    app.state.bank = BankStore()


def test_root_describes_api():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["documentation"] == "/docs"


def create_customer_and_account(account_type="checking"):
    client.post(
        "/api/customers",
        json={"customer_id": "C001", "name": "Ada Lovelace", "email": "ada@example.com"},
    )
    payload = {
        "account_number": "A001",
        "account_type": account_type,
        "opening_balance": 500,
    }
    return client.post("/api/customers/C001/accounts", json=payload)


def test_customer_account_and_transactions_flow():
    response = create_customer_and_account()
    assert response.status_code == 201

    response = client.post("/api/accounts/A001/deposits", json={"amount": 50})
    assert response.status_code == 200
    assert response.json()["balance"] == 550

    response = client.post("/api/accounts/A001/withdrawals", json={"amount": 100})
    assert response.status_code == 200
    assert response.json()["balance"] == 450

    transactions = client.get("/api/accounts/A001/transactions").json()
    assert [item["transaction_type"] for item in transactions] == ["deposit", "withdrawal"]


def test_savings_account_enforces_minimum_balance():
    assert create_customer_and_account("savings").status_code == 201
    response = client.post("/api/accounts/A001/withdrawals", json={"amount": 450})
    assert response.status_code == 400
    assert response.json()["detail"] == "Withdrawal would violate minimum balance requirement"


def test_duplicate_and_missing_resources_return_rest_errors():
    create_customer_and_account()
    duplicate = client.post(
        "/api/customers",
        json={"customer_id": "C001", "name": "Other", "email": "other@example.com"},
    )
    assert duplicate.status_code == 409
    assert client.get("/api/accounts/missing").status_code == 404
