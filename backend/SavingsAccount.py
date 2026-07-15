from BankAccount import BankAccount


class SavingsAccount(BankAccount):
    def __init__(self, owner, account_number, balance=0, minimum_balance=100):

        '''
        Initialize a SavingsAccount instance.
        Args:
            owner: Customer who owns the account.
            account_number: Unique identifier for the account.
            balance: Starting account balance.
            minimum_balance: Lowest balance permitted after a withdrawal.
        '''
        super().__init__(owner, balance, account_number)
        self.minimum_balance = minimum_balance

    def withdraw(self, amount):
        '''Withdraw money while preserving the required minimum balance.'''
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        if self.balance - amount < self.minimum_balance:
            raise ValueError("Withdrawal would violate minimum balance requirement")
        return super().withdraw(amount)
