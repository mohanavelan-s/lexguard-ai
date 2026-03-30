import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";

import AuthPanel from "../components/AuthPanel";
import { apiRequest } from "../lib/api";

export default function LoginPage({ onSessionChange, session, sessionLoading }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!sessionLoading && session.authenticated) {
    return <Navigate replace to={session.user?.role === "lawyer" ? "/lawyer-dashboard" : "/user-dashboard"} />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = await apiRequest("/api/login", {
        method: "POST",
        body: form
      });
      await onSessionChange();
      navigate(payload?.user?.role === "lawyer" ? "/lawyer-dashboard" : "/user-dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPanel
      footer={
        <p className="auth-footer">
          Need an account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>
      }
      subtitle="Sign in to save case lookups, manage profile settings, and access reviewer dashboards."
      title="Welcome back"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field-block">
          <span>Email</span>
          <input
            className="input-field"
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            type="email"
            value={form.email}
          />
        </label>
        <label className="field-block">
          <span>Password</span>
          <input
            className="input-field"
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Your password"
            type="password"
            value={form.password}
          />
        </label>
        <button className="primary-button full-width" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Login"}
        </button>
        {error ? <div className="status-banner status-error">{error}</div> : null}
      </form>
    </AuthPanel>
  );
}
