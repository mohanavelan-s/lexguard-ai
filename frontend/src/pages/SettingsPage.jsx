import { useEffect, useState } from "react";

import SectionHero from "../components/SectionHero";
import { apiRequest } from "../lib/api";

const initialForm = {
  name: "",
  email: "",
  new_password: "",
  confirm_password: ""
};

export default function SettingsPage({ onSessionChange, session }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const payload = await apiRequest("/api/settings");
        setForm((current) => ({
          ...current,
          name: payload.user?.name || "",
          email: payload.user?.email || ""
        }));
      } catch (requestError) {
        setError(requestError.message);
        setForm((current) => ({
          ...current,
          name: session.user?.name || "",
          email: session.user?.email || ""
        }));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [session.user?.email, session.user?.name]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = await apiRequest("/api/settings", {
        method: "PUT",
        body: form
      });
      setSuccess(payload.message || "Profile updated successfully.");
      setForm((current) => ({
        ...current,
        new_password: "",
        confirm_password: ""
      }));
      await onSessionChange();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Profile settings"
        title="Update your account without leaving the SPA."
        description="This screen replaces the old template form and talks directly to JSON endpoints so profile changes feel instantaneous."
      />

      <section className="two-column-grid">
        <form className="section-card" onSubmit={handleSubmit}>
          <div className="search-grid">
            <label className="field-block span-two">
              <span>Name</span>
              <input
                className="input-field"
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                value={form.name}
              />
            </label>
            <label className="field-block span-two">
              <span>Email</span>
              <input
                className="input-field"
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                type="email"
                value={form.email}
              />
            </label>
            <label className="field-block">
              <span>New password</span>
              <input
                className="input-field"
                onChange={(event) => setForm((current) => ({ ...current, new_password: event.target.value }))}
                placeholder="Leave blank to keep current password"
                type="password"
                value={form.new_password}
              />
            </label>
            <label className="field-block">
              <span>Confirm password</span>
              <input
                className="input-field"
                onChange={(event) => setForm((current) => ({ ...current, confirm_password: event.target.value }))}
                type="password"
                value={form.confirm_password}
              />
            </label>
          </div>

          <div className="button-row">
            <button className="primary-button" disabled={loading || saving} type="submit">
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
          {success ? <div className="status-banner status-success">{success}</div> : null}
          {error ? <div className="status-banner status-error">{error}</div> : null}
        </form>

        <section className="section-card">
          <div className="section-heading">
            <h2>Account snapshot</h2>
            <span className="micro-note">Live session values from the backend.</span>
          </div>

          <div className="stack-list">
            <div className="detail-block">
              <span className="detail-label">Role</span>
              <p>{session.user?.role || "Unknown"}</p>
            </div>
            <div className="detail-block">
              <span className="detail-label">Preferred language</span>
              <p>{session.lang?.toUpperCase() || "EN"}</p>
            </div>
            <div className="detail-block">
              <span className="detail-label">Cloud readiness</span>
              <p>Profile updates now work through API calls instead of form redirects, which makes deployment and QA much cleaner.</p>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
