from datetime import datetime, timedelta, timezone

import jwt
from jwt import InvalidTokenError

from pwdlib import PasswordHash


password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Convert a plain-text password into a secure hash."""

    return password_hash.hash(password)

def create_access_token(
    admin_id: str,
    email: str,
    secret: str,
    algorithm: str,
    expiration_minutes: int,
) -> str:
    now = datetime.now(timezone.utc)

    payload = {
        # "sub" identifies the administrator.
        "sub": admin_id,

        # Optional administrator information.
        "email": email,
        "role": "admin",

        # Time when the token was issued.
        "iat": now,

        # Time after which the token must be rejected.
        "exp": now + timedelta(minutes=expiration_minutes),
    }

    return jwt.encode(
        payload,
        secret,
        algorithm=algorithm,
    )

def decode_access_token(
    token: str,
    secret: str,
    algorithm: str,
) -> dict:
    try:
        return jwt.decode(
            token,
            secret,
            algorithms=[algorithm],
        )
    except InvalidTokenError as error:
        raise ValueError("Invalid or expired access token") from error

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
    """Normalize email addresses before comparison."""

    return email.strip().lower()