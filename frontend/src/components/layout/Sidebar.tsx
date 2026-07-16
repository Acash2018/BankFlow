/*Here we import the buttons and icons we defined earlier.*/
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import type { IconName } from "../ui/Icon";

/*We define our dashboard types*/

export type DashboardView =
  "overview" | "customers" | "transactions" | "accounts";

/*We define the properties that the sidebar component receives from the parent */
export interface SidebarProps {
  /*The currently active view in the dashboard. */
  activeView: DashboardView;
  /*A callback that is supplied by the parent component.
  Sidebar calls this when the user selects a different navigation item. */
  onViewChange: (view: DashboardView) => void;
}

interface NavigationItem {
  /*The dashboard section opened by this item.*/
  view: DashboardView;

  /*The text displayed inside the navigation button. */
  label: string;

  /*Icon name that we render inside the navigation button. */
  icon: IconName;
}

// Store the sidebar navigation configuration as data.
//
// Because each navigation item follows the same structure,
// Sidebar can generate its buttons with `.map()` instead of
// repeating nearly identical JSX three times.

const navigationItems: NavigationItem[] = [
  {
    // Selects the dashboard overview.
    view: "overview",

    // Text shown to the user.
    label: "Overview",

    // Icon name passed to the Icon component.
    icon: "grid",
  },
  {
    // Selects the customer view.
    view: "customers",
    label: "Customers",
    icon: "users",
  },
  {
    // Selects the account view.
    view: "accounts",
    label: "Accounts",
    icon: "wallet",
  },
];

// Render the BankFlow sidebar.
//
// The function destructures activeView and onViewChange from
// the SidebarProps object supplied by the parent.
export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    // <aside> represents content related to, but separate from,
    // the page's main content. It is appropriate for a sidebar.
    <aside className="sidebar">
      {/* BankFlow logo and application name. */}
      <div className="brand">
        {/* Styled container around the bank icon. */}
        <span className="brand-mark">
          {/* Render the reusable bank-building SVG icon. */}
          <Icon name="bank" />
        </span>

        {/* The nested span allows "Flow" to use a different color. */}
        <span>
          Bank<span>Flow</span>
        </span>
      </div>

      {/* The nav element identifies this section as navigation.
          aria-label gives screen-reader users a meaningful name
          for this navigation region. */}
      <nav aria-label="Main navigation">
        {/* Create one Button for every item in navigationItems. */}
        {navigationItems.map((item) => (
          <Button
            // React uses `key` to track this item efficiently
            // when the list is rendered again.
            key={item.view}

            // Select the navigation appearance from Button.tsx.
            variant="nav"

            // Render the icon assigned to the current navigation item.
            icon={<Icon name={item.icon} />}

            // Add the active CSS class only when this item's view
            // matches the currently selected dashboard view.
            className={activeView === item.view ? "active" : ""}

            // When clicked, notify the parent component that the
            // active view should change to this item's view.
            onClick={() => onViewChange(item.view)}
          >
            {/* The button's visible text becomes its children. */}
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Display backend/database connection information at the
          bottom of the sidebar. */}
      <div className="side-foot">
        {/* CSS renders this empty span as a green status circle. */}
        <span className="status-dot" />
        {/* Human-readable connection status. */}
        MongoDB connected
        {/* Secondary status description shown in smaller text. */}
        <small>Secure local storage</small>
      </div>
    </aside>
  );
}
