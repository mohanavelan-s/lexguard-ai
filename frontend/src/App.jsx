import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import AppShell from "./components/AppShell";
import { useChatling } from "./hooks/useChatling";
import { apiRequest } from "./lib/api";
import CasesPage from "./pages/CasesPage";
import CaseLookupPage from "./pages/CaseLookupPage";
import DashboardPage from "./pages/DashboardPage";
import LawyerDashboardPage from "./pages/LawyerDashboardPage";
import LawyersPage from "./pages/LawyersPage";
import LegalAdvisorPage from "./pages/LegalAdvisorPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectPage from "./pages/ProtectPage";
import RegisterPage from "./pages/RegisterPage";
import ScannerPage from "./pages/ScannerPage";
import SettingsPage from "./pages/SettingsPage";
import UserDashboardPage from "./pages/UserDashboardPage";

const defaultSession = {
  authenticated: false,
  lang: "en",
  user: null
};

function ProtectedRoute({ session, sessionLoading, requiredRole, children }) {
  if (sessionLoading) {
    return <div className="empty-card">Loading your workspace...</div>;
  }

  if (!session.authenticated) {
    return <Navigate replace to="/login" />;
  }

  if (requiredRole && session.user?.role !== requiredRole) {
    return <Navigate replace to={session.user?.role === "lawyer" ? "/lawyer-dashboard" : "/user-dashboard"} />;
  }

  return children;
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

export default function App() {
  const [session, setSession] = useState(defaultSession);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useChatling();

  const refreshSession = async () => {
    try {
      const payload = await apiRequest("/api/session");
      setSession({
        authenticated: Boolean(payload?.authenticated),
        lang: payload?.lang || "en",
        user: payload?.user || null
      });
      setSessionError("");
    } catch (error) {
      setSession(defaultSession);
      setSessionError("The API is not responding yet. Start Flask on port 5000 for local development.");
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <AppShell onSessionChange={refreshSession} session={session}>
      <ScrollToTop />
      {sessionError ? <div className="status-banner status-error">{sessionError}</div> : null}

      <Routes>
        <Route path="/" element={<DashboardPage session={session} />} />
        <Route path="/dashboard" element={<DashboardPage session={session} />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/legal-advisor" element={<LegalAdvisorPage session={session} />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/lawyers" element={<LawyersPage />} />
        <Route path="/case-lookup" element={<CaseLookupPage session={session} />} />
        <Route path="/protect" element={<ProtectPage />} />
        <Route
          path="/login"
          element={<LoginPage onSessionChange={refreshSession} session={session} sessionLoading={sessionLoading} />}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/settings"
          element={
            <ProtectedRoute session={session} sessionLoading={sessionLoading}>
              <SettingsPage onSessionChange={refreshSession} session={session} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute requiredRole="user" session={session} sessionLoading={sessionLoading}>
              <UserDashboardPage session={session} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lawyer-dashboard"
          element={
            <ProtectedRoute requiredRole="lawyer" session={session} sessionLoading={sessionLoading}>
              <LawyerDashboardPage session={session} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}
