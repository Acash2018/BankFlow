import { useState } from "react";
import type { FormEvent } from "react";
import type { LoginInput } from "../../api";
import { Button } from "../ui/Button";

export function LoginForm({
  onSubmit,
}: {
  onSubmit: (input: LoginInput) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}
      <label>
        Email address
        <input
          required
          type="email"
          autoComplete="username"
          placeholder="admin@bankflow.local"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label>
        Password
        <span className="password-field">
          <input
            required
            minLength={8}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </span>
      </label>
      <Button type="submit" variant="primary" loading={submitting}>
        Sign in to BankFlow
      </Button>
    </form>
  );
}
