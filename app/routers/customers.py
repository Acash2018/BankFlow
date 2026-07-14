from fastapi import APIRouter, status

from app.dependencies import StoreDependency, get_customer_or_404
from app.schemas import CustomerCreate, CustomerResponse
from app.serializers import serialize_customer
from app.services import create_customer as create_customer_service

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, store: StoreDependency) -> CustomerResponse:
    return serialize_customer(create_customer_service(store, payload))


@router.get("", response_model=list[CustomerResponse])
def list_customers(store: StoreDependency) -> list[CustomerResponse]:
    return [serialize_customer(customer) for customer in store.customers.values()]


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: str, store: StoreDependency) -> CustomerResponse:
    return serialize_customer(get_customer_or_404(store, customer_id))
