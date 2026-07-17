from fastapi import APIRouter, HTTPException, Response, status

from app.auth import create_access_token
from app.dependencies import (
    AdminDependency,
    SettingsDependency,
    StoreDependency,
)
from app.schemas import AccessTokenResponse, AdminLoginRequest, AdminResponse
from app.services import authenticate_admin


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=AccessTokenResponse)
def login(
    payload: AdminLoginRequest,
    store: StoreDependency,
    settings: SettingsDependency,
) -> AccessTokenResponse:
    """Verify administrator credentials and issue an access token."""

    admin = authenticate_admin(
        store=store,
        email=payload.email,
        password=payload.password,
    )
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(
        admin_id=admin["admin_id"],
        email=admin["email"],
        secret=settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
        expiration_minutes=settings.jwt_expiration_minutes,
    )

    return AccessTokenResponse(
        access_token=token,
        admin=AdminResponse(
            admin_id=admin["admin_id"],
            name=admin["name"],
            email=admin["email"],
            role=admin["role"],
        ),
    )


@router.get("/me", response_model=AdminResponse)
def current_admin(admin: AdminDependency) -> AdminResponse:
    """Return the administrator represented by the bearer token."""

    return admin


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout() -> Response:
    """Complete logout; the frontend removes its stored JWT."""

    return Response(status_code=status.HTTP_204_NO_CONTENT)
