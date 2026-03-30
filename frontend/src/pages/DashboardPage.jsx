import { Link } from "react-router-dom";

import SectionHero from "../components/SectionHero";
import { apiProxyNote } from "../lib/api";

const dashboardCards = [
  {
    title: "Legal Advisor",
    description: "Ask plain-language questions and get structured legal guidance.",
    path: "/legal-advisor",
    accent: "teal"
  },
  {
    title: "Past Case Matcher",
    description: "Search landmark cases and inspect matching judgments.",
    path: "/cases",
    accent: "blue"
  },
  {
    title: "Document Scanner",
    description: "Upload legal documents and flag risky clauses quickly.",
    path: "/scanner",
    accent: "amber"
  },
  {
    title: "Lawyer Connect",
    description: "Browse advocates with AI matching and city filters.",
    path: "/lawyers",
    accent: "rose"
  },
  {
    title: "Case Status Lookup",
    description: "Track a case number and save the lookup to your account.",
    path: "/case-lookup",
    accent: "lime"
  },
  {
    title: "Protect Me",
    description: "Run emergency mode with voice triggers, location, and SOS.",
    path: "/protect",
    accent: "alert"
  }
];

export default function DashboardPage({ session }) {
  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="36-hour hackathon edition"
        title="One legal safety dashboard, now ready for a Vite-powered cloud UI."
        description="We moved the app away from Flask page rendering and toward a frontend that can scale cleanly on cloud deploys without losing the fast feature set you already built."
        actions={
          <>
            <Link className="primary-link" to="/legal-advisor">
              Open Legal Advisor
            </Link>
            <span className="micro-note">
              {session.authenticated ? `Signed in as ${session.user?.role}` : apiProxyNote}
            </span>
          </>
        }
      />

      <section className="feature-grid">
        {dashboardCards.map((card) => (
          <Link key={card.path} className={`feature-card ${card.accent}`} to={card.path}>
            <div className="feature-card-top">
              <span className="pill">{card.title}</span>
            </div>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
