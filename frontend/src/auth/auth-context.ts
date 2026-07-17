import { createContext } from "react";

import type { Admin, LoginInput } from "../api";

export interface AuthContextValue {
  admin: Admin | null;
  checkingSession: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

// This shared context holds the current administrator session.
export const AuthContext = createContext<AuthContextValue | null>(null);
