// Import reusable visual components.
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'

// Import API types used by the component properties.
import type {
  Account,
  Customer,
  Transaction,
} from '../api'

// Create a reusable currency formatter.
const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// Define everything AccountsView receives from App.tsx.
interface AccountsViewProps {
  // All customers, used by the customer selector.
  customers: Customer[]

  // Customer whose accounts are being managed.
  selectedCustomer: Customer | null

  // Accounts belonging to the selected customer.
  accounts: Account[]

  // Account whose details and transactions are displayed.
  selectedAccount: Account | null

  // Transactions belonging to the selected account.
  transactions: Transaction[]

  // Value stored in the transaction amount field.
  amount: string

  // Called when another customer is selected.
  onSelectCustomer: (customer: Customer) => void

  // Called when another account is selected.
  onSelectAccount: (account: Account) => void

  // Called when the transaction amount changes.
  onAmountChange: (amount: string) => void

  // Opens the create-account modal.
  onOpenAccount: () => void

  // Performs a deposit or withdrawal.
  onMoveMoney: (
    operation: 'deposit' | 'withdraw',
  ) => void | Promise<void>
}

// Display account-management operations.
export function AccountsView({
  customers,
  selectedCustomer,
  accounts,
  selectedAccount,
  transactions,
  amount,
  onSelectCustomer,
  onSelectAccount,
  onAmountChange,
  onOpenAccount,
  onMoveMoney,
}: AccountsViewProps) {
  // Find the full customer object when the select element
  // provides only a customer ID.
  function selectCustomer(customerId: string) {
    const customer = customers.find(
      (item) => item.customer_id === customerId,
    )

    if (customer) {
      onSelectCustomer(customer)
    }
  }

  return (
    <>
      {/* Customer selector and page-specific action. */}
      <div className="view-actions account-view-actions">
        <label>
          <span>Customer</span>

          <select
            value={
              selectedCustomer?.customer_id ?? ''
            }
            onChange={(event) =>
              selectCustomer(event.target.value)
            }
          >
            {customers.length === 0 && (
              <option value="">
                No customers available
              </option>
            )}

            {customers.map((customer) => (
              <option
                key={customer.customer_id}
                value={customer.customer_id}
              >
                {customer.name}
              </option>
            ))}
          </select>
        </label>

        <Button
          variant="primary"
          icon={<Icon name="plus" />}
          disabled={!selectedCustomer}
          onClick={onOpenAccount}
        >
          Open account
        </Button>
      </div>

      {!selectedCustomer ? (
        <section className="panel">
          <div className="empty large">
            <Icon name="users" />

            <strong>Select a customer</strong>

            <span>
              Choose a customer before managing accounts.
            </span>
          </div>
        </section>
      ) : accounts.length === 0 ? (
        <section className="panel">
          <div className="empty large">
            <Icon name="wallet" />

            <strong>No accounts yet</strong>

            <span>
              Open an account for{' '}
              {selectedCustomer.name}.
            </span>

            <Button
              variant="secondary"
              icon={<Icon name="plus" />}
              onClick={onOpenAccount}
            >
              Open first account
            </Button>
          </div>
        </section>
      ) : (
        <section className="accounts-view-layout">
          {/* Account card collection. */}
          <div className="panel accounts-directory">
            <div className="panel-head">
              <div>
                <span className="eyebrow">
                  Accounts
                </span>

                <h2>
                  {selectedCustomer.name}
                </h2>
              </div>

              <span className="count">
                {accounts.length}
              </span>
            </div>

            <div className="account-card-list">
              {accounts.map((account) => {
                const isSelected =
                  selectedAccount?.account_number ===
                  account.account_number

                return (
                  <button
                    key={account.account_number}
                    type="button"
                    className={
                      isSelected
                        ? 'account-card active'
                        : 'account-card'
                    }
                    onClick={() =>
                      onSelectAccount(account)
                    }
                  >
                    <div className="metric-icon green">
                      <Icon name="wallet" />
                    </div>

                    <div>
                      <span>
                        {account.account_type}
                      </span>

                      <strong>
                        ••••{' '}
                        {account.account_number.slice(-4)}
                      </strong>
                    </div>

                    <b>
                      {money.format(account.balance)}
                    </b>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected account operations. */}
          <div className="panel account-operations">
            {!selectedAccount ? (
              <div className="empty large">
                <Icon name="wallet" />

                <strong>Select an account</strong>
              </div>
            ) : (
              <>
                <div className="account-detail">
                  {/* Main balance card. */}
                  <div className="balance-block">
                    <span>Available balance</span>

                    <strong>
                      {money.format(
                        selectedAccount.balance,
                      )}
                    </strong>

                    <small>
                      {selectedAccount.account_number}
                      {' · '}
                      {selectedAccount.account_type}
                    </small>
                  </div>

                  {/* Account-specific rule information. */}
                  <div className="account-rules">
                    {selectedAccount.account_type ===
                    'checking' ? (
                      <>
                        <span>Overdraft limit</span>

                        <strong>
                          {money.format(
                            selectedAccount
                              .overdraft_limit ?? 0,
                          )}
                        </strong>
                      </>
                    ) : (
                      <>
                        <span>Minimum balance</span>

                        <strong>
                          {money.format(
                            selectedAccount
                              .minimum_balance ?? 0,
                          )}
                        </strong>
                      </>
                    )}
                  </div>

                  {/* Money movement controls. */}
                  <div className="money-actions">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Amount"
                      value={amount}
                      onChange={(event) =>
                        onAmountChange(
                          event.target.value,
                        )
                      }
                    />

                    <Button
                      variant="deposit"
                      disabled={
                        !amount || Number(amount) <= 0
                      }
                      onClick={() =>
                        void onMoveMoney('deposit')
                      }
                    >
                      Deposit
                    </Button>

                    <Button
                      variant="withdraw"
                      disabled={
                        !amount || Number(amount) <= 0
                      }
                      onClick={() =>
                        void onMoveMoney('withdraw')
                      }
                    >
                      Withdraw
                    </Button>
                  </div>

                  {/* Selected account transaction history. */}
                  <div className="transactions">
                    <div className="transactions-head">
                      <h3>Recent transactions</h3>

                      <span>
                        {transactions.length} total
                      </span>
                    </div>

                    {transactions.length === 0 ? (
                      <div className="empty compact">
                        No transactions recorded.
                      </div>
                    ) : (
                      transactions
                        .slice()
                        .reverse()
                        .map((transaction, index) => (
                          <div
                            className="transaction"
                            key={
                              `${transaction.timestamp}-${index}`
                            }
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
                              <strong>
                                {
                                  transaction.transaction_type
                                }
                              </strong>

                              <small>
                                {new Date(
                                  transaction.timestamp,
                                ).toLocaleString()}
                              </small>
                            </div>

                            <b
                              className={
                                transaction.transaction_type
                              }
                            >
                              {transaction.transaction_type ===
                              'deposit'
                                ? '+'
                                : '-'}

                              {money.format(
                                transaction.amount,
                              )}
                            </b>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </>
  )
}