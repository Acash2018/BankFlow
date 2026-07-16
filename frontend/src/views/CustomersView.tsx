// Import reusable interface components.
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { CustomerList } from '../components/customers/CustomerList'

// Import API types without adding runtime JavaScript imports.
import type {
  Account,
  Customer,
} from '../api'

// Reusable currency formatter for customer balances.
const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

// Define the values and callbacks supplied by App.tsx.
interface CustomersViewProps {
  // All BankFlow customers.
  customers: Customer[]

  // The customer whose details are currently displayed.
  selectedCustomer: Customer | null

  // Accounts belonging to the selected customer.
  accounts: Account[]

  // Indicates whether customer data is loading.
  loading: boolean

  // Called when the user selects another customer.
  onSelectCustomer: (customer: Customer) => void

  // Opens the create-customer modal.
  onCreateCustomer: () => void

  // Opens the create-account modal for the selected customer.
  onOpenAccount: () => void
}

// Display the customer-management page.
//
// App.tsx owns all data and modal state. CustomersView only
// displays that data and reports user actions through callbacks.
export function CustomersView({
  customers,
  selectedCustomer,
  accounts,
  loading,
  onSelectCustomer,
  onCreateCustomer,
  onOpenAccount,
}: CustomersViewProps) {
  return (
    <>
      {/* Page-specific action bar. */}
      <div className="view-actions">
        <div>
          <span className="eyebrow">
            Customer management
          </span>

          <p>
            Select a customer to review their profile
            and account summary.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Icon name="plus" />}
          onClick={onCreateCustomer}
        >
          New customer
        </Button>
      </div>

      <section className="workspace customer-view">
        {/* Customer directory. */}
        <div className="panel customer-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">
                Directory
              </span>

              <h2>Customers</h2>
            </div>

            <span className="count">
              {customers.length}
            </span>
          </div>

          <CustomerList
            customers={customers}
            selectedCustomer={selectedCustomer}
            loading={loading}
            onSelectCustomer={onSelectCustomer}
          />
        </div>

        {/* Selected customer details. */}
        <div className="panel customer-details-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">
                Customer profile
              </span>

              <h2>
                {selectedCustomer
                  ? selectedCustomer.name
                  : 'Select a customer'}
              </h2>
            </div>

            {/* An account requires an owner, so this action is
                only available after selecting a customer. */}
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
            <div className="empty large">
              <Icon name="users" />

              <strong>No customer selected</strong>

              <span>
                Choose a customer from the directory.
              </span>
            </div>
          ) : (
            <div className="customer-profile">
              {/* Basic customer information. */}
              <section className="profile-card">
                <div className="profile-avatar">
                  {selectedCustomer.name
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>

                <div>
                  <span className="eyebrow">
                    Customer
                  </span>

                  <h3>{selectedCustomer.name}</h3>

                  <p>{selectedCustomer.email}</p>
                </div>
              </section>

              {/* Small customer summary cards. */}
              <section className="profile-metrics">
                <article>
                  <span>Customer ID</span>
                  <strong>
                    {selectedCustomer.customer_id}
                  </strong>
                </article>

                <article>
                  <span>Accounts</span>
                  <strong>{accounts.length}</strong>
                </article>

                <article>
                  <span>Total balance</span>
                  <strong>
                    {money.format(
                      selectedCustomer.total_balance,
                    )}
                  </strong>
                </article>
              </section>

              {/* Compact account summary. */}
              <section className="profile-accounts">
                <div className="section-heading">
                  <h3>Account summary</h3>

                  <span>
                    {accounts.length} total
                  </span>
                </div>

                {accounts.length === 0 ? (
                  <div className="empty compact">
                    This customer has no accounts.
                  </div>
                ) : (
                  accounts.map((account) => (
                    <article
                      className="profile-account"
                      key={account.account_number}
                    >
                      <div className="metric-icon green">
                        <Icon name="wallet" />
                      </div>

                      <div>
                        <strong>
                          {account.account_type}
                        </strong>

                        <small>
                          ••••{' '}
                          {account.account_number.slice(-4)}
                        </small>
                      </div>

                      <b>
                        {money.format(account.balance)}
                      </b>
                    </article>
                  ))
                )}
              </section>
            </div>
          )}
        </div>
      </section>
    </>
  )
}