from fastapi import APIRouter

from app.schemas import ApiInfoResponse, HealthResponse

router = APIRouter(tags=["Health"])

'''
This is the main endpoint for the API that returns some basic information about the API itself, 
such as its name, version, and links to the 
documentation and health check endpoints.
'''
@router.get("/", response_model=ApiInfoResponse, include_in_schema=False)
def api_info() -> ApiInfoResponse:
    return ApiInfoResponse(
        name="BankFlow REST API",
        version="1.0.0",
        documentation="/docs",
        health="/health",
    )


'''
This is a simple health check endpoint for the API that you get right out of the box w/ FastAPI.
It returns a JSON response with the status of the API to see if the backend is up and running.
'''

@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")
