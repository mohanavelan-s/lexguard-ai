import { useState } from "react";
import { Link } from "react-router-dom";

import AuthPanel from "../components/AuthPanel";
import { apiRequest } from "../lib/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "user"
};

export default function RegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = await apiRequest("/api/register", {
        method: "POST",
        body: form
      });
      setSuccess(payload.message || "Account created. You can sign in now.");
      setForm(initialForm);
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
          Already registered?{" "}
          <Link to="/login">
            Login here
          </Link>
        </p>
      }
      subtitle="Create a standard user or lawyer reviewer account for the new cloud-ready frontend."
      title="Create your account"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field-block">
          <span>Full name</span>
          <input
            className="input-field"
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Mohanavelan S"
            value={form.name}
          />
        </label>
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
            placeholder="Choose a secure password"
            type="password"
            value={form.password}
          />
        </label>
        <label className="field-block">
          <span>Account role</span>
          <select
            className="input-field"
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            value={form.role}
          >
            <option value="user">User</option>
            <option value="lawyer">Lawyer reviewer</option>
          </select>
        </label>

        <button className="primary-button full-width" disabled={loading} type="submit">
          {loading ? "Creating account..." : "Register"}
        </button>
        {success ? <div className="status-banner status-success">{success}</div> : null}
        {error ? <div className="status-banner status-error">{error}</div> : null}
      </form>
    </AuthPanel>
  );
}
