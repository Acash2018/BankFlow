# BankFlow REST API

BankFlow provides a backend-only REST API built with FastAPI. The application is organized into routers, schemas, services, serializers, dependencies, and an in-memory repository. Restarting the server clears customers, accounts, and transactions.

## Backend structure

```text
app/
|-- main.py          # Application factory and router registration
|-- routers/         # Customer, account, and health endpoints
|-- schemas.py       # Request and response models
|-- services.py      # Banking use cases
|-- serializers.py   # Domain-to-API response mapping
|-- dependencies.py  # FastAPI dependencies
`-- store.py         # In-memory repository
```

## Run locally

```powershell
python -m pip install -r requirements.txt
python -m uvicorn api:app --reload
```

Open `http://127.0.0.1:8000/docs` for the generated OpenAPI/Swagger documentation.

## Endpoints

- `GET /`
- `GET /health`
- `POST|GET /api/customers`
- `GET /api/customers/{customer_id}`
- `POST|GET /api/customers/{customer_id}/accounts`
- `GET /api/accounts/{account_number}`
- `POST /api/accounts/{account_number}/deposits`
- `POST /api/accounts/{account_number}/withdrawals`
- `GET /api/accounts/{account_number}/transactions`

No frontend is included.
