const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export type AccountType = 'checking' | 'savings'

export interface Customer {
  customer_id: string
  name: string
  email: string
  account_numbers: string[]
  total_balance: number
}

export interface Account {
  account_number: string
  customer_id: string
  account_type: AccountType
  balance: number
  overdraft_limit: number | null
  minimum_balance: number | null
}

export interface Transaction {
  transaction_type: 'deposit' | 'withdrawal'
  amount: number
  timestamp: string
}

export interface CustomerInput {
  customer_id: string
  name: string
  email: string
}

export interface AccountInput {
  account_number: string
  account_type: AccountType
  opening_balance: number
  overdraft_limit: number
  minimum_balance: number
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Something went wrong' }))
    throw new Error(error.detail ?? `Request failed (${response.status})`)
  }

  return response.json() as Promise<T>
}

export const api = {
  listCustomers: () => request<Customer[]>('/api/customers'),
  createCustomer: (input: CustomerInput) =>
    request<Customer>('/api/customers', { method: 'POST', body: JSON.stringify(input) }),
  listAccounts: (customerId: string) =>
    request<Account[]>(`/api/customers/${encodeURIComponent(customerId)}/accounts`),
  createAccount: (customerId: string, input: AccountInput) =>
    request<Account>(`/api/customers/${encodeURIComponent(customerId)}/accounts`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  listTransactions: (accountNumber: string) =>
    request<Transaction[]>(`/api/accounts/${encodeURIComponent(accountNumber)}/transactions`),
  deposit: (accountNumber: string, amount: number) =>
    request<Account>(`/api/accounts/${encodeURIComponent(accountNumber)}/deposits`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  withdraw: (accountNumber: string, amount: number) =>
    request<Account>(`/api/accounts/${encodeURIComponent(accountNumber)}/withdrawals`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
}
