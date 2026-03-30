import { Link } from "react-router-dom";

export default function AuthPanel({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="eyebrow">LexGuard AI</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
        {footer}
        <Link className="back-link" to="/">
          Back to dashboard
        </Link>
      </section>
    </div>
  );
}
