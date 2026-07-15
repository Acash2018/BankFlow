from typing import Protocol

from BankAccount import BankAccount
from CheckingAccount import CheckingAccount
from Customer import Customer
from SavingsAccount import SavingsAccount
from Transaction import Transaction
from TransactionType import TransactionType

Account = CheckingAccount | SavingsAccount


class BankRepository(Protocol):
    backend_name: str

    def list_customers(self) -> list[Customer]: ...
    def get_customer(self, customer_id: str) -> Customer | None: ...
    def save_customer(self, customer: Customer) -> None: ...
    def get_account(self, account_number: str) -> Account | None: ...
    def save_account(self, account: Account) -> None: ...
    def close(self) -> None: ...


class BankStore:
    """In-memory repository used for development and isolated tests."""

    backend_name = "memory"

    def __init__(self) -> None:
        self.customers: dict[str, Customer] = {}
        self.accounts: dict[str, Account] = {}

    def list_customers(self) -> list[Customer]:
        return list(self.customers.values())

    def get_customer(self, customer_id: str) -> Customer | None:
        return self.customers.get(customer_id)

    def save_customer(self, customer: Customer) -> None:
        self.customers[customer.customer_id] = customer

    def get_account(self, account_number: str) -> Account | None:
        return self.accounts.get(account_number)

    def save_account(self, account: Account) -> None:
        self.accounts[account.account_number] = account

    def close(self) -> None:
        pass


class MongoBankStore:
    """MongoDB repository using customers and accounts collections."""

    backend_name = "mongodb"

    def __init__(self, url: str, database_name: str) -> None:
        from pymongo import ASCENDING, MongoClient

        self.client = MongoClient(url, serverSelectionTimeoutMS=5000)
        self.client.admin.command("ping")
        self.database = self.client[database_name]
        self.customers = self.database["customers"]
        self.accounts = self.database["accounts"]
        self.customers.create_index([("customer_id", ASCENDING)], unique=True)
        self.accounts.create_index([("account_number", ASCENDING)], unique=True)
        self.accounts.create_index([("customer_id", ASCENDING)])

    def list_customers(self) -> list[Customer]:
        return [self._document_to_customer(document) for document in self.customers.find()]
    
    
    


    def get_customer(
        self,
        customer_id: str,
    ) -> Customer | None:
        """Retrieve a customer and all accounts belonging to them."""

        # Find the customer document.
        document = self.customers.find_one(
            {"customer_id": customer_id}
        )

        # Return None so the dependency can produce a 404 response.
        if document is None:
            return None

        # This helper also queries and reconstructs the customer's accounts.
        return self._document_to_customer(document)
    
    def save_customer(self, customer: Customer) -> None:
        self.customers.replace_one(
            # Find a document with the same customer ID.
            {"customer_id": customer.customer_id},
            # Replace the matching document with this new document.
            {
                "customer_id": customer.customer_id,
                "name": customer.name,
                "email": customer.email,
            },
            # If no matching document exists, insert one.
            upsert=True,
        )
    
    

    def get_account(self, account_number: str) -> Account | None:
        document = self.accounts.find_one({"account_number": account_number})
        if document is None:
            return None
        customer_document = self.customers.find_one({"customer_id": document["customer_id"]})
        if customer_document is None:
            return None
        owner = self._customer_without_accounts(customer_document)
        return self._document_to_account(document, owner)

    def save_account(self, account: Account) -> None:
        document = {
            "account_number": account.account_number,
            "customer_id": account.owner.customer_id,
            "account_type": "checking" if isinstance(account, CheckingAccount) else "savings",
            "balance": account.balance,
            "transactions": [
                {
                    "transaction_type": transaction.transaction_type.value,
                    "amount": transaction.amount,
                    "timestamp": transaction.timestamp,
                }
                for transaction in account.transaction_history
            ],
        }
        if isinstance(account, CheckingAccount):
            document["overdraft_limit"] = account.overdraft_limit
        else:
            document["minimum_balance"] = account.minimum_balance
        self.accounts.replace_one(
            {"account_number": account.account_number}, document, upsert=True
        )

    def close(self) -> None:
        self.client.close()

    def _document_to_customer(self, document: dict) -> Customer:
        # Reconstruct the customer domain object.
        customer = self._customer_without_accounts(document)

        # Find every account owned by this customer.
        account_documents = self.accounts.find(
            {"customer_id": customer.customer_id}
        )

        for account_document in account_documents:
            account = self._document_to_account(
                account_document,
                customer,
            )

            # Inside the loop
            customer.add_account(account)

        # Outside the loop
        return customer

    @staticmethod
    def _customer_without_accounts(document: dict) -> Customer:
        return Customer(document["customer_id"], document["name"], document["email"])

    @staticmethod
    def _document_to_account(document: dict, owner: Customer) -> Account:
        if document["account_type"] == "checking":
            account: BankAccount = CheckingAccount(
                owner,
                document["account_number"],
                document["balance"],
                document.get("overdraft_limit", 500),
            )
        else:
            account = SavingsAccount(
                owner,
                document["account_number"],
                document["balance"],
                document.get("minimum_balance", 100),
            )
        account.transaction_history = [
            Transaction(
                TransactionType(item["transaction_type"]),
                item["amount"],
                item["timestamp"],
            )
            for item in document.get("transactions", [])
        ]
        return account
