import type { Customer } from '../../api'

interface CustomerListProps {
  customers: Customer[]
  selectedCustomer: Customer | null
  loading: boolean
  onSelectCustomer: (customer: Customer) => void
}

export function CustomerList({
  customers,
  selectedCustomer,
  loading,
  onSelectCustomer,
}: CustomerListProps) {
  if (loading) {
    return <div className="empty">Loading customers…</div>
  }

  return (
    <div className="customer-list">
      {customers.map((customer) => (
        <button
          key={customer.customer_id}
          type="button"
          className={
            selectedCustomer?.customer_id ===
            customer.customer_id
              ? 'customer active'
              : 'customer'
          }
          onClick={() =>
            onSelectCustomer(customer)
          }
        >
          <span>{customer.name}</span>
          <small>{customer.email}</small>
        </button>
      ))}
    </div>
  )
}