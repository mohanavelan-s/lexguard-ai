import { Link, useLocation, useNavigate } from "react-router-dom";

import { apiRequest } from "../lib/api";

export default function AppShell({ children, session, onSessionChange }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthScreen = ["/login", "/register"].includes(location.pathname);

  const handleLogout = async () => {
    await apiRequest("/api/logout", { method: "POST" });
    await onSessionChange();
    navigate("/");
  };

  const handleLangChange = async (event) => {
    await apiRequest("/set-language", { method: "POST", body: { lang: event.target.value } });
    await onSessionChange();
  };

  return (
    <div className="app-shell">
      {!isAuthScreen ? (
        <header className="topbar">
          <Link className="brand" to="/">
            <span className="brand-mark">LG</span>
            <span>
              <strong>LexGuard AI</strong>
              <small>Cloud-ready legal safety platform</small>
            </span>
          </Link>

          <nav className="topnav">
            <Link to="/legal-advisor">Advisor</Link>
            <Link to="/cases">Cases</Link>
            <Link to="/scanner">Scanner</Link>
            <Link to="/lawyers">Lawyers</Link>
            <Link to="/case-lookup">Lookup</Link>
            <Link to="/protect">Protect</Link>
          </nav>

          <div className="topbar-actions">
            <label className="lang-pill">
              <span>Lang</span>
              <select value={session.lang || "en"} onChange={handleLangChange}>
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="ta">TA</option>
              </select>
            </label>
            {session.authenticated ? (
              <>
                <span className="welcome-chip">Hi, {session.user?.name}</span>
                <Link to={session.user?.role === "lawyer" ? "/lawyer-dashboard" : "/user-dashboard"}>
                  Dashboard
                </Link>
                <Link to="/settings">Settings</Link>
                <button className="ghost-button" onClick={handleLogout} type="button">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </header>
      ) : null}

      <main className="page-shell">{children}</main>
    </div>
  );
}
