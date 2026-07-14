from CheckingAccount import CheckingAccount
from Customer import Customer
from SavingsAccount import SavingsAccount

Account = CheckingAccount | SavingsAccount


class BankStore:
    """In-memory repository that can later be replaced by a database adapter."""

    def __init__(self) -> None:
        self.customers: dict[str, Customer] = {}
        self.accounts: dict[str, Account] = {}
