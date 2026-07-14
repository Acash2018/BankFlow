from fastapi import APIRouter

from app.schemas import ApiInfoResponse, HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/", response_model=ApiInfoResponse, include_in_schema=False)
def api_info() -> ApiInfoResponse:
    return ApiInfoResponse(
        name="BankFlow REST API",
        version="1.0.0",
        documentation="/docs",
        health="/health",
    )


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")
