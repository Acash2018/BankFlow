

from datetime import datetime

from BankAccount import BankAccount
from Transaction import Transaction
from TransactionType import TransactionType


class CheckingAccount(BankAccount):
    '''
    A bank account that allows for overdrafts up to a specified limit. 
    Inherits from BankAccount.
    '''
    def __init__(self, owner, account_number, balance=0, overdraft_limit=500):
        '''
        Initialize a CheckingAccount instance.
        Args:
            owner: Customer who owns the account.
            account_number: Unique identifier for the account.
            balance: Starting account balance.
            overdraft_limit: Maximum amount that can be overdrawn.
        '''
        if overdraft_limit < 0:
            raise ValueError("Overdraft limit cannot be negative")

        super().__init__(owner, balance, account_number)
        self.overdraft_limit = overdraft_limit

    def withdraw(self, amount):
        '''
        Method to withdraw from an account.
        '''
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        
        available_funds = self.balance + self.overdraft_limit

        if amount > available_funds:
            raise ValueError("Insufficient funds")
        
        self.balance -= amount
        self._record_transaction(TransactionType.WITHDRAWAL, amount)
        print(f"Withdrawal of ${amount:.2f} successful.\nNew balance: ${self.balance:.2f}")
        return self.balance
