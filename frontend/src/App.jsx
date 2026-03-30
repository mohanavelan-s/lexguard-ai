import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { ProductLayout } from "@/components/layout/ProductLayout";
import { ToastViewport } from "@/components/ui/ToastViewport";
import { useSession } from "@/context/SessionContext";
import DashboardPage from "@/pages/DashboardPage";
import LandingExperiencePage from "@/pages/LandingExperiencePage";
import PricingStudioPage from "@/pages/PricingStudioPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import LegalAdvisorPage from "@/pages/LegalAdvisorPage";
import ScannerPage from "@/pages/ScannerPage";
import CasesPage from "@/pages/CasesPage";
import LawyersPage from "@/pages/LawyersPage";
import CaseLookupPage from "@/pages/CaseLookupPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import UserWorkspacePage from "@/pages/UserWorkspacePage";
import ReviewerQueuePage from "@/pages/ReviewerQueuePage";
import NotFoundPage from "@/pages/NotFoundPage";
import { useUiStore } from "@/store/ui-store";
import ProtectWorkspacePage from "@/pages/ProtectWorkspacePage";

function ThemeSync() {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
  }, [theme]);

  return null;
}

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  return null;
}

function RouteLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="rounded-[32px] border border-border/60 bg-white/85 px-6 py-5 text-sm text-muted-foreground shadow-soft backdrop-blur-xl dark:bg-slate-950/45">
        Loading your LexGuard workspace...
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requiredRole }) {
  const { session, sessionLoading } = useSession();

  if (sessionLoading) {
    return <RouteLoader />;
  }

  if (!session.authenticated) {
    return <Navigate replace to="/login" />;
  }

  if (requiredRole && session.user?.role !== requiredRole) {
    return <Navigate replace to={session.user?.role === "lawyer" ? "/lawyer-dashboard" : "/dashboard"} />;
  }

  return children;
}

function ConnectionBanner() {
  const { backendReachable, sessionError } = useSession();

  if (backendReachable || !sessionError) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-40 mx-auto flex max-w-3xl justify-center px-4">
      <div className="pointer-events-auto rounded-full border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning-foreground shadow-soft backdrop-blur-xl">
        {sessionError}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ThemeSync />
      <ScrollManager />
      <ToastViewport />
      <ConnectionBanner />

      <Routes>
        <Route element={<MarketingLayout />}>
          <Route element={<LandingExperiencePage />} path="/" />
          <Route element={<PricingStudioPage />} path="/pricing" />
        </Route>

        <Route element={<LoginPage />} path="/login" />
        <Route element={<RegisterPage />} path="/register" />

        <Route element={<ProductLayout />}>
          <Route element={<DashboardPage />} path="/dashboard" />
          <Route element={<LegalAdvisorPage />} path="/legal-advisor" />
          <Route element={<ScannerPage />} path="/scanner" />
          <Route element={<CasesPage />} path="/cases" />
          <Route element={<LawyersPage />} path="/lawyers" />
          <Route element={<CaseLookupPage />} path="/case-lookup" />
          <Route element={<ProtectWorkspacePage />} path="/protect" />
          <Route element={<AnalyticsPage />} path="/analytics" />
          <Route
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
            path="/settings"
          />
          <Route
            element={
              <ProtectedRoute requiredRole="user">
                <UserWorkspacePage />
              </ProtectedRoute>
            }
            path="/user-dashboard"
          />
          <Route
            element={
              <ProtectedRoute requiredRole="lawyer">
                <ReviewerQueuePage />
              </ProtectedRoute>
            }
            path="/lawyer-dashboard"
          />
        </Route>

        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </>
  );
}
