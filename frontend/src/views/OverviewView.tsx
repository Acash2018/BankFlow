// Import reusable visual components.
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";

// Import only TypeScript types from the API module.
// `import type` removes these imports from the compiled JavaScript.
import type { Account, Customer, Transaction } from "../api";

// Create one formatter that displays numbers as US currency.
//
// Example:
// money.format(1250) returns "$1,250.00".

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Define all values and event handlers that OverviewView
// receives from App.tsx.

interface OverviewViewProps {
  // Every customer loaded from the API.
  customers: Customer[];

  // The customer currently selected by the user.
  selectedCustomer: Customer | null;

  // Accounts belonging to the selected customer.
  accounts: Account[];

  // The account currently selected by the user.
  selectedAccount: Account | null;

  // Transactions belonging to the selected account.
  transactions: Transaction[];

  // Indicates that customer data is being retrieved.
  loading: boolean;

  // Current contents of the deposit/withdrawal amount field.
  amount: string;

  // Called when the user selects a customer.
  onSelectCustomer: (customer: Customer) => void;

  // Called when the user selects an account.
  onSelectAccount: (account: Account) => void;

  // Called when the user changes the transaction amount.
  onAmountChange: (amount: string) => void;

  // Called when the user clicks Open account.
  onOpenAccount: () => void;

  // Called when the user deposits or withdraws money.
  onMoveMoney: (operation: "deposit" | "withdraw") => void | Promise<void>;
}

// Render the dashboard overview.
//
// App.tsx owns the state. OverviewView only displays that state
// and reports user actions through callback properties.
export function OverviewView({
  customers,
  selectedCustomer,
  accounts,
  selectedAccount,
  transactions,
  loading,
  amount,
  onSelectCustomer,
  onSelectAccount,
  onAmountChange,
  onOpenAccount,
  onMoveMoney,
}: OverviewViewProps) {
  // Calculate the total balance of the selected customer's accounts.
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );

  return (
    <>
      {/* High-level summary cards. */}
      <section className="metrics">
        <article>
          <div className="metric-icon green">
            <Icon name="wallet" />
          </div>

          <div>
            <span>Selected balance</span>

            <strong>{money.format(totalBalance)}</strong>

            <small>
              Across {accounts.length}{" "}
              {accounts.length === 1 ? "account" : "accounts"}
            </small>
          </div>
        </article>

        <article>
          <div className="metric-icon blue">
            <Icon name="users" />
          </div>

          <div>
            <span>Customers</span>

            <strong>{customers.length}</strong>

            <small>Active profiles</small>
          </div>
        </article>

        <article>
          <div className="metric-icon amber">
            <Icon name="arrow" />
          </div>

          <div>
            <span>Recent activity</span>

            <strong>{transactions.length}</strong>

            <small>Selected account</small>
          </div>
        </article>
      </section>

      {/* Main overview workspace. */}
      <section className="workspace">
        {/* Customer directory panel. */}
        <div className="panel customer-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Directory</span>

              <h2>Customers</h2>
            </div>

            <span className="count">{customers.length}</span>
          </div>

          <div className="customer-list">
            {/* Show a loading message while customers are
                being retrieved from FastAPI. */}
            {loading ? (
              <div className="empty">Loading customers…</div>
            ) : customers.length === 0 ? (
              // Show an empty state when there are no customers.
              <div className="empty">
                <Icon name="users" />

                <strong>No customers yet</strong>

                <span>Create the first customer to get started.</span>
              </div>
            ) : (
              // Create one selectable button per customer.
              customers.map((customer) => (
                <button
                  key={customer.customer_id}
                  type="button"
                  className={
                    selectedCustomer?.customer_id === customer.customer_id
                      ? "customer active"
                      : "customer"
                  }
                  onClick={() => onSelectCustomer(customer)}
                >
                  {/* Generate initials from the customer's name. */}
                  <span className="avatar">
                    {customer.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>

                  <span>
                    <strong>{customer.name}</strong>
                    <small>{customer.email}</small>
                  </span>

                  <span className="customer-total">
                    {money.format(customer.total_balance)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Account portfolio panel. */}
        <div className="panel account-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Portfolio</span>

              <h2>
                {selectedCustomer
                  ? `${selectedCustomer.name}'s accounts`
                  : "Select a customer"}
              </h2>
            </div>

            {/* An account can only be opened after selecting
                the customer who will own it. */}
            {selectedCustomer && (
              <Button
                variant="secondary"
                icon={<Icon name="plus" />}
                onClick={onOpenAccount}
              >
                Open account
              </Button>
            )}
          </div>

          {!selectedCustomer ? (
            // No customer has been selected.
            <div className="empty large">
              <Icon name="users" />

              <strong>Choose a customer</strong>

              <span>Select a profile to view their banking activity.</span>
            </div>
          ) : accounts.length === 0 ? (
            // The selected customer has no accounts.
            <div className="empty large">
              <Icon name="wallet" />

              <strong>No accounts yet</strong>

              <span>Open a checking or savings account for this customer.</span>
            </div>
          ) : (
            <>
              {/* Account-selection tabs. */}
              <div className="account-tabs">
                {accounts.map((account) => (
                  <button
                    key={account.account_number}
                    type="button"
                    className={
                      selectedAccount?.account_number === account.account_number
                        ? "active"
                        : ""
                    }
                    onClick={() => onSelectAccount(account)}
                  >
                    <span>{account.account_type}</span>

                    <strong>•••• {account.account_number.slice(-4)}</strong>
                  </button>
                ))}
              </div>

              {/* Only show account operations when an account
                  has been selected. */}
              {selectedAccount && (
                <div className="account-detail">
                  {/* Selected account balance card. */}
                  <div className="balance-block">
                    <span>Available balance</span>

                    <strong>{money.format(selectedAccount.balance)}</strong>

                    <small>
                      {selectedAccount.account_number}
                      {" · "}
                      {selectedAccount.account_type}
                    </small>
                  </div>

                  {/* Deposit and withdrawal controls. */}
                  <div className="money-actions">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Amount"
                      value={amount}
                      onChange={(event) => onAmountChange(event.target.value)}
                    />

                    <Button
                      variant="deposit"
                      disabled={!amount || Number(amount) <= 0}
                      onClick={() => void onMoveMoney("deposit")}
                    >
                      Deposit
                    </Button>

                    <Button
                      variant="withdraw"
                      disabled={!amount || Number(amount) <= 0}
                      onClick={() => void onMoveMoney("withdraw")}
                    >
                      Withdraw
                    </Button>
                  </div>

                  {/* Transaction history for the selected account. */}
                  <div className="transactions">
                    <div className="transactions-head">
                      <h3>Recent transactions</h3>

                      <span>{transactions.length} total</span>
                    </div>

                    {transactions.length === 0 ? (
                      <div className="empty compact">
                        No transactions recorded.
                      </div>
                    ) : (
                      // Copy before reversing so the original
                      // transactions array is not mutated.
                      transactions
                        .slice()
                        .reverse()
                        .map((transaction, index) => (
                          <div
                            className="transaction"
                            key={`${transaction.timestamp}-${index}`}
                          >
                            <span
                              className={
                                `transaction-icon ` +
                                transaction.transaction_type
                              }
                            >
                              <Icon name="arrow" />
                            </span>

                            <div>
                              <strong>{transaction.transaction_type}</strong>

                              <small>
                                {new Date(
                                  transaction.timestamp,
                                ).toLocaleString()}
                              </small>
                            </div>

                            <b className={transaction.transaction_type}>
                              {transaction.transaction_type === "deposit"
                                ? "+"
                                : "-"}

                              {money.format(transaction.amount)}
                            </b>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
