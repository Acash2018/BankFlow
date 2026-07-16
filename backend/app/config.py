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
    session_secret: str = os.getenv(
        "SESSION_SECRET",
        "",
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
