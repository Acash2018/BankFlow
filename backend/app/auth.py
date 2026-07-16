from pwdlib import PasswordHash


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
    """Normalize email addresses before comparison."""

    return email.strip().lower()