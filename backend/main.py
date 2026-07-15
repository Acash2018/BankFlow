from CheckingAccount import CheckingAccount
from Customer import Customer
from SavingsAccount import SavingsAccount
from fastapi.middleware.cors import CORSMiddleware
'''
This just simply displays our menu to the user

'''
def display_menu(account):
    print(f"\nCurrent account: {account.account_number} ({type(account).__name__})")
    print("1. Deposit")
    print("2. Withdraw")
    print("3. Check balance")
    print("4. View transaction history")
    print("5. Create another account")
    print("6. Switch accounts")
    print("7. View total customer balance")
    print("8. Exit")

'''
This function reads the amount the user wants to deposit or withdraw and ensures that the input is valid.
 It also allows for zero deposits if specified.
'''
def read_amount(prompt, allow_zero=False):
    while True:
        try:
            amount = float(input(prompt))
            minimum = 0 if allow_zero else 0.01

            if amount < minimum:
                print(f"Amount must be at least ${minimum:.2f}.")
                continue

            return amount
        except ValueError:
            print("Please enter a valid number.")

'''
This method is in charge of creating a customer by promting the user 
for their customer ID, name, and email. 
It returns a Customer Object.
'''
def create_customer():
    print("Welcome to the Bank Account Management System")
    customer_id = input("Customer ID: ").strip()
    name = input("Name: ").strip()
    email = input("Email: ").strip()
    return Customer(customer_id, name, email)

'''
This simply creates an account for the customer by prompting the user to choose between a checking or savings account,
and then asking for the account number and opening balance.
It returns the created account object.
'''


def create_account(customer):
    print("\nChoose an account type:")
    print("1. Checking")
    print("2. Savings")

    while True:
        account_type = input("Choice: ").strip()
        if account_type in {"1", "2"}:
            break
        print("Invalid option. Please choose 1 or 2.")

    account_number = input("Account number: ").strip()
    opening_balance = read_amount("Opening balance: $", allow_zero=True)

    if account_type == "1":
        overdraft_limit = read_amount(
            "Overdraft limit: $",
            allow_zero=True,
        )

        account = CheckingAccount(
            owner=customer,
            account_number=account_number,
            balance=opening_balance,
            overdraft_limit=overdraft_limit,
        )
    else:
        account = SavingsAccount(
            owner=customer,
            account_number=account_number,
            balance=opening_balance,
        )

    customer.add_account(account)
    print(f"{type(account).__name__} {account_number} created successfully.")
    return account




def select_account(customer, current_account):
    print("\nCustomer accounts:")
    for index, account in enumerate(customer.accounts, start=1):
        marker = " (current)" if account is current_account else ""
        print(
            f"{index}. {account.account_number} - "
            f"{type(account).__name__}{marker}"
        )

    while True:
        try:
            choice = int(input("Select an account: "))
            if 1 <= choice <= len(customer.accounts):
                return customer.accounts[choice - 1]
            print("Please select a valid account number from the list.")
        except ValueError:
            print("Please select a valid account number from the list.")

'''
This is the entry point of our program.
'''
def main():
    customer = create_customer()
    account = create_account(customer)

    while True:
        display_menu(account)
        choice = input("Choose an option: ").strip()

        try:
            if choice == "1":
                account.deposit(read_amount("Deposit amount: $"))
            elif choice == "2":
                account.withdraw(read_amount("Withdrawal amount: $"))
            elif choice == "3":
                account.display_balance()
            elif choice == "4":
                account.display_transactions()
            elif choice == "5":
                account = create_account(customer)
            elif choice == "6":
                account = select_account(customer, account)
            elif choice == "7":
                print(f"Total customer balance: ${customer.get_total_balance():.2f}")
            elif choice == "8":
                print("Thank you for using BankFlow.")
                break
            else:
                print("Invalid option. Please choose 1 through 8.")
        except ValueError as error:
            print(f"Error: {error}")


if __name__ == "__main__":
    main()
