import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    mongodb_url: str | None = os.getenv("MONGODB_URL")
    mongodb_database: str = os.getenv("MONGODB_DATABASE", "bankflow")


settings = Settings()
