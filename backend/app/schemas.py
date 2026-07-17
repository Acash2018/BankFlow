from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class CustomerCreate(BaseModel):
    customer_id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    email: EmailStr


class CustomerResponse(CustomerCreate):
    account_numbers: list[str]
    total_balance: float

class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    admin: AdminResponse


class AccountCreate(BaseModel):
    account_number: str = Field(min_length=1)
    account_type: Literal["checking", "savings"]
    opening_balance: float = Field(default=0, ge=0)
    overdraft_limit: float = Field(default=500, ge=0)
    minimum_balance: float = Field(default=100, ge=0)


class AccountResponse(BaseModel):
    account_number: str
    customer_id: str
    account_type: Literal["checking", "savings"]
    balance: float
    overdraft_limit: float | None = None
    minimum_balance: float | None = None


class MoneyRequest(BaseModel):
    amount: float = Field(gt=0)


class TransactionResponse(BaseModel):
    transaction_type: str
    amount: float
    timestamp: datetime


class HealthResponse(BaseModel):
    status: Literal["ok"]


class ApiInfoResponse(BaseModel):
    name: str
    version: str
    documentation: str
    health: str


class AdminLoginRequest(BaseModel):
    """Credentials submitted by the administrator."""

    email: EmailStr
    password: str = Field(min_length=8)

class AdminResponse(BaseModel):
    """Safe administrator information returned by the API."""

    admin_id: str
    name: str
    email: EmailStr
    role: Literal["admin"]

class LoginResponse(BaseModel):
    """Response returned after a successful login."""

    admin: AdminResponse
    message: str