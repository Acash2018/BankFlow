import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./auth-context";
import {
  api,
  removeAccessToken,
  saveAccessToken,
  type Admin,
  type LoginInput,
} from "../api";

// Centralize the administrator and session state for the entire frontend.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Restore an existing signed session whenever the application first loads.
  useEffect(() => {
    api
      .currentAdmin()
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setCheckingSession(false));
  }, []);

  const login = useCallback(async (input: LoginInput) => {
  const response = await api.login(input);

  saveAccessToken(response.access_token);
  setAdmin(response.admin);
}, []);

  const logout = useCallback(async () => {
  removeAccessToken();
  setAdmin(null);
}, []);



  const value = useMemo(
    () => ({ admin, checkingSession, login, logout }),
    [admin, checkingSession, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
