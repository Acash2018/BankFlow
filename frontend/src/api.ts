
// Read the backend URL from the frontend environment variables.
//
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";


/// Restrict account types to these two exact string values.
  export type AccountType = "checking" | "savings";


// Describes the administrator object returned by the backend.
export interface Admin {
  admin_id: string;
  name: string;
  email: string;
  role: "admin";
}

// Describes the information sent to the login endpoint.

export interface LoginInput {
  email: string;
  password: string;
}

//Describes information returned by the login endpoint.
export interface LoginResponse {
  admin: Admin;
  message: string;
}

//Describes a customer object retuned by the backend.

export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  account_numbers: string[];
  total_balance: number;
}

//Descibes the account object returned.

export interface Account {
  account_number: string;
  customer_id: string;
  account_type: AccountType;
  balance: number;
  overdraft_limit: number | null;
  minimum_balance: number | null;
}

//Describes the transaction object returned.

export interface Transaction {
  transaction_type: "deposit" | "withdrawal";
  amount: number;
  timestamp: string;
}

/* This is separate from Customer because the frontend 
does not provide account numbers or a total balance 
when creating a new customer.*/

export interface CustomerInput {
  customer_id: string;
  name: string;
  email: string;
}

/**
 * This is separate from Account because the frontend 
 * does not provide a balance when creating a new 
 * account.
 */

export interface AccountInput {
  account_number: string;
  account_type: AccountType;
  opening_balance: number;
  overdraft_limit: number;
  minimum_balance: number;
}
/**
 * 
 * 
 * @param options 
 * @returns the type based on given HTTP call.
 */


async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Something went wrong" }));
    throw new Error(error.detail ?? `Request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  login: (input: LoginInput) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  currentAdmin: () => request<Admin>("/api/auth/me"),
  logout: () => request<void>("/api/auth/logout", { method: "POST" }),
  listCustomers: () => request<Customer[]>("/api/customers"),
  createCustomer: (input: CustomerInput) =>
    request<Customer>("/api/customers", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  listAccounts: (customerId: string) =>
    request<Account[]>(
      `/api/customers/${encodeURIComponent(customerId)}/accounts`,
    ),
  createAccount: (customerId: string, input: AccountInput) =>
    request<Account>(
      `/api/customers/${encodeURIComponent(customerId)}/accounts`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    ),
  listTransactions: (accountNumber: string) =>
    request<Transaction[]>(
      `/api/accounts/${encodeURIComponent(accountNumber)}/transactions`,
    ),
  deposit: (accountNumber: string, amount: number) =>
    request<Account>(
      `/api/accounts/${encodeURIComponent(accountNumber)}/deposits`,
      {
        method: "POST",
        body: JSON.stringify({ amount }),
      },
    ),
  withdraw: (accountNumber: string, amount: number) =>
    request<Account>(
      `/api/accounts/${encodeURIComponent(accountNumber)}/withdrawals`,
      {
        method: "POST",
        body: JSON.stringify({ amount }),
      },
    ),
};
