import { useState } from "react";

import SectionHero from "../components/SectionHero";
import { lawyers } from "../data/lawyers";

function scoreLawyer(lawyer, brief, cityFilter, specFilter) {
  let match = 50;
  const normalizedBrief = brief.toLowerCase();

  lawyer.tags.forEach((tag) => {
    if (normalizedBrief.includes(tag)) {
      match += 15;
    }
  });

  if (normalizedBrief.includes(lawyer.spec.toLowerCase().split(" ")[0])) {
    match += 20;
  }

  if (cityFilter && lawyer.city.toLowerCase().includes(cityFilter.toLowerCase())) {
    match += 10;
  }

  if (specFilter && lawyer.spec === specFilter) {
    match += 12;
  }

  return Math.min(match, 99);
}

export default function LawyersPage() {
  const [brief, setBrief] = useState("");
  const [city, setCity] = useState("");
  const [specialization, setSpecialization] = useState("");

  const rankedLawyers = lawyers
    .filter((lawyer) => {
      const matchesCity = !city || lawyer.city.toLowerCase().includes(city.toLowerCase());
      const matchesSpec = !specialization || lawyer.spec === specialization;
      return matchesCity && matchesSpec;
    })
    .map((lawyer) => ({
      ...lawyer,
      match: scoreLawyer(lawyer, brief, city, specialization)
    }))
    .sort((left, right) => right.match - left.match);

  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Lawyer connect"
        title="Match legal briefs to advocates with a faster client-side ranking engine."
        description="This page moved cleanly into the frontend because it is a perfect fit for instant filtering, visual ranking, and cloud-friendly static assets."
      />

      <section className="section-card">
        <div className="search-grid">
          <label className="field-block span-two">
            <span>Case brief</span>
            <textarea
              className="textarea-field"
              onChange={(event) => setBrief(event.target.value)}
              placeholder="Describe the issue: arrest at police station, property eviction in Chennai, online fraud, divorce custody..."
              rows={3}
              value={brief}
            />
          </label>
          <label className="field-block">
            <span>City</span>
            <input
              className="input-field"
              onChange={(event) => setCity(event.target.value)}
              placeholder="Chennai, Delhi, Bangalore..."
              value={city}
            />
          </label>
          <label className="field-block">
            <span>Specialization</span>
            <select
              className="input-field"
              onChange={(event) => setSpecialization(event.target.value)}
              value={specialization}
            >
              <option value="">Any specialization</option>
              {[...new Set(lawyers.map((lawyer) => lawyer.spec))].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="lawyer-grid">
        {rankedLawyers.map((lawyer) => (
          <article className="lawyer-card" key={lawyer.name}>
            <div className="lawyer-top">
              <img alt={lawyer.name} className="lawyer-avatar" src={lawyer.img} />
              <div>
                <div className="pill subtle">Verified advocate</div>
                <h2>{lawyer.name}</h2>
                <p>
                  {lawyer.spec} in {lawyer.city}
                </p>
              </div>
            </div>

            <div className="match-meter">
              <div className="section-heading compact">
                <span>AI match score</span>
                <strong>{lawyer.match}%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${lawyer.match}%` }} />
              </div>
            </div>

            <div className="stats-grid">
              <div>
                <span className="detail-label">Experience</span>
                <p>{lawyer.exp}</p>
              </div>
              <div>
                <span className="detail-label">Cases handled</span>
                <p>{lawyer.cases}</p>
              </div>
              <div>
                <span className="detail-label">Typical fee</span>
                <p>{lawyer.fees}</p>
              </div>
            </div>

            <div className="tag-row">
              {lawyer.tags.slice(0, 4).map((tag) => (
                <span className="tag-chip" key={tag}>
                  {tag}
                </span>
              ))}
            </div>

            <button
              className="primary-button"
              onClick={() => window.alert(`Consultation request sent to ${lawyer.name}.`)}
              type="button"
            >
              Book consultation
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
