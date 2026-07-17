import type { LoginInput } from "../api";
import { LoginForm } from "../components/auth/LoginForm";
import { Icon } from "../components/ui/Icon";

export function LoginView({
  onLogin,
}: {
  onLogin: (input: LoginInput) => Promise<void>;
}) {
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand">
          <span className="brand-mark">
            <Icon name="bank" />
          </span>
          <span>
            Bank<span>Flow</span>
          </span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">Administrator workspace</span>
          <h1>Banking operations, kept in flow.</h1>
          <p>
            Manage customers, accounts, and transactions from one secure,
            focused workspace.
          </p>
        </div>
        <div className="security-note">
          <span className="status-dot" />
          Protected administrator access
        </div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <span className="eyebrow">Welcome back</span>
          <h2>Sign in to your account</h2>
          <p>Use your BankFlow administrator credentials to continue.</p>
          <LoginForm onSubmit={onLogin} />
          <small>Authorized administrators only.</small>
        </div>
      </section>
    </main>
  );
}
