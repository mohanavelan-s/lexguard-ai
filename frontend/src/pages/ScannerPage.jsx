import { useState } from "react";

import SectionHero from "../components/SectionHero";
import { apiRequest } from "../lib/api";

export default function ScannerPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Choose a PDF before scanning.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const payload = await apiRequest("/api/scan", {
        method: "POST",
        body: formData
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
        eyebrow="Document scanner"
        title="Upload a document and surface risky clauses quickly."
        description="This screen now runs as a frontend workflow while the existing Flask analyzer handles PDF extraction and clause scoring behind the scenes."
      />

      <section className="two-column-grid">
        <form className="section-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>Upload contract</h2>
            <span className="micro-note">PDF files work best with the current parser.</span>
          </div>

          <label className="upload-zone" htmlFor="scan-file">
            <input
              accept=".pdf"
              id="scan-file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              type="file"
            />
            <strong>{file ? file.name : "Drop a PDF here or click to browse"}</strong>
            <span>LexGuard will inspect the first clauses and score risk intensity.</span>
          </label>

          <div className="button-row">
            <button className="primary-button" disabled={loading || !file} type="submit">
              {loading ? "Scanning document..." : "Analyze document"}
            </button>
          </div>
          {error ? <div className="status-banner status-error">{error}</div> : null}
        </form>

        <section className="section-card">
          <div className="section-heading">
            <h2>Risk output</h2>
            <span className="micro-note">Heatmap plus clause-by-clause findings.</span>
          </div>

          {!result ? (
            <div className="empty-card">
              Upload a file to see clause heatmaps, legal impact notes, and safer negotiation suggestions.
            </div>
          ) : (
            <div className="stack-list">
              <div className="metrics-grid">
                <div className="metric-card">
                  <span>High risk</span>
                  <strong>{result.heatmap?.high || 0}</strong>
                </div>
                <div className="metric-card">
                  <span>Medium risk</span>
                  <strong>{result.heatmap?.medium || 0}</strong>
                </div>
                <div className="metric-card">
                  <span>Low risk</span>
                  <strong>{result.heatmap?.low || 0}</strong>
                </div>
              </div>

              <div className="stack-list dense">
                {result.clauses?.map((clause) => (
                  <article className="clause-card" key={clause.id}>
                    <div className="section-heading compact">
                      <h3>Clause {clause.id}</h3>
                      <span className={`badge risk-${clause.risk?.toLowerCase()}`}>{clause.risk}</span>
                    </div>
                    <p className="strong-copy">{clause.risk_title}</p>
                    <p>{clause.full_text}</p>
                    <div className="detail-grid">
                      <div>
                        <span className="detail-label">Impact</span>
                        <p>{clause.impact}</p>
                      </div>
                      <div>
                        <span className="detail-label">Suggested action</span>
                        <p>{clause.suggestion}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
