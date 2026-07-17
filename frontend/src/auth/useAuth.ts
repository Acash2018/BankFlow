import { useContext } from "react";

import { AuthContext } from "./auth-context";

// Give components safe access to the nearest authentication provider.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
