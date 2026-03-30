import { useState } from "react";
import { Link } from "react-router-dom";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";
import { registerUser } from "@/lib/api";
import { useUiStore } from "@/store/ui-store";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "user"
};

export default function RegisterPage() {
  const pushToast = useUiStore((state) => state.pushToast);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = await registerUser(form);
      setSuccess(payload.message || "Account created. You can sign in now.");
      setForm(initialForm);
      pushToast({
        title: "Account created",
        description: "Your workspace is ready. Sign in to continue.",
        tone: "success"
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell description="Create a polished SaaS workspace account with support for standard users and lawyer reviewers." title="Create your LexGuard account">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Full name</label>
          <InputField onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Mohanavelan S" value={form.name} />
        </div>
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
            placeholder="Choose a secure password"
            type="password"
            value={form.password}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Role</label>
          <select
            className="h-12 w-full rounded-2xl border border-border/70 bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-brand/40 focus:ring-2 focus:ring-brand/10 dark:bg-white/[0.03]"
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
            value={form.role}
          >
            <option value="user">User workspace</option>
            <option value="lawyer">Lawyer reviewer</option>
          </select>
        </div>

        {success ? <div className="rounded-3xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success-foreground">{success}</div> : null}
        {error ? <div className="rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger-foreground">{error}</div> : null}

        <Button className="w-full" size="lg" type="submit">
          {loading ? "Creating account..." : "Create account"}
        </Button>

        <p className="text-sm text-muted-foreground">
          Already have access?{" "}
          <Link className="font-medium text-brand" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
