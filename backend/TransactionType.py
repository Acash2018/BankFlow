'''
An enum limits the value to predefined choices:
'''


from enum import Enum

"""
TransactionType is an 
enumeration that defines the types 
of transactions that can be performed 
on a bank account"""
class TransactionType(Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
