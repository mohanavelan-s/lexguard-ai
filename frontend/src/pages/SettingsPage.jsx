import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PageTransition } from "@/components/layout/PageTransition";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSession } from "@/context/SessionContext";
import { fetchSettings, updateSettings } from "@/lib/api";
import { useUiStore } from "@/store/ui-store";

const initialForm = {
  name: "",
  email: "",
  new_password: "",
  confirm_password: ""
};

export default function SettingsPage() {
  const { refreshSession, session } = useSession();
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const pushToast = useUiStore((state) => state.pushToast);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await fetchSettings();
        const user = payload?.user || session.user;
        setForm((current) => ({
          ...current,
          name: user?.name || "",
          email: user?.email || ""
        }));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [session.user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await updateSettings(form);
      await refreshSession();
      pushToast({
        title: "Profile updated",
        description: "Your account settings are saved.",
        tone: "success"
      });
      setForm((current) => ({
        ...current,
        new_password: "",
        confirm_password: ""
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="space-y-8">
      <SectionHeading
        description="Manage identity, UI preferences, billing posture, and the core settings that make the workspace feel like a deployable SaaS product."
        eyebrow="Settings"
        title="Profile, preferences, and billing"
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="rounded-[32px]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Profile</p>
              <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Account details</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Full name</label>
              <InputField disabled={fetching} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} value={form.name} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Email</label>
              <InputField
                disabled={fetching}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                type="email"
                value={form.email}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">New password</label>
                <InputField
                  onChange={(event) => setForm((current) => ({ ...current, new_password: event.target.value }))}
                  type="password"
                  value={form.new_password}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Confirm password</label>
                <InputField
                  onChange={(event) => setForm((current) => ({ ...current, confirm_password: event.target.value }))}
                  type="password"
                  value={form.confirm_password}
                />
              </div>
            </div>

            {error ? <div className="rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger-foreground">{error}</div> : null}

            <Button className="w-full sm:w-auto" disabled={loading} type="submit">
              {loading ? "Saving..." : "Save profile"}
            </Button>
          </form>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-[32px]">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Preferences</p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Workspace modes</h3>
              </div>
              <div className="space-y-3">
                <button
                  className={`flex w-full items-center justify-between rounded-3xl border px-4 py-4 text-left ${theme === "dark" ? "border-brand/30 bg-brand/10" : "border-border/70 bg-white/70 dark:bg-white/[0.03]"}`}
                  onClick={() => setTheme("dark")}
                  type="button"
                >
                  <span>
                    <span className="block font-medium text-foreground">Dark mode</span>
                    <span className="text-sm text-muted-foreground">High-contrast workspace for focused sessions</span>
                  </span>
                  {theme === "dark" ? <Badge variant="brand">Active</Badge> : null}
                </button>
                <button
                  className={`flex w-full items-center justify-between rounded-3xl border px-4 py-4 text-left ${theme === "light" ? "border-brand/30 bg-brand/10" : "border-border/70 bg-white/70 dark:bg-white/[0.03]"}`}
                  onClick={() => setTheme("light")}
                  type="button"
                >
                  <span>
                    <span className="block font-medium text-foreground">Light mode</span>
                    <span className="text-sm text-muted-foreground">Soft, premium canvas for sharing and collaboration</span>
                  </span>
                  {theme === "light" ? <Badge variant="brand">Active</Badge> : null}
                </button>
              </div>
            </div>
          </Card>

          <Card className="rounded-[32px]">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Billing snapshot</p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Current plan</h3>
              </div>
              <div className="rounded-3xl border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{session.authenticated ? "Pro workspace" : "Free preview"}</p>
                    <p className="text-sm text-muted-foreground">Billing UI ready for Stripe or Razorpay wiring</p>
                  </div>
                  <Badge variant="brand">{session.user?.role || "Guest"}</Badge>
                </div>
              </div>
              <Link to="/pricing">
                <Button className="w-full" variant="secondary">
                  Open billing page
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
