import { useCallback, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import {
  api,
  type Account,
  type AccountInput,
  type AccountType,
  type Customer,
  type CustomerInput,
  type Transaction,
} from "./api";
import { Sidebar, type DashboardView } from "./components/layout/Sidebar";
import { Button } from "./components/ui/Button";
import { Icon } from "./components/ui/Icon";
import { AccountsView } from "./views/AccountsView";
import { CustomersView } from "./views/CustomersView";
import { OverviewView } from "./views/OverviewView";
import "./App.css";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Provide one shared dialog shell for the customer and account forms.
function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">BankFlow setup</span>
            <h2 id="modal-title">{title}</h2>
          </div>

          <button
            type="button"
            className="close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}

function App() {
  // App owns shared state so all three views stay synchronized.
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

  // Load the customer directory and preserve the current selection when possible.
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

  // Reload accounts whenever the selected customer changes.
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
      .catch((err: Error) => setError(err.message));
  }, [selectedCustomer]);

  // Reload transaction history whenever the selected account changes.
  useEffect(() => {
    if (!selectedAccount) {
      setTransactions([]);
      return;
    }

    api
      .listTransactions(selectedAccount.account_number)
      .then(setTransactions)
      .catch((err: Error) => setError(err.message));
  }, [selectedAccount]);

  async function submitCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = Object.fromEntries(
      new FormData(event.currentTarget),
    ) as unknown as CustomerInput;

    try {
      const customer = await api.createCustomer(input);
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

  // Each navigation view supplies its own heading while App keeps one header.
  const pageContent: Record<
    DashboardView,
    { eyebrow: string; title: string; description: string }
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

  const currentPage = pageContent[activeView];

  return (
    <div className="shell">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main>
        <header>
          <div>
            <span className="eyebrow">{currentPage.eyebrow}</span>
            <h1>{currentPage.title}</h1>
            <p>{currentPage.description}</p>
          </div>

          {/* Dedicated views provide their own context-specific actions. */}
          {activeView === "overview" && (
            <Button
              variant="primary"
              icon={<Icon name="plus" />}
              onClick={() => setModal("customer")}
            >
              New customer
            </Button>
          )}
        </header>

        {error && (
          <button className="toast error" onClick={() => setError("")}>
            {error}
            <span>×</span>
          </button>
        )}

        {notice && (
          <button className="toast success" onClick={() => setNotice("")}>
            {notice}
            <span>×</span>
          </button>
        )}

        {activeView === "overview" && (
          <OverviewView
            customers={customers}
            selectedCustomer={selectedCustomer}
            accounts={accounts}
            selectedAccount={selectedAccount}
            transactions={transactions}
            loading={loading}
            amount={amount}
            onSelectCustomer={setSelectedCustomer}
            onSelectAccount={setSelectedAccount}
            onAmountChange={setAmount}
            onOpenAccount={() => setModal("account")}
            onMoveMoney={moveMoney}
          />
        )}

        {activeView === "customers" && (
          <CustomersView
            customers={customers}
            selectedCustomer={selectedCustomer}
            accounts={accounts}
            loading={loading}
            onSelectCustomer={setSelectedCustomer}
            onCreateCustomer={() => setModal("customer")}
            onOpenAccount={() => setModal("account")}
          />
        )}

        {activeView === "accounts" && (
          <AccountsView
            customers={customers}
            selectedCustomer={selectedCustomer}
            accounts={accounts}
            selectedAccount={selectedAccount}
            transactions={transactions}
            amount={amount}
            onSelectCustomer={setSelectedCustomer}
            onSelectAccount={setSelectedAccount}
            onAmountChange={setAmount}
            onOpenAccount={() => setModal("account")}
            onMoveMoney={moveMoney}
          />
        )}
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
            <Button
              type="submit"
              variant="primary"
              className="submit"
              icon={<Icon name="arrow" />}
            >
              Create customer
            </Button>
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
            <Button
              type="submit"
              variant="primary"
              className="submit"
              icon={<Icon name="arrow" />}
            >
              Open account
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default App;
