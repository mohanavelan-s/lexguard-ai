import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { loginUser } from "@/lib/api";
import { useSession } from "@/context/SessionContext";
import { useUiStore } from "@/store/ui-store";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refreshSession, session, sessionLoading } = useSession();
  const pushToast = useUiStore((state) => state.pushToast);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!sessionLoading && session.authenticated) {
    return <Navigate replace to={session.user?.role === "lawyer" ? "/lawyer-dashboard" : "/dashboard"} />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = await loginUser(form);
      await refreshSession();
      pushToast({
        title: "Signed in",
        description: "Your legal workspace is ready.",
        tone: "success"
      });
      navigate(payload?.user?.role === "lawyer" ? "/lawyer-dashboard" : "/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell description="Log in to access saved legal history, reviewer workflows, billing, and your personalized AI workspace." title="Welcome back">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Email</label>
          <InputField
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            type="email"
            value={form.email}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Password</label>
          <InputField
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Enter your password"
            type="password"
            value={form.password}
          />
        </div>

        {error ? <div className="rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger-foreground">{error}</div> : null}

        <Button className="w-full" size="lg" type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link className="font-medium text-brand" to="/register">
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
