//We are only importing typescript definitions only.


import type {

    /*HTML attributes for button elements.
    
    such as onClick disables, name, value, and title.*/
    ButtonHTMLAttributes,

    /*This represents anything React can render. */
    ReactNode,
} from 'react'


/*Here we are defining the supported visual styles for the button
    A union type prevents unsupported values. For example,
    variant="primary" is valid, but variant="purple" produces
    a TypeScript error.
*/

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'deposit'
  | 'withdraw'
  | 'nav'

/*
    Defines the properties accepted by the reusable Button component.
    Extending HTML button attributes gives the component all the properties needed to support a normal HTML button.
*/

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {

    /*The visual style of the button. */
    /*The variant property is optional, and if not provided, the button will use a default style. */
    variant?: ButtonVariant

    /*An optional react element to be rendered before the button text. */
    icon?: ReactNode

    /*This indicates the button is running */
    loading?: boolean
}

// Export the component so other files can import and use it:
//
// import { Button } from './components/ui/Button'
export function Button({
  // Use "primary" when the caller does not provide a variant.
  variant = 'primary',

  // Receive the optional icon.
  icon,

  // The button is not loading by default.
  loading = false,

  // Use an empty string when no additional CSS class is supplied.
  className = '',

  // `children` is the content placed between the component tags.
  //
  // <Button>Create customer</Button>
  //
  // Here, "Create customer" becomes `children`.
  children,

  // Receive the normal HTML disabled property.
  disabled,

  // Use type="button" by default.
  //
  // A native button inside a form defaults to type="submit".
  // Using "button" prevents unintended form submissions.
  type = 'button',

  // Collect all remaining button properties into one object.
  //
  // For example, if the caller supplies onClick, aria-label,
  // title, name, or value, they are stored in buttonProps.
  ...buttonProps
}: ButtonProps) {
  // Return the actual HTML button rendered in the browser.
  return (
    <button
      // Apply the selected HTML button type.
      //
      // A form submission button can explicitly use:
      // <Button type="submit">Save</Button>
      type={type}

      // Build the CSS class names from the selected variant.
      //
      // If variant is "deposit", the result is:
      // "button button--deposit"
      //
      // `className` allows a parent to add another custom class.
      className={`button button--${variant} ${className}`}

      // Disable the button if either:
      // 1. The caller explicitly disabled it, or
      // 2. An asynchronous operation is loading.
      disabled={disabled || loading}

      // Forward the remaining standard button properties onto
      // the real HTML element.
      //
      // For example:
      // onClick={() => createCustomer()}
      // aria-label="Create customer"
      {...buttonProps}
    >
      {/* Render the icon when one was supplied. React renders
          nothing here when `icon` is undefined. */}
      {icon}

      {/* Wrap the button label in a span so its text can be
          positioned or styled independently from the icon. */}
      <span>
        {/* Replace the normal label while an operation is running. */}
        {loading ? 'Please wait…' : children}
      </span>
    </button>
  )
}