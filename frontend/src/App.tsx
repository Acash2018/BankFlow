import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { OverviewView } from './views/OverviewView'
import {
  api,
  type Account,
  type AccountInput,
  type AccountType,
  type Customer,
  type CustomerInput,
  type Transaction,
} from "./api";
import "./App.css";
import { Icon } from "./components/ui/Icon";
import { Sidebar, type DashboardView } from "./components/layout/Sidebar";
// Create one reusable formatter for displaying numbers as US-dollar amounts.
// For example, money.format(1250) returns "$1,250.00".
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Render one of BankFlow's inline SVG icons. The union type restricts `name`
// to the icons defined below, so TypeScript catches misspelled icon names.

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">BankFlow setup</span>
            <h2>{title}</h2>
          </div>
          <button className="close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function App() {
  // App owns the active navigation state. Sidebar receives the current value
  // and calls setActiveView whenever the user selects a different section.
  const [activeView, setActiveView] = useState<DashboardView>("overview");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modal, setModal] = useState<"customer" | "account" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [amount, setAmount] = useState("");

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.listCustomers();
      setCustomers(data);
      setSelectedCustomer(
        (current) =>
          data.find((item) => item.customer_id === current?.customer_id) ??
          data[0] ??
          null,
      );
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach BankFlow");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (!selectedCustomer) {
      setAccounts([]);
      setSelectedAccount(null);
      return;
    }
    api
      .listAccounts(selectedCustomer.customer_id)
      .then((data) => {
        setAccounts(data);
        setSelectedAccount(
          (current) =>
            data.find(
              (item) => item.account_number === current?.account_number,
            ) ??
            data[0] ??
            null,
        );
      })
      .catch((err) => setError(err.message));
  }, [selectedCustomer]);

  useEffect(() => {
    if (!selectedAccount) {
      setTransactions([]);
      return;
    }
    api
      .listTransactions(selectedAccount.account_number)
      .then(setTransactions)
      .catch((err) => setError(err.message));
  }, [selectedAccount]);

  async function submitCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(
      new FormData(event.currentTarget),
    ) as unknown as CustomerInput;
    try {
      const customer = await api.createCustomer(data);
      setModal(null);
      setNotice("Customer created successfully");
      await loadCustomers();
      setSelectedCustomer(customer);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create customer",
      );
    }
  }

  async function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCustomer) return;
    const form = new FormData(event.currentTarget);
    const input: AccountInput = {
      account_number: String(form.get("account_number")),
      account_type: String(form.get("account_type")) as AccountType,
      opening_balance: Number(form.get("opening_balance")),
      overdraft_limit: Number(form.get("overdraft_limit")),
      minimum_balance: Number(form.get("minimum_balance")),
    };
    try {
      const account = await api.createAccount(
        selectedCustomer.customer_id,
        input,
      );
      const data = await api.listAccounts(selectedCustomer.customer_id);
      setAccounts(data);
      setSelectedAccount(account);
      setModal(null);
      setNotice("Account opened successfully");
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    }
  }

  async function moveMoney(operation: "deposit" | "withdraw") {
    if (!selectedAccount || Number(amount) <= 0) return;
    try {
      const account = await api[operation](
        selectedAccount.account_number,
        Number(amount),
      );
      setSelectedAccount(account);
      setAccounts((items) =>
        items.map((item) =>
          item.account_number === account.account_number ? account : item,
        ),
      );
      setTransactions(await api.listTransactions(account.account_number));
      setAmount("");
      setNotice(
        `${operation === "deposit" ? "Deposit" : "Withdrawal"} completed`,
      );
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  }

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );

  // Store the text for each dashboard view in one lookup object. Selecting a
  // sidebar item now updates the page heading without duplicating header JSX.
  const pageContent: Record<
    DashboardView,
    {
      eyebrow: string;
      title: string;
      description: string;
    }
  > = {
    overview: {
      eyebrow: "Personal banking workspace",
      title: "Good to see you.",
      description: "Everything you need to manage your BankFlow customers.",
    },
    customers: {
      eyebrow: "Customer directory",
      title: "Your customers",
      description: "Create and manage customer profiles.",
    },
    accounts: {
      eyebrow: "Account management",
      title: "Customer accounts",
      description: "View balances and manage banking activity.",
    },
    transactions: {
      eyebrow: "Transaction history",
      title: "Recent activity",
      description: "Review deposits and withdrawals.",
    },
  };

  // Select the heading content that matches the active sidebar button.
  const currentPage = pageContent[activeView];

  return (
    <div className="shell">
      {/* Sidebar displays the selected view and reports navigation changes back
        to App through the setActiveView state setter. */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main>
        <header>
          <div>
            <span className="eyebrow">{currentPage.eyebrow}</span>
            <h1>{currentPage.title}</h1>
            <p>{currentPage.description}</p>
          </div>
          <button className="primary" onClick={() => setModal("customer")}>
            <Icon name="plus" />
            New customer
          </button>
        </header>

        {error && (
          <div className="toast error" onClick={() => setError("")}>
            {error}
            <span>×</span>
          </div>
        )}
        {notice && (
          <div className="toast success" onClick={() => setNotice("")}>
            {notice}
            <span>×</span>
          </div>
        )}

        {activeView === 'overview' && ( <section className="metrics">
          <article>
            <div className="metric-icon green">
              <Icon name="wallet" />
            </div>
            <div>
              <span>Total balance</span>
              <strong>{money.format(totalBalance)}</strong>
              <small>
                Across {accounts.length} account
                {accounts.length === 1 ? "" : "s"}
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
        )}

        <section className="workspace">
          <div className="panel customer-panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Directory</span>
                <h2>Customers</h2>
              </div>
              <span className="count">{customers.length}</span>
            </div>
            <div className="customer-list">
              {loading ? (
                <div className="empty">Loading customers…</div>
              ) : customers.length === 0 ? (
                <div className="empty">
                  <Icon name="users" />
                  <strong>No customers yet</strong>
                  <span>Create the first customer to get started.</span>
                </div>
              ) : (
                customers.map((customer) => (
                  <button
                    key={customer.customer_id}
                    className={
                      selectedCustomer?.customer_id === customer.customer_id
                        ? "customer active"
                        : "customer"
                    }
                    onClick={() => setSelectedCustomer(customer)}
                  >
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
              {selectedCustomer && (
                <button
                  className="secondary"
                  onClick={() => setModal("account")}
                >
                  <Icon name="plus" />
                  Open account
                </button>
              )}
            </div>
            {!selectedCustomer ? (
              <div className="empty large">
                <Icon name="users" />
                <strong>Choose a customer</strong>
                <span>Select a profile to view their banking activity.</span>
              </div>
            ) : accounts.length === 0 ? (
              <div className="empty large">
                <Icon name="wallet" />
                <strong>No accounts yet</strong>
                <span>
                  Open a checking or savings account for this customer.
                </span>
              </div>
            ) : (
              <>
                <div className="account-tabs">
                  {accounts.map((account) => (
                    <button
                      key={account.account_number}
                      className={
                        selectedAccount?.account_number ===
                        account.account_number
                          ? "active"
                          : ""
                      }
                      onClick={() => setSelectedAccount(account)}
                    >
                      <span>{account.account_type}</span>
                      <strong>•••• {account.account_number.slice(-4)}</strong>
                    </button>
                  ))}
                </div>
                {selectedAccount && (
                  <div className="account-detail">
                    <div className="balance-block">
                      <span>Available balance</span>
                      <strong>{money.format(selectedAccount.balance)}</strong>
                      <small>
                        {selectedAccount.account_number} ·{" "}
                        {selectedAccount.account_type}
                      </small>
                    </div>
                    <div className="money-actions">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Amount"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                      />
                      <button onClick={() => void moveMoney("deposit")}>
                        Deposit
                      </button>
                      <button
                        className="withdraw"
                        onClick={() => void moveMoney("withdraw")}
                      >
                        Withdraw
                      </button>
                    </div>
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
                        transactions
                          .slice()
                          .reverse()
                          .map((transaction, index) => (
                            <div
                              className="transaction"
                              key={`${transaction.timestamp}-${index}`}
                            >
                              <span
                                className={`transaction-icon ${transaction.transaction_type}`}
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
      </main>

      {modal === "customer" && (
        <Modal title="Create a customer" onClose={() => setModal(null)}>
          <form onSubmit={submitCustomer}>
            <label>
              Customer ID
              <input required name="customer_id" placeholder="CUST-1001" />
            </label>
            <label>
              Full name
              <input required name="name" placeholder="Aakash Tripathi" />
            </label>
            <label>
              Email address
              <input
                required
                type="email"
                name="email"
                placeholder="aakash@example.com"
              />
            </label>
            <button className="primary submit">
              Create customer
              <Icon name="arrow" />
            </button>
          </form>
        </Modal>
      )}
      {modal === "account" && (
        <Modal title="Open a new account" onClose={() => setModal(null)}>
          <form onSubmit={submitAccount}>
            <label>
              Account number
              <input required name="account_number" placeholder="CHK-1001" />
            </label>
            <label>
              Account type
              <select name="account_type">
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </label>
            <label>
              Opening balance
              <input
                required
                type="number"
                min="0"
                step="0.01"
                name="opening_balance"
                defaultValue="500"
              />
            </label>
            <div className="form-row">
              <label>
                Overdraft limit
                <input
                  type="number"
                  min="0"
                  name="overdraft_limit"
                  defaultValue="500"
                />
              </label>
              <label>
                Minimum balance
                <input
                  type="number"
                  min="0"
                  name="minimum_balance"
                  defaultValue="100"
                />
              </label>
            </div>
            <button className="primary submit">
              Open account
              <Icon name="arrow" />
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default App;
