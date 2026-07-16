// Define every icon name supported by the reusable Icon component.
// Exporting this type lets other components accept only valid BankFlow icons.
export type IconName =
  | 'grid'
  | 'users'
  | 'wallet'
  | 'arrow'
  | 'plus'
  | 'bank'

// Describe the properties required to render an icon.
interface IconProps {
  // `name` must match one of the values in the IconName union above.
  name: IconName
}

// Render the SVG drawing associated with the requested icon name.
export function Icon({ name }: IconProps) {
  // Store each icon's SVG shapes in a lookup object. This avoids creating a
  // separate React component for every small interface icon.
  const paths = {
    // Four rounded rectangles form the dashboard/overview grid.
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),

    // Paths and a circle outline two people for customer-related actions.
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),

    // Two paths draw a wallet outline and its small clasp.
    wallet: (
      <>
        <path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6" />
        <path d="M16 13h2" />
      </>
    ),

    // A horizontal line and angled lines form a right-facing arrow.
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,

    // Intersecting vertical and horizontal lines form the plus symbol.
    plus: <path d="M12 5v14M5 12h14" />,

    // A roof, columns, and foundation form the bank building icon.
    bank: (
      <path d="m3 10 9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18" />
    ),
  }

  return (
    // Every icon uses the same 24-by-24 coordinate system, allowing CSS to
    // resize it without losing sharpness. Because these icons accompany text,
    // aria-hidden prevents screen readers from announcing them redundantly.
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {/* Select and render the SVG shapes matching the supplied name. */}
      {paths[name]}
    </svg>
  )
}
