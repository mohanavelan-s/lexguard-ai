import { useState } from "react";
import { Link } from "react-router-dom";

import SectionHero from "../components/SectionHero";
import { apiRequest } from "../lib/api";

const initialForm = {
  caseType: "civil",
  caseNumber: "",
  filingYear: "",
  courtComplex: ""
};

function getStatusTone(status) {
  if (status === "Disposed") return "approved";
  if (status === "Pending") return "pending";
  if (status === "Adjourned") return "alert";
  return "neutral";
}

export default function CaseLookupPage({ session }) {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!session.authenticated) {
      setError("Sign in first so the lookup can be saved to your account.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = await apiRequest("/submit-case", {
        method: "POST",
        body: {
          case_number: form.caseNumber,
          year: form.filingYear,
          court_type: form.caseType,
          court_complex: form.courtComplex
        }
      });
      setResult(payload);
    } catch (requestError) {
      setError(requestError.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Case status lookup"
        title="Track a demo case and save the lookup to the signed-in account."
        description="The new frontend keeps the form responsive while the backend still handles persistence and optional email notification."
        actions={
          !session.authenticated ? (
            <Link className="primary-link" to="/login">
              Login to unlock lookup
            </Link>
          ) : null
        }
      />

      <section className="two-column-grid">
        <form className="section-card" onSubmit={handleSubmit}>
          <div className="search-grid">
            <label className="field-block">
              <span>Case type</span>
              <select
                className="input-field"
                onChange={(event) => setForm((current) => ({ ...current, caseType: event.target.value }))}
                value={form.caseType}
              >
                <option value="civil">Civil</option>
                <option value="criminal">Criminal</option>
                <option value="family">Family</option>
                <option value="consumer">Consumer</option>
                <option value="labor">Labor</option>
                <option value="writ">Writ petition</option>
                <option value="appeal">Appeal</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="field-block">
              <span>Case number</span>
              <input
                className="input-field"
                onChange={(event) => setForm((current) => ({ ...current, caseNumber: event.target.value }))}
                placeholder="1234"
                value={form.caseNumber}
              />
            </label>
            <label className="field-block">
              <span>Filing year</span>
              <input
                className="input-field"
                maxLength={4}
                onChange={(event) => setForm((current) => ({ ...current, filingYear: event.target.value }))}
                placeholder="2024"
                value={form.filingYear}
              />
            </label>
            <label className="field-block span-two">
              <span>Court complex</span>
              <input
                className="input-field"
                onChange={(event) => setForm((current) => ({ ...current, courtComplex: event.target.value }))}
                placeholder="Chennai District Court"
                value={form.courtComplex}
              />
            </label>
          </div>

          <div className="button-row">
            <button className="primary-button" disabled={loading} type="submit">
              {loading ? "Checking status..." : "Check case status"}
            </button>
          </div>

          <div className="status-banner status-info">
            Demo numbers: <strong>1234</strong> pending, <strong>5678</strong> disposed, <strong>9999</strong> adjourned.
          </div>
          {error ? <div className="status-banner status-error">{error}</div> : null}
        </form>

        <section className="section-card">
          <div className="section-heading">
            <h2>Status result</h2>
            <span className="micro-note">Stored in the backend when you are logged in.</span>
          </div>

          {!result ? (
            <div className="empty-card">Run a lookup and the result card will appear here.</div>
          ) : (
            <div className="result-card">
              <div className="section-heading compact">
                <h3>Case #{form.caseNumber}</h3>
                <span className={`badge badge-${getStatusTone(result.status)}`}>{result.status}</span>
              </div>
              <div className="detail-grid">
                <div>
                  <span className="detail-label">Next hearing</span>
                  <p>{result.next_hearing}</p>
                </div>
                <div>
                  <span className="detail-label">Notification</span>
                  <p>{result.email_sent ? "Email sent to registered user." : "Saved without email delivery."}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
