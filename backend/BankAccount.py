from datetime import datetime

from Transaction import Transaction
from TransactionType import TransactionType


class BankAccount: 
    '''
    Here we define our back account class with arguments for the owner, balance, and account number.

    owner: The name of the account owner.
    balance: the initial balance of the account, defaulting to 0 is not provided.
    account number: uniqur identifier for the account.
    transaction history represents a list of all transactions made on the account.
    '''
    def __init__(self, owner, balance=0, account_number=None):
        self.owner = owner
        self.balance = balance
        self.account_number = account_number
        self.transaction_history = []
    
    def _record_transaction(self, transaction_type, amount):
        """Create a transaction and add it to the account history."""
        transaction = Transaction(
            transaction_type=transaction_type,
            amount=amount,
            timestamp=datetime.now(),
        )

        self.transaction_history.append(transaction)
        return transaction

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self.balance += amount
        self._record_transaction(TransactionType.DEPOSIT, amount)
        print(f"Deposit of ${amount:.2f} successful.\nNew balance: ${self.balance:.2f}")

        return self.balance

    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
        self._record_transaction(TransactionType.WITHDRAWAL, amount)
        print(f"Withdrawal of ${amount:.2f} successful.\nNew balance: ${self.balance:.2f}")
        return self.balance

    def get_balance(self):
        return self.balance

    def get_transaction_history(self):
        return self.transaction_history

    def display_balance(self):
        print(f"Current balance: ${self.balance:.2f}")

    def display_transactions(self):
        print("Transaction history:")
        for transaction in self.transaction_history:
            transaction_type = transaction.transaction_type.value.title()
            print(
                f"- {transaction_type}: ${transaction.amount:.2f} "
                f"at {transaction.timestamp:%Y-%m-%d %H:%M:%S}"
            )

'''
Encapsulation: BankAccount groups account data (owner, balance, 
transaction history) with the methods that manage it, such as deposit() 
and withdraw(). Callers use these operations instead of manually changing 
the balance. 

Abstraction: The methods hide the transaction details 
from main.py. For example, deposit(500) updates the balance, 
validates the amount, and records the transaction through one simple call

'''
