import { useEffect, useState } from "react";

import SectionHero from "../components/SectionHero";
import { apiRequest } from "../lib/api";

const initialFilters = {
  query: "",
  year: "Any",
  court: "Any"
};

export default function CasesPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const runSearch = async (nextFilters) => {
    setLoading(true);
    setError("");

    try {
      const payload = await apiRequest("/api/cases", {
        method: "POST",
        body: nextFilters
      });
      setCases(payload?.cases || []);
    } catch (requestError) {
      setError(requestError.message);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch(initialFilters);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await runSearch(filters);
  };

  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Past case matcher"
        title="Search landmark cases through the API-backed precedent catalog."
        description="The original mock browser search has been moved into the frontend, but results now come from the seeded backend database so the same code works in cloud environments."
      />

      <form className="section-card" onSubmit={handleSubmit}>
        <div className="search-grid">
          <label className="field-block">
            <span>Keyword</span>
            <input
              className="input-field"
              onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
              placeholder="Privacy, arrest, property dispute, environmental law..."
              value={filters.query}
            />
          </label>
          <label className="field-block">
            <span>Year</span>
            <select
              className="input-field"
              onChange={(event) => setFilters((current) => ({ ...current, year: event.target.value }))}
              value={filters.year}
            >
              <option value="Any">Any</option>
              <option value="1973">1973</option>
              <option value="1985">1985</option>
              <option value="1997">1997</option>
              <option value="2014">2014</option>
              <option value="2018">2018</option>
              <option value="2020">2020</option>
            </select>
          </label>
          <label className="field-block">
            <span>Court</span>
            <select
              className="input-field"
              onChange={(event) => setFilters((current) => ({ ...current, court: event.target.value }))}
              value={filters.court}
            >
              <option value="Any">Any</option>
              <option value="Supreme Court">Supreme Court</option>
              <option value="High Court">High Court</option>
            </select>
          </label>
          <div className="search-actions">
            <button className="primary-button" disabled={loading} type="submit">
              {loading ? "Searching..." : "Search cases"}
            </button>
          </div>
        </div>
      </form>

      {error ? <div className="status-banner status-error">{error}</div> : null}

      <section className="feature-grid">
        {cases.length === 0 && !loading ? (
          <div className="empty-card wide">
            No precedents matched this search. Try broader terms like privacy, arrest, labor, or property.
          </div>
        ) : null}

        {cases.map((entry) => (
          <article className="case-card" key={`${entry.title}-${entry.year || ""}`}>
            <div className="section-heading compact">
              <h2>{entry.title}</h2>
              <span className="pill subtle">{entry.court || "Case file"}</span>
            </div>
            {entry.year ? <div className="micro-note">Year: {entry.year}</div> : null}
            <p>{entry.summary}</p>
            <div className="detail-block">
              <span className="detail-label">Outcome</span>
              <p>{entry.outcome}</p>
            </div>
            {entry.key_people ? (
              <div className="detail-block">
                <span className="detail-label">Key figures</span>
                <p>{entry.key_people}</p>
              </div>
            ) : null}
            {entry.judges ? (
              <div className="detail-block">
                <span className="detail-label">Bench</span>
                <p>{entry.judges}</p>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
