from pwdlib import PasswordHash
from fastapi import (
    APIRouter,
    HTTPException,
    Request,
    Response,
    status,
)

from app.dependencies import (
    AdminDependency,
    StoreDependency,
)
from app.schemas import (
    AdminLoginRequest,
    AdminResponse,
    LoginResponse,
)
from app.services import authenticate_admin

# Ask pwdlib to use its recommended password-hashing

password_hash = PasswordHash.recommended()

def hash_password(password: str) -> str:
    """Convert a plain-text password into a secure hash."""

    return password_hash.hash(password)

def verify_password(
    password: str,
    stored_hash: str,
) -> bool:
    """Check a password against its stored hash."""

    return password_hash.verify(
        password,
        stored_hash,
    )

def normalize_email(email: str) -> str:
    """Store and compare administrator emails consistently."""

    return email.strip().lower()

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    payload: AdminLoginRequest,
    request: Request,
    store: StoreDependency,
) -> LoginResponse:
    """Authenticate an administrator and create a session."""

    admin = authenticate_admin(
        store,
        payload.email,
        payload.password,
    )

    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Remove any previous session before assigning the
    # authenticated administrator.
    request.session.clear()
    request.session["admin_id"] = admin["admin_id"]

    public_admin = AdminResponse(
        admin_id=admin["admin_id"],
        name=admin["name"],
        email=admin["email"],
        role=admin["role"],
    )

    return LoginResponse(
        admin=public_admin,
        message="Login successful",
    )

    @router.get(
    "/me",
    response_model=AdminResponse,
)
    def current_admin(
        admin: AdminDependency,
    ) -> AdminResponse:
        """Restore the currently authenticated administrator."""

        return admin


    @router.post(
        "/logout",
        status_code=status.HTTP_204_NO_CONTENT,
    )

    
    def logout(
        request: Request,
    ) -> Response:
        """Destroy the current administrator session."""

        request.session.clear()

        return Response(
            status_code=status.HTTP_204_NO_CONTENT
        )
