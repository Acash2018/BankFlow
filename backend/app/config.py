import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    mongodb_url: str | None = os.getenv("MONGODB_URL")
    mongodb_database: str = os.getenv("MONGODB_DATABASE", "bankflow")

# Secret used to sign administrator session cookies.
    #
    # Production must use a long, unpredictable value.
    jwt_secret: str = os.getenv(
        "JWT_SECRET",
        "",
    )

    # Algorithm used to sign JWT access tokens.
    jwt_algorithm: str = os.getenv(
        "JWT_ALGORITHM",
        "HS256",
    )

    # Number of minutes before an access token expires.
    #
    # Environment variables are strings, so int() converts
    # the value into the integer expected by the application.
    jwt_expiration_minutes: int = int(
        os.getenv("JWT_EXPIRATION_MINUTES", "30"),
    )






    # Development administrator used only to create the first
    # admin document when the application starts.
    admin_email: str | None = os.getenv(
        "ADMIN_EMAIL",
    )
    admin_password: str | None = os.getenv(
        "ADMIN_PASSWORD",
    )
    admin_name: str = os.getenv(
        "ADMIN_NAME",
        "BankFlow Administrator",
    )

    # Local development uses HTTP, so Secure must be false.
    # Set COOKIE_SECURE=true after deploying behind HTTPS.
    cookie_secure: bool = (
        os.getenv("COOKIE_SECURE", "false").lower()
        == "true"
    )

settings = Settings()
