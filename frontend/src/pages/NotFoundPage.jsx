import { Link } from "react-router-dom";

import SectionHero from "../components/SectionHero";

export default function NotFoundPage() {
  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Route not found"
        title="That page is outside the case file."
        description="The new Vite frontend is handling navigation now, and this path does not map to a live screen yet."
        actions={
          <Link className="primary-link" to="/">
            Return to dashboard
          </Link>
        }
      />
    </div>
  );
}
